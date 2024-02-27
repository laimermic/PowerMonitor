export class FrequencyHour {
    public startTime: number;
    public endTime: number;
    public min: number;
    public max: number;

    constructor(startTime: number, endTime: number, min: number, max: number) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.min = min;
        this.max = max;
    }
}