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

