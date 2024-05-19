import express, { Express, Request, Response, json } from 'express';
import { Db, MongoClient, WithId } from 'mongodb';
import { get, reject } from 'lodash';
import { DayEntry } from './models/History/DayEntry';
import { MonthEntry } from './models/History/MonthEntry';
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { PowerDocument } from './models/PowerDocument';
import { InfluxResult } from './models/InfluxResult';
import { CurrentEntry } from './models/CurrentEntry';
import { HistoryResponse } from './models/HistoryResponse';
import { NotificationClient } from './models/NotifcationClient';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { messaging } from 'firebase-admin';
import { CurrentField } from './models/CurrentField';
import dotenv from 'dotenv'
import _ from 'lodash';
import { DOMParser } from '@xmldom/xmldom';
import { YearEntry } from './models/History/YearEntry';
import { TotalEntry } from './models/History/TotalEntry';
import { EnergyPrice } from './models/EnergyPrice';

//E-Mail Monate
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
dotenv.config();

const INFLUXDB_TOKEN = process.env.INFLUX_TOKEN;
const url = process.env.INFLUX_URL;
const INFLUX_ORG = process.env.INFLUX_ORG;
const INFLUX_BUCKET = process.env.INFLUX_BUCKET;

const influxDB = new InfluxDB({
    url: url ?? '',
    token: INFLUXDB_TOKEN
})
const writeApi = influxDB.getWriteApi(INFLUX_ORG ?? '', INFLUX_BUCKET ?? '', 'ns')
const queryApi = influxDB.getQueryApi(INFLUX_ORG ?? '')

var document = new CurrentEntry(
    null,
    null,
    null,
    null,
    null,
);
//Initialize Express Server
var cors = require('cors');
var cron = require('node-cron');

// var admin = initializeApp({
//     credential: applicationDefault()
// });
const app: Express = express();
app.set('trust proxy', 1);

async function calculateUsage() {
    if (document.delivery?.value == 0) {
        let newUsageValue = (document?.production?.value ?? 0) + (document?.consumption?.value ?? 0);
        if (newUsageValue > 0) {
            document.usage = new CurrentField(new Date(), newUsageValue, document.usage?.time ?? new Date());
        }
    } else {
        let newUsageValue = (document.production?.value ?? 0) - (document.delivery?.value ?? 0);
        if (newUsageValue > 0) {
            document.usage = new CurrentField(new Date(), newUsageValue, document.usage?.time ?? new Date());
        }
    }
}

async function inserttoMongo() {
    if (document.consumption && document.delivery && document.production && document.usage) {
        // console.log("logging to current")
        await mongo.collection<CurrentEntry>('current').findOneAndUpdate({}, { $set: document }, { upsert: true });
    } else {
        console.log("Not logging to current due to missing data");
    }
    if (document.frequency) {
        const difference = new Date().getTime() - document.frequency.time.getTime();
        if ((new Date().getTime() - document.frequency.time.getTime()) / (1000 * 60) < 2) {
            var frequencyPoint = new Point('frequency').floatField('value', document.frequency?.value);
            writeApi.writePoint(frequencyPoint);
            await mongo.collection<CurrentEntry>('current').findOneAndUpdate({}, { $set: { frequency: document.frequency } }, { upsert: true });
        }
    }
}

async function insertToInflux() {
    if (document.production == null) {
        document.production = new CurrentField(new Date(), 0, new Date());
    }
    if (document.consumption && document.delivery && document.production && document.usage) {
        var deliveryPoint = new Point('delivery').floatField('value', document.delivery.value);
        var consumptionPoint = new Point('consumption').floatField('value', document.consumption.value);
        var productionPoint = new Point('production').floatField('value', document.production.value);
        var usagePoint = new Point('usage').floatField('value', document.usage.value);
        writeApi.writePoint(deliveryPoint);
        writeApi.writePoint(consumptionPoint);
        writeApi.writePoint(productionPoint);
        writeApi.writePoint(usagePoint);
    } else {
        console.log("Not logging to influx due to missing data");
    }
}

