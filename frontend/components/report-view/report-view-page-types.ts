export interface ReportViewPageProps {
    reportId: string
    onBack: () => void
}

export interface PalantirCar {
    __primaryKey?: string
    id?: string
    vin?: string
    make?: string
    model?: string
    year?: number
    trim?: string
    listingPrice?: number
    listingMileage?: string
    listingDetails?: string[]
    listingPictures?: string[]
    odometerReadings?: number[]
    titleStatus?: string
    salvageRecord?: string
    floodDamageHistory?: string
    fairMarketValueHigh?: number
    fairMarketValueLow?: number
    carReport?: string
    numberOfPreviousOwners?: number
    stateOfRegistration?: string
    vehicleAnalysis?: string
    marketplaceListing?: string
}

export interface ChecklistItem {
    id: string
    priority: number
    title: string
    description: string
    category: "recall" | "inspection" | "question" | "test_drive" | "documentation"
    completed: boolean
}

export interface AnalysisSource {
    url: string,
    title: string
}

export interface VehicleAnalysis {
    summaryLine: string
    verdict: {
        label: "strong_buy" | "good_deal" | "proceed_with_caution" | "walk_away"
        justification: string
        upsides: string[]
        risks: string[]
    }
    market: {
        kbbValue: number | null
        tradeInValue: number | null
        privatePartyValue: number | null
        listingPrice: number
        percentDifference: number
        negotiationNote: string | null
    }
    checklist: ChecklistItem[]
    sources?: AnalysisSource[]
    generatedAt: string
    status: "pending" | "generating" | "completed" | "failed"
}
