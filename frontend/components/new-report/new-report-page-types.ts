export interface NewReportPageProps {
  onBack: () => void
  onComplete: (reportId: string) => void
}

export type Step = 1 | 2 | 3

export const STEPS = [
  { number: 1, label: "Listing details" },
  { number: 2, label: "Upload CarFax" },
  { number: 3, label: "Review & Create" },
]

export interface ScrapeResult {
  miles: string | null
  price: string | null
  photos: string[]
  details: string | null
}
