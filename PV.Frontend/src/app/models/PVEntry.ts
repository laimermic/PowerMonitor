export class PVEntry {
    public dateTime: Date;
    public production: number;
    public frequency: number;

    constructor(date: Date | undefined, production: number, frequency: number) {
        if (!date) {
            this.dateTime = new Date();
        } else {
            this.dateTime = date;
        }
        this.production = production;
        this.frequency = frequency;
    }
}