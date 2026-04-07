import type { PalantirCar, VehicleAnalysis } from "@/components/report-view/report-view-page-types"

export function parseVehicleAnalysis(analysisJson: string | undefined): VehicleAnalysis | null {
    if (!analysisJson) return null
    try {
        return JSON.parse(analysisJson) as VehicleAnalysis
    } catch {
        return null
    }
}

/** True while listing scrape/finalize data has not arrived yet (empty car shell after createReport). */
export function isCarListingDetailsLoading(args: {
    car: PalantirCar
    imageCount: number
    isFetching: boolean
    hasVehicleAnalysis: boolean
}): boolean {
    const { car, imageCount, isFetching, hasVehicleAnalysis } = args
    const hasMileage = Boolean(car.listingMileage && String(car.listingMileage).trim() !== "")
    const hasVin = Boolean(car.vin && String(car.vin).trim() !== "")
    const hasAnyListingDetail =
        imageCount > 0 ||
        car.listingPrice != null ||
        hasVin ||
        hasMileage ||
        Boolean(car.make && String(car.make).trim() !== "")
    if (hasAnyListingDetail) return false
    return isFetching || !hasVehicleAnalysis
}