app.use(cors({
    origin: '*',
    credentials: true,
}))

var rateLimit = require("express-rate-limit");
var limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100
})
app.use(limiter);

//Initialize MongoDB
function initMongo(): Db {
    var client = new MongoClient(process.env.MONGO_STRING ?? '');
    const db = client.db("PVMonitor");
    return db;
}

const mongo = initMongo();

function getFromDay(measurement: string, day: Date): Promise<Array<InfluxResult>> {
    return new Promise<Array<InfluxResult>>((resolve, reject) => {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        //|> range(start: "` + moment(today).format("dd.mm.yy hh:mm:ssZ") + `, stop: "` + moment(new Date()).format("dd.mm.yy hh:mm:ssZ") + `")
        const fluxQuery = `from(bucket: "` + INFLUX_BUCKET + `")
        |> range(start: 0)
        |> filter(fn: (r) => r._measurement == "` + measurement + `")
        |> filter(fn: (r) => r._field == "value")`;
        var points: InfluxResult[] = [];
        queryApi.queryRows(fluxQuery, {
            next(row: any, tableMeta: any) {
                const o = tableMeta.toObject(row) as InfluxResult;
                points.push(o)
            }, complete() {
                var filtered = points.filter(point => {
                    // console.log(new Date(point._time).getUTCDate() + '==' + day.getUTCDate())
                    // console.log(day)
                    return new Date(point._time).getDate() == day.getDate()
                });
                // console.log(filtered.length)
                resolve(filtered)
            },
            error(error) {
                console.log(error)
                reject(error);
            }
        })

    })
}

function calculateWh(startTime: Date, power: number): number {
    let now = new Date();
    // console.log("nowtime: " + now.getTime());
    // console.log("constime: " + startTime.getTime());
    let timeDifference = (now.getTime() - (startTime.getTime() ?? new Date().getTime())) / 1000;
    if (timeDifference > 90) {
        console.log('Not logging to log due to too huge time difference!');
        return 0;
    }
    else {
        let timeDifferenceinSeconds = timeDifference / 3600;
        // console.log("passedW: " + power);
        // console.log("difference" + timeDifferenceinSeconds);
        let addedWh = (power ?? 0) * timeDifferenceinSeconds;
        return addedWh;
    }
}


async function sendAlert(message: string, title: string) {
    var cursor = mongo.collection<NotificationClient>("clients").find();

    var tokens = await cursor.map(doc => {
        return doc.token;
    }).toArray();
    messaging().sendEachForMulticast({
        tokens: tokens,
        notification: {
            title: title,
            body: message
        }
    }).then((response: any) => {
    }).catch((error: any) => {
        console.log(error);
    })
}

app.get('/api/now/', async (req: Request, res: Response) => {
    var result = await mongo.collection<CurrentEntry>('current').findOne();
    if (result != null) {
        var response = new CurrentEntry(result.production, result.frequency, result.consumption, result.delivery, result.usage);
        res.send(response)
    } else {
        console.log("no result")
        res.statusCode = 500;
        res.send(null);
    }
})

