export class EnergyPrice {
    public start: number | null;
    public end: number | null;
    public type: 'feed' | 'consume';
    public pricePerKwH: number;

    constructor(start: number | null, end: number | null, type: 'feed' | 'consume', pricePerKwH: number) {
        this.start = start;
        this.end = end;
        this.type = type;
        this.pricePerKwH = pricePerKwH;
    }
}