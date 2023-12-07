export class CurrentField {
    public oldTime: Date;
    public time: Date;
    public value: number;
    constructor(time: Date, value: number, oldTime: Date) {
        this.time = time;
        this.value = value;
        this.oldTime = oldTime;
    }
}