app.post('/upload', express.json({ type(req) { return true } }), async (req: Request, res: Response) => {
    var body = req.body as PowerDocument;
    document.production = new CurrentField(new Date(), Number(body.Body.PAC.Values[1]), document.production?.time ?? new Date());
    calculateUsage();
    let start = new Date();
    start.setHours(0, 0, 0);

    let end = new Date();
    end.setHours(23, 59, 59);
    var entryCursor = mongo.collection<DayEntry>('DayEntry').find();
    let dayEntries = await entryCursor.map((doc: WithId<DayEntry>) => {
        let lastDate = new Date(doc.lastupdated);
        if (lastDate.getTime() > start.getTime() && lastDate.getTime() < end.getTime()) {
            return doc;
        }
    }).toArray();
    dayEntries = dayEntries.filter(doc => doc != null && doc != undefined);
    let dayEntry = Object.values(dayEntries)[0];
    if (dayEntry) {
        dayEntry.produced = body.Body.DAY_ENERGY.Values[1];
        dayEntry.usage = dayEntry.produced - dayEntry.delivery + dayEntry.consumption;
        dayEntry.lastupdated = new Date().getTime();
        await mongo.collection<DayEntry>('DayEntry').updateOne({ _id: dayEntry._id }, { $set: dayEntry });
    } else {
        let newcurrentDayEntry = new DayEntry(body.Body.DAY_ENERGY.Values[1], 0, 0, 0, new Date().getTime());
        await mongo.collection<DayEntry>('DayEntry').insertOne(newcurrentDayEntry);
    }
    res.end();
});

app.post('/uploadfreq', express.text({ type: '*/*' }), async (req: Request, res: Response) => {
    var xmldocument = new DOMParser().parseFromString(req.body, 'application/xml');
    if (xmldocument) {
        var frequency = Number(xmldocument.getElementById("Hz")?.lastChild?.nodeValue ?? "-1");
        if (frequency != -1) {
            document.frequency = new CurrentField(new Date(), frequency, document.frequency?.time ?? new Date());
            if (frequency < 49.85) {
                if (frequency < 49.8) {
                    sendAlert("Frequency is now at " + frequency.toFixed(2) + "Hz", "Power Grid Frequency has passed critical limit!");
                } else {
                    sendAlert("Frequency is now at " + frequency.toFixed(2) + "Hz", "Power Grid Frequency near tolerance limit!");
                }
            }
        }
    }
    res.end();
});

app.post('/uploadconsumption', express.text({ type: '*/*' }), async (req: Request, res: Response) => {
    var consumption = Number(req.body);
    document.consumption = new CurrentField(new Date(), consumption, document.consumption?.time ?? new Date());
    calculateUsage();
    var consumptionAdd = document.consumption ? calculateWh(document.consumption?.oldTime ?? new Date(), document.consumption?.value ?? 0) : 0;

    if (consumptionAdd > 0) {
        let start = new Date();
        start.setHours(0);
        start.setMinutes(0);
        start.setSeconds(0);

        let end = new Date();
        end.setHours(23, 59, 59);
        var entryCursor = mongo.collection<DayEntry>('DayEntry').find();
        let dayEntries = await entryCursor.map((doc: WithId<DayEntry>) => {
            let lastDate = new Date(doc.lastupdated);
            if (lastDate.getTime() > start.getTime() && lastDate.getTime() < end.getTime()) {
                return doc;
            }
        }).toArray();
        dayEntries = dayEntries.filter(doc => doc != null && doc != undefined);
        let dayEntry = Object.values(dayEntries)[0];
        if (dayEntry) {
            dayEntry.consumption = dayEntry.consumption + consumptionAdd;
            dayEntry.usage = dayEntry.produced - dayEntry.delivery + dayEntry.consumption;
            dayEntry.lastupdated = new Date().getTime();
            await mongo.collection<DayEntry>('DayEntry').updateOne({ _id: dayEntry._id }, { $set: dayEntry });
        } else {
            let newcurrentDayEntry = new DayEntry(0, consumptionAdd, 0, 0, new Date().getTime());
            console.log("inserting consumption")
            await mongo.collection<DayEntry>('DayEntry').insertOne(newcurrentDayEntry);
        }
    }
    res.statusCode = 200;
    res.send();
})

