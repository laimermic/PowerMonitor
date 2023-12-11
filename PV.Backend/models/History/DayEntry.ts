export class DayEntry {
    public lastupdated: number;
    public consumption: number;
    public delivery: number;
    public usage: number;
    public produced: number;

    constructor(produced: number, consumption: number, delivery: number, usage: number, lastUpdated: number) {
        this.lastupdated = lastUpdated;//day.getUTCDate() + "-" + (day.getUTCMonth() + 1) + "-" + day.getFullYear();
        this.produced = produced;
        this.usage = usage;
        this.delivery = delivery;
        this.consumption = consumption;
    }
}