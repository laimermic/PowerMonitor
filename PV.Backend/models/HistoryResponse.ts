import { InfluxResult } from "./InfluxResult";
import { usageEntry } from "./usageEntry";

export class HistoryResponse {
    public production: InfluxResult[];
    public consumption: InfluxResult[];
    public usage: usageEntry[] | null;
    public delivery: InfluxResult[];

    constructor(
        production: InfluxResult[],
        consumption: InfluxResult[],
        delivery: InfluxResult[],
        usage: usageEntry[] | null
    ) {
        this.production = production;
        this.consumption = consumption;
        this.delivery = delivery;
        this.usage = usage;
    }
}