app.post('/uploaddelivery', express.text({ type: '*/*' }), async (req: Request, res: Response) => {
    var delivery = Number(req.body);
    document.delivery = new CurrentField(new Date(), delivery, document.delivery?.time ?? new Date());
    calculateUsage();
    var deliveryAdd = document.delivery ? calculateWh(document.delivery?.oldTime ?? new Date(), document.delivery?.value ?? 0) : 0;
    if (deliveryAdd > 0) {
        let start = new Date();
        start.setHours(0);
        start.setMinutes(0);
        start.setSeconds(0);

        let end = new Date();
        end.setHours(23, 59, 59);
        var entryCursor = mongo.collection<DayEntry>('DayEntry').find();
        let dayEntries = await entryCursor.map((doc: WithId<DayEntry>) => {
            let lastDate = new Date(doc.lastupdated);
            if (lastDate.getTime() > start.getTime() && lastDate.getTime() < end.getTime()) {
                return doc;
            }
        }).toArray();
        dayEntries = dayEntries.filter(doc => doc != null && doc != undefined);
        let dayEntry = Object.values(dayEntries)[0];
        if (dayEntry) {
            dayEntry.delivery = dayEntry.delivery + deliveryAdd;
            dayEntry.usage = dayEntry.produced - dayEntry.delivery + dayEntry.consumption;
            dayEntry.lastupdated = new Date().getTime();
            await mongo.collection<DayEntry>('DayEntry').updateOne({ _id: dayEntry._id }, { $set: dayEntry });
        } else {
            let newcurrentDayEntry = new DayEntry(0, 0, deliveryAdd, 0, new Date().getTime());
            console.log("inserting consumption")
            await mongo.collection<DayEntry>('DayEntry').insertOne(newcurrentDayEntry);
        }
    }
    res.statusCode = 200;
    res.end();
})

app.get('/api/day/:unix', async (req: Request, res: Response) => {
    var myDate = new Date(Number(req.params.unix));
    var prodEntries = await getFromDay('production', myDate);
    var usageEntries = await getFromDay('usage', myDate);
    var response = new HistoryResponse(prodEntries, usageEntries);
    res.send(response);
})

app.get('/api/month/:unix', async (req: Request, res: Response) => {
    let startLimit = new Date(Number(req.params.unix));
    startLimit.setDate(1);
    startLimit.setHours(0, 0, 0);

    let pseudoEndLimit = new Date(Number(req.params.unix));
    let endLimit = new Date(pseudoEndLimit.getFullYear(), pseudoEndLimit.getMonth() + 1, 0, 23, 59, 59);

    var entryCursor = mongo.collection<MonthEntry>('MonthEntry').find();
    let monthEntries = await entryCursor.map((doc: WithId<MonthEntry>) => {
        let lastDate = new Date(doc.lastupdated);
        if (lastDate.getTime() > startLimit.getTime() && lastDate.getTime() < endLimit.getTime()) {
            return doc;
        }
    }).toArray();
    monthEntries = monthEntries.filter(doc => doc != null && doc != undefined);
    if (monthEntries.length == 0) {
        let newMonthEntry = new MonthEntry(new Date().getTime(), 0, 0, 0, 0);
        res.send(newMonthEntry);
    } else {
        res.send(monthEntries[0]);
    }
})

app.get('/api/year/:unix', async (req: Request, res: Response) => {
    let startLimit = new Date(Number(req.params.unix));
    startLimit.setDate(1);
    startLimit.setMonth(0);
    startLimit.setHours(0, 0, 0);

    let pseudoEndLimit = new Date(Number(req.params.unix));
    let endLimit = new Date(pseudoEndLimit.getFullYear(), 12, 31, 23, 59, 59);

    var entryCursor = mongo.collection<YearEntry>('YearEntry').find();
    let yearEntries = await entryCursor.map((doc: WithId<YearEntry>) => {
        let lastDate = new Date(doc.lastupdated);
        if (lastDate.getTime() > startLimit.getTime() && lastDate.getTime() < endLimit.getTime()) {
            return doc;
        }
    }).toArray();
    yearEntries = yearEntries.filter(doc => doc != null && doc != undefined);
    res.send(yearEntries[0]);
})

