export interface PowerDocument {
    Body: Body
    Head: Head
}

export interface Body {
    DAY_ENERGY: DayEnergy
    PAC: Pac
    TOTAL_ENERGY: TotalEnergy
    YEAR_ENERGY: YearEnergy
}

export interface DayEnergy {
    Unit: string
    Values: Array<number>
}

export interface Pac {
    Unit: string
    Values: Array<number>
}

export interface TotalEnergy {
    Unit: string
    Values: Array<number>
}

export interface YearEnergy {
    Unit: string
    Values: Array<number>
}

export interface Head {
    RequestArguments: RequestArguments
    Status: Status
    Timestamp: string
}

export interface RequestArguments {
    Query: string
    Scope: string
}

export interface Status {
    Code: number
    Reason: string
    UserMessage: string
}
