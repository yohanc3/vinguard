# Marketplace Service

Scrapes vehicle listings from Facebook Marketplace using Apify.

## Location

`src/services/marketplace.ts`

## Functions

### `scrapeMarketplaceListing(url: string)`

Scrapes a single listing from Facebook Marketplace.

**Returns:** `MarketplaceListing` object with:
- `marketplace_listing_title`
- `listing_price` (formatted_amount, amount, currency)
- `redacted_description.text`
- `vehicle_odometer_data` (unit, value)
- `vehicle_exterior_color`
- `listing_photos[]` (image URLs)
- `location` (city, state)
- And more (see type definition)

### `formatListingForLLM(listing: MarketplaceListing)`

Converts scraped listing to text format for LLM extraction.

## Usage

```typescript
import { scrapeMarketplaceListing, formatListingForLLM } from "../services/marketplace"
import { extractListingData } from "../services/llm"

const listing = await scrapeMarketplaceListing(url)
const text = formatListingForLLM(listing)
const extracted = await extractListingData(text)
```

## Configuration

Requires `APIFY_API_TOKEN` env var.

Uses Apify actor `Y0QGH7cuqgKtNbEgt` (Facebook Marketplace Scraper).

## Notes

- Apify calls are billed per run
- For testing, use mock data instead of real scrapes