app.get('/api/fullday/:unix', async (req: Request, res: Response) => {
    var dayDate = new Date(Number(req.params.unix));
    var startLimit = new Date(Number(req.params.unix));
    startLimit.setHours(0, 0, 0);
    var endLimit = new Date(Number(req.params.unix));
    endLimit.setHours(23, 59, 59);
    var entryCursor = mongo.collection<DayEntry>('DayEntry').find();
    let dayEntries = await entryCursor.map((doc: WithId<DayEntry>) => {
        let lastDate = new Date(doc.lastupdated);
        if (lastDate.getTime() > startLimit.getTime() && lastDate.getTime() < endLimit.getTime()) {
            return doc;
        }
    }).toArray();
    dayEntries = dayEntries.filter(doc => doc != null && doc != undefined);
    let dayEntry = Object.values(dayEntries)[0];
    res.send(dayEntry)
})

app.get('/api/fullMonth/:unix', async (req: Request, res: Response) => {
    let startLimit = new Date(Number(req.params.unix));
    startLimit.setDate(1);
    startLimit.setHours(0, 0, 0);

    let pseudoEndLimit = new Date(Number(req.params.unix));
    let endLimit = new Date(pseudoEndLimit.getFullYear(), pseudoEndLimit.getMonth() + 1, 0, 23, 59, 59);

    var entryCursor = mongo.collection<DayEntry>('DayEntry').find();
    let dayEntries = await entryCursor.map((doc: WithId<DayEntry>) => {
        let lastDate = new Date(doc.lastupdated);
        if (lastDate.getTime() > startLimit.getTime() && lastDate.getTime() < endLimit.getTime()) {
            return doc;
        }
    }).toArray();
    dayEntries = dayEntries.filter(doc => doc != null && doc != undefined);

    res.send(dayEntries);
})

app.get('/api/fullYear/:unix', async (req: Request, res: Response) => {
    let startLimit = new Date(Number(req.params.unix));
    startLimit.setDate(1);
    startLimit.setMonth(0);
    startLimit.setHours(0, 0, 0);

    let pseudoEndLimit = new Date(Number(req.params.unix));
    let endLimit = new Date(pseudoEndLimit.getFullYear(), 12, 31, 23, 59, 59);

    var entryCursor = mongo.collection<MonthEntry>('MonthEntry').find();
    let yearEntries = await entryCursor.map((doc: WithId<MonthEntry>) => {
        let lastDate = new Date(doc.lastupdated);
        if (lastDate.getTime() > startLimit.getTime() && lastDate.getTime() < endLimit.getTime()) {
            return doc;
        }
    }).toArray();
    yearEntries = yearEntries.filter(doc => doc != null && doc != undefined);
    res.send(yearEntries);
})

app.get('/api/total', async (req: Request, res: Response) => {
    let entryCursor = mongo.collection<YearEntry>('YearEntry').find();
    let yearEntries = await entryCursor.map((doc: WithId<YearEntry>) => doc).toArray();
    res.send(yearEntries);
})

app.get('/api/freqday/:unix', async (req: Request, res: Response) => {
    var myDate = new Date(Number(req.params.unix));
    var freqEntries = await getFromDay('frequency', myDate);
    res.send(freqEntries)
});

app.get('/api/allDays', async (req: Request, res: Response) => {
    var cursor = mongo.collection<DayEntry>('DayEntry').find();
    var dayEntries = await cursor.map(doc => {
        return doc;
    }).toArray();
    res.send(dayEntries);
});

app.post('/api/createElectricyPrice', express.json({ type: '*/*' }), async (req: Request, res: Response) => {
    var body = req.body;
    console.log(body);
    var start = body.start;
    var end = body.end;
    var type = body.type;
    var pricePerKwH = body.pricePerKwH;
    var newElectricityPrice = new EnergyPrice(start, end, type, pricePerKwH);
    await mongo.collection<EnergyPrice>('electricityPrices').insertOne(newElectricityPrice);
    res.end();
});

