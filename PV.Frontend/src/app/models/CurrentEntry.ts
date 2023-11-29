import { CurrentField } from "./CurrentField";

export class CurrentEntry {
    public production: CurrentField | null;
    public frequency: CurrentField | null;
    public consumption: CurrentField | null;
    public delivery: CurrentField | null;
    public usage: CurrentField | null;

    constructor(
        production: CurrentField | null,
        frequency: CurrentField | null,
        consumption: CurrentField | null,
        delivery: CurrentField | null,
        usage: CurrentField | null
    ) {
        this.production = production;
        this.frequency = frequency;
        this.consumption = consumption;
        this.delivery = delivery;
        this.usage = usage;
    }
}