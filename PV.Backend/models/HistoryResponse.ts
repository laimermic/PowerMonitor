import { InfluxResult } from "./InfluxResult";
import { usageEntry } from "./usageEntry";

export class HistoryResponse {
    public production: InfluxResult[];
    public usage: InfluxResult[]

    constructor(
        production: InfluxResult[],
        usage: InfluxResult[]
    ) {
        this.production = production;
        this.usage = usage;
    }
}