app.get('/api/electricityPrices', async (req: Request, res: Response) => {
    var cursor = mongo.collection<EnergyPrice>('electricityPrices').find();
    var prices = await cursor.map(doc => {
        return doc;
    }).toArray();
    res.send(prices);
});

// app.post('/api/registerNotification', express.json({ type: '*/*' }), async (req: Request, res: Response) => {
//     var client = req.body as NotificationClient;
//     mongo.collection<NotificationClient>('clients').updateOne({ token: client.token }, { $set: client }, { upsert: true });
//     res.end();
// })


function calculateMonth() {
    let start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0);

    let pseudoEndLimit = new Date();

    let end = new Date(pseudoEndLimit.getFullYear(), pseudoEndLimit.getMonth() + 1, 0, 23, 59, 59);

    var entryCursor = mongo.collection<DayEntry>('DayEntry').find();
    entryCursor.map((doc: WithId<DayEntry>) => {
        let lastDate = new Date(doc.lastupdated);
        if (lastDate.getTime() > start.getTime() && lastDate.getTime() < end.getTime()) {
            return doc;
        }
    }).toArray().then(async (dayEntries) => {
        dayEntries = dayEntries.filter(doc => doc != null && doc != undefined);
        var monthEntryCursor = mongo.collection<MonthEntry>('MonthEntry').find();
        let monthEntries = await monthEntryCursor.map((doc: WithId<MonthEntry>) => {
            let lastDate = new Date(doc.lastupdated);
            if (lastDate.getTime() > start.getTime() && lastDate.getTime() < end.getTime()) {
                return doc;
            }
        }).toArray();
        monthEntries = monthEntries.filter(doc => doc != null && doc != undefined);
        if (monthEntries.length == 0) {
            let newMonthEntry = new MonthEntry(new Date().getTime(), 0, 0, 0, 0);
            dayEntries.forEach((dayEntry) => {
                newMonthEntry.produced += dayEntry?.produced ?? 0;
                newMonthEntry.consumption += dayEntry?.consumption ?? 0;
                newMonthEntry.delivery += dayEntry?.delivery ?? 0;
                newMonthEntry.usage += dayEntry?.usage ?? 0;
            })
            await mongo.collection<MonthEntry>('MonthEntry').insertOne(newMonthEntry);
        } else {
            let monthEntry = monthEntries[0];
            if (monthEntry) {
                monthEntry.produced = 0;
                monthEntry.consumption = 0;
                monthEntry.delivery = 0;
                monthEntry.usage = 0;
                dayEntries.forEach((dayEntry) => {
                    if (monthEntry) {
                        monthEntry.produced += dayEntry?.produced ?? 0;
                        monthEntry.consumption += dayEntry?.consumption ?? 0;
                        monthEntry.delivery += dayEntry?.delivery ?? 0;
                        monthEntry.usage += dayEntry?.usage ?? 0;
                    }
                })
                monthEntry.lastupdated = new Date().getTime();
                await mongo.collection<MonthEntry>('MonthEntry').updateOne({ _id: monthEntry._id }, { $set: monthEntry });
            }
        }
    })
}

