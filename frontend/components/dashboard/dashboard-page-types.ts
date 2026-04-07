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
  listingPictures?: string[]
  titleStatus?: string
  salvageRecord?: string
  numberOfPreviousOwners?: number
  carReport?: string
}

export interface DashboardPageProps {
  onLogout: () => void
  onSelectReport: (reportId: string) => void
  onNewReport: () => void
}

export function getRiskLevel(car: PalantirCar): "critical" | "medium" | "low" {
  if (car.salvageRecord === "Yes") return "critical"
  if (car.titleStatus && car.titleStatus.toLowerCase().includes("salvage")) return "critical"
  if (car.titleStatus && car.titleStatus.toLowerCase().includes("rebuilt")) return "medium"
  return "low"
}
