export class DayEntry {
    public day: string;
    public produced: number;

    constructor(produced: number, day: Date) {
        this.day = day.getUTCDate() + "-" + (day.getUTCMonth() + 1) + "-" + day.getFullYear();
        this.produced = produced;
    }
}