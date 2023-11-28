import { CurrentField } from "./CurrentField";
import { InfluxResult } from "./InfluxResult";

export class CurrentEntry {
    public production: CurrentField;
    public frequency: CurrentField;
    public consumption: CurrentField;
    public delivery: CurrentField;

    constructor(
        production: CurrentField,
        frequency: CurrentField,
        consumption: CurrentField,
        delivery: CurrentField
    ) {
        this.production = production;
        this.frequency = frequency;
        this.consumption = consumption;
        this.delivery = delivery;
    }
}