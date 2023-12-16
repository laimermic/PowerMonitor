export class MonthEntry {
    public lastupdated: number;
    public consumption: number;
    public delivery: number;
    public usage: number;
    public produced: number;

    constructor(lastUpdated: number, produced: number, consumption: number, delivery: number, usage: number) {
        this.lastupdated = lastUpdated;//day.getUTCDate() + "-" + (day.getUTCMonth() + 1) + "-" + day.getFullYear();
        this.produced = produced;
        this.usage = usage;
        this.delivery = delivery;
        this.consumption = consumption;
    }
}