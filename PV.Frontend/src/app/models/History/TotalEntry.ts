export class TotalEntry {
    public consumption: number;
    public delivery: number;
    public usage: number;
    public produced: number;

    constructor(produced: number, consumption: number, delivery: number, usage: number) {
        this.produced = produced;
        this.usage = usage;
        this.delivery = delivery;
        this.consumption = consumption;
    }
}