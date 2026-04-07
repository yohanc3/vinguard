export interface CarContext {
  vin: string | null
  make: string | null
  model: string | null
  year: number | null
  trim: string | null
  listingMileage: string | null
  listingPrice: number | null
  listingDetails: string[] | null
  odometerReadings: number[] | null
  marketplaceListing: string | null
}

export interface Source {
  url: string
  title: string
}

export interface ChatEntry {
  role: string
  message: string
  sources?: Source[]
}
