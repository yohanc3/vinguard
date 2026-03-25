import { ApifyClient } from "apify-client"

const APIFY_ACTOR_ID = "Y0QGH7cuqgKtNbEgt"

export interface MarketplaceListing {
  id: string
  marketplace_listing_title: string
  custom_title?: string
  listing_price?: {
    formatted_amount: string
    amount: string
    currency: string
  }
  location?: {
    reverse_geocode?: {
      city: string
      state: string
    }
    latitude?: number
    longitude?: number
  }
  is_sold: boolean
  is_pending: boolean
  marketplace_listing_seller?: {
    name: string
    id: string
  }
  redacted_description?: {
    text: string
  }
  creation_time?: number
  condition?: string
  vehicle_make_display_name?: string
  vehicle_model_display_name?: string
  vehicle_odometer_data?: {
    unit: string
    value: number
  }
  vehicle_exterior_color?: string
  vehicle_transmission_type?: string
  vehicle_features?: Array<{
    display_name: string
    feature_category: string
    feature_type: string
  }>
  listing_photos?: Array<{
    accessibility_caption?: string
    image: {
      height: number
      width: number
      uri: string
    }
    id: string
  }>
  primary_listing_photo_url?: string
}

export async function scrapeMarketplaceListing(url: string): Promise<MarketplaceListing> {
  const token = process.env.APIFY_API_TOKEN

  if (!token) {
    throw new Error("APIFY_API_TOKEN is not configured")
  }

  const client = new ApifyClient({ token })

  const run = await client.actor(APIFY_ACTOR_ID).call({
    urls: [url],
    getListingDetails: true,
    getAllListingPhotos: true,
    strictFiltering: false,
    cookies: "",
  })

  const { items } = await client.dataset(run.defaultDatasetId).listItems()

  if (!items || items.length === 0) {
    throw new Error("No listing data returned from scraper")
  }

  return items[0] as unknown as MarketplaceListing
}

export function formatListingForLLM(listing: MarketplaceListing): string {
  const parts: string[] = []

  parts.push(`Title: ${listing.marketplace_listing_title || listing.custom_title || "Unknown"}`)

  if (listing.listing_price) {
    parts.push(`Price: ${listing.listing_price.formatted_amount}`)
  }

  if (listing.vehicle_make_display_name) {
    parts.push(`Make: ${listing.vehicle_make_display_name}`)
  }

  if (listing.vehicle_model_display_name) {
    parts.push(`Model: ${listing.vehicle_model_display_name}`)
  }

  if (listing.vehicle_odometer_data) {
    parts.push(`Mileage: ${listing.vehicle_odometer_data.value} ${listing.vehicle_odometer_data.unit}`)
  }

  if (listing.vehicle_exterior_color) {
    parts.push(`Exterior Color: ${listing.vehicle_exterior_color}`)
  }

  if (listing.condition) {
    parts.push(`Condition: ${listing.condition}`)
  }

  if (listing.redacted_description?.text) {
    parts.push(`Description: ${listing.redacted_description.text}`)
  }

  if (listing.vehicle_features && listing.vehicle_features.length > 0) {
    const features = listing.vehicle_features.map((f) => f.display_name).join(", ")
    parts.push(`Features: ${features}`)
  }

  if (listing.location?.reverse_geocode) {
    parts.push(`Location: ${listing.location.reverse_geocode.city}, ${listing.location.reverse_geocode.state}`)
  }

  if (listing.listing_photos && listing.listing_photos.length > 0) {
    const photoUrls = listing.listing_photos.map((p) => p.image.uri).join("\n")
    parts.push(`Photo URLs:\n${photoUrls}`)
  }

  return parts.join("\n")
}