function calculateYear() {
    let start = new Date();
    start.setDate(1);
    start.setMonth(0);
    start.setHours(0, 0, 0);

    let pseudoEndLimit = new Date();

    let end = new Date(pseudoEndLimit.getFullYear(), 12, 0, 23, 59, 59);

    var entryCursor = mongo.collection<MonthEntry>('MonthEntry').find();
    entryCursor.map((doc: WithId<MonthEntry>) => {
        let lastDate = new Date(doc.lastupdated);
        if (lastDate.getTime() > start.getTime() && lastDate.getTime() < end.getTime()) {
            return doc;
        }
    }).toArray().then(async (monthEntries) => {
        monthEntries = monthEntries.filter(doc => doc != null && doc != undefined);
        var yearEntryCursor = mongo.collection<YearEntry>('YearEntry').find();
        let yearEntries = await yearEntryCursor.map((doc: WithId<YearEntry>) => {
            let lastDate = new Date(doc.lastupdated);
            if (lastDate.getTime() > start.getTime() && lastDate.getTime() < end.getTime()) {
                return doc;
            }
        }).toArray();
        yearEntries = yearEntries.filter(doc => doc != null && doc != undefined);
        if (yearEntries.length == 0) {
            let newYearEntry = new YearEntry(new Date().getTime(), 0, 0, 0, 0);
            monthEntries.forEach((monthEntry) => {
                newYearEntry.produced += monthEntry?.produced ?? 0;
                newYearEntry.consumption += monthEntry?.consumption ?? 0;
                newYearEntry.delivery += monthEntry?.delivery ?? 0;
                newYearEntry.usage += monthEntry?.usage ?? 0;
            })
            await mongo.collection<YearEntry>('YearEntry').insertOne(newYearEntry);
        } else {
            let yearEntry = yearEntries[0];
            if (yearEntry) {
                yearEntry.produced = 0;
                yearEntry.consumption = 0;
                yearEntry.delivery = 0;
                yearEntry.usage = 0;
                monthEntries.forEach((monthEntry) => {
                    if (yearEntry) {
                        yearEntry.produced += monthEntry?.produced ?? 0;
                        yearEntry.consumption += monthEntry?.consumption ?? 0;
                        yearEntry.delivery += monthEntry?.delivery ?? 0;
                        yearEntry.usage += monthEntry?.usage ?? 0;
                    }
                })
                yearEntry.lastupdated = new Date().getTime();
                await mongo.collection<YearEntry>('YearEntry').updateOne({ _id: yearEntry._id }, { $set: yearEntry });
            }
        }
    })
}

function calculateTotalWithoutLimit() {
    var entryCursor = mongo.collection<YearEntry>('YearEntry').find();
    entryCursor.map((doc: WithId<YearEntry>) => {
        return doc;
    }).toArray().then(async (yearEntries) => {
        yearEntries = yearEntries.filter(doc => doc != null && doc != undefined);
        var totalEntryCursor = mongo.collection<TotalEntry>('TotalEntry').find();
        let totalEntries = await totalEntryCursor.map((doc: WithId<TotalEntry>) => {
            return doc;
        }).toArray();
        totalEntries = totalEntries.filter(doc => doc != null && doc != undefined);
        if (totalEntries.length == 0) {
            let newTotalEntry = new TotalEntry(0, 0, 0, 0);
            yearEntries.forEach((yearEntry) => {
                newTotalEntry.produced += yearEntry?.produced ?? 0;
                newTotalEntry.consumption += yearEntry?.consumption ?? 0;
                newTotalEntry.delivery += yearEntry?.delivery ?? 0;
                newTotalEntry.usage += yearEntry?.usage ?? 0;
            })
            await mongo.collection<TotalEntry>('TotalEntry').insertOne(newTotalEntry);
        } else {
            let totalEntry = totalEntries[0];
            if (totalEntry) {
                totalEntry.produced = 0;
                totalEntry.consumption = 0;
                totalEntry.delivery = 0;
                totalEntry.usage = 0;
                yearEntries.forEach((yearEntry) => {
                    if (totalEntry) {
                        totalEntry.produced += yearEntry?.produced ?? 0;
                        totalEntry.consumption += yearEntry?.consumption ?? 0;
                        totalEntry.delivery += yearEntry?.delivery ?? 0;
                        totalEntry.usage += yearEntry?.usage ?? 0;
                    }
                })
                await mongo.collection<TotalEntry>('TotalEntry').updateOne({ _id: totalEntry._id }, { $set: totalEntry });
            }
        }
    })
}

cron.schedule('*/5 * * * *', () => {
    insertToInflux();
    calculateMonth();
    calculateYear();
    calculateTotalWithoutLimit();
})

cron.schedule('*/10 * * * * *', () => {
    inserttoMongo();
});



app.listen(4000, async () => {
    console.log("⚡️[server]: Server is running on port 4000");
})