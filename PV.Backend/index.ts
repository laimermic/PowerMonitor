import express, { Express, Request, Response, json } from 'express';
import { Db, MongoClient, WithId } from 'mongodb';
import { get, reject } from 'lodash';
import { DayEntry } from './models/History/DayEntry';
import { PVEntry } from './models/PVEntry';
import { InfluxDB, Point } from '@influxdata/influxdb-client'
import { PowerDocument } from './models/PowerDocument';
import { DOMParser } from 'xmldom';
import { InfluxResult } from './models/InfluxResult';
import { CurrentEntry } from './models/CurrentEntry';
import { HistoryResponse } from './models/HistoryResponse';
import { NotificationClient } from './models/NotifcationClient';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { messaging } from 'firebase-admin';
import { CurrentField } from './models/CurrentField';
import dotenv from 'dotenv'

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

function calculateUsage() {
    if (document.delivery?.value == 0) {
        document.usage = new CurrentField(new Date(), (document?.production?.value ?? 0) + (document?.consumption?.value ?? 0));
    } else {
        document.usage = new CurrentField(new Date(), (document.production?.value ?? 0) - (document.delivery?.value ?? 0));
    }
    console.log("==============================================");
    console.log("Recalculated the numbers");
    console.log("Production: " + document.production?.value);
    console.log("Delivery: " + document.delivery?.value);
    console.log("Consumption: " + document.consumption?.value);
    console.log("Usage: " + document.usage?.value);
    console.log("==============================================");
}

async function inserttoMongo() {
    if (document.consumption && document.delivery && document.frequency && document.production && document.usage) {
        await mongo.collection<CurrentEntry>('current').findOneAndUpdate({}, { $set: document }, { upsert: true });
        const difference = new Date().getTime() - document.frequency.time.getTime();
        if ((new Date().getTime() - document.frequency.time.getTime()) / (1000 * 60) < 2) {
            var frequencyPoint = new Point('frequency').floatField('value', document.frequency?.value);
            writeApi.writePoint(frequencyPoint);
        }
    } else {
        //console.log("Not logging to current due to missing data");
    }
}

async function insertToInflux() {
    if (document.consumption && document.delivery && document.frequency && document.production && document.usage) {
        var deliveryPoint = new Point('delivery').floatField('value', document.delivery?.value)
        var consumptionPoint = new Point('consumption').floatField('value', document.consumption?.value)
        var productionPoint = new Point('production').floatField('value', document.production?.value)
        var usagePoint = new Point('usage').floatField('value', document.usage?.value);
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
                var filtered = points.filter(point => new Date(point._time).getDate() == day.getDate())
                resolve(filtered)
            },
            error(error) {
                console.log(error)
                reject(error);
            }
        })

    })
}


async function sendAlert(message: string, title: string) {
    var cursor = mongo.collection<NotificationClient>("clients").find();
    var clients = new Array<WithId<NotificationClient>>();

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
    document.production = new CurrentField(new Date(), Number(body.Body.PAC.Values[1]));
    calculateUsage();
    res.end();
});

app.post('/uploadfreq', express.text({ type: '*/*' }), async (req: Request, res: Response) => {
    var xmldocument = new DOMParser().parseFromString(req.body);
    if (xmldocument) {
        var frequency = Number(xmldocument.getElementById("Hz")?.lastChild?.nodeValue ?? "-1");
        if (frequency != -1) {
            document.frequency = new CurrentField(new Date(), frequency);
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

app.post('/uploadconsumption', express.text({ type: '*/*' }), (req: Request, res: Response) => {
    var consumption = Number(req.body);
    document.consumption = new CurrentField(new Date(), consumption);
    calculateUsage();
    res.statusCode = 200;
    res.send()
})

app.post('/uploaddelivery', express.text({ type: '*/*' }), (req: Request, res: Response) => {
    var delivery = Number(req.body);
    document.delivery = new CurrentField(new Date(), delivery);
    calculateUsage();
    res.statusCode = 200;
    res.end();
})

app.get('/api/day/:unix', async (req: Request, res: Response) => {
    var myDate = new Date(Number(req.params.unix) * 1000);
    var prodEntries = await getFromDay('production', myDate);
    var usageEntries = await getFromDay('usage', myDate)
    var response = new HistoryResponse(prodEntries, usageEntries);
    res.send(response);
})

app.get('/api/freqday/:unix', async (req: Request, res: Response) => {
    var myDate = new Date(Number(req.params.unix) * 1000);
    var freqEntries = await getFromDay('frequency', myDate);
    res.send(freqEntries)
});

app.post('/api/registerNotification', express.json({ type: '*/*' }), async (req: Request, res: Response) => {
    var client = req.body as NotificationClient;
    mongo.collection<NotificationClient>('clients').updateOne({ token: client.token }, { $set: client }, { upsert: true });
    res.end();
})

cron.schedule('*/5 * * * *', () => {
    insertToInflux();
})

cron.schedule('*/10 * * * * *', () => {
    inserttoMongo();
});



app.listen(4000, async () => {
    console.log("⚡️[server]: Server is running on port 4000");
})