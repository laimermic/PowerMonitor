export class YearEntry {
    public year: number;
    public produced: number;

    constructor(produced: number, date: Date) {
        this.year = date.getFullYear();
        this.produced = produced;
    }
}