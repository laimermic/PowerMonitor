export class EnergyPrice {
    public _id: string | null;
    public start: number | null;
    public end: number | null;
    public type: 'feed' | 'consume';
    public pricePerKwH: number;

    constructor(_id: string | null, start: number | null, end: number | null, type: 'feed' | 'consume', pricePerKwH: number) {
        this._id = _id;
        this.start = start;
        this.end = end;
        this.type = type;
        this.pricePerKwH = pricePerKwH;
    }
}