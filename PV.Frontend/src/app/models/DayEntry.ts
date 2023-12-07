export class DayEntry {
    public day: Date;
    public consumption: number;
    public delivery: number;
    public usage: number;
    public produced: number;

    constructor(produced: number, consumption: number, delivery: number, usage: number, day: Date) {
        this.day = day;//day.getUTCDate() + "-" + (day.getUTCMonth() + 1) + "-" + day.getFullYear();
        this.produced = produced;
        this.usage = usage;
        this.delivery = delivery;
        this.consumption = consumption;
    }
}