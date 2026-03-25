# Facebook Marketplace Scraper (Apify)

Scrape Facebook Marketplace listings using Apify.

> **Note:** For application usage, see `marketplace-service.md` which wraps this functionality.

## Prerequisites

Install the Apify client:

```bash
bun install apify-client
```

Add to your `.env`:

```env
APIFY_API_TOKEN=your-apify-token
```

## Usage

```typescript
import { ApifyClient } from "apify-client"

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN
})

const run = await client.actor("Y0QGH7cuqgKtNbEgt").call({
  urls: ["https://www.facebook.com/marketplace/item/1234567890/"],
  getListingDetails: true,
  getAllListingPhotos: true,
  strictFiltering: false,
  cookies: ""
})

const { items } = await client.dataset(run.defaultDatasetId).listItems()
```

### Actor ID

`Y0QGH7cuqgKtNbEgt`

### Input Parameters

- `urls` (string[]) - Marketplace listing URLs to scrape
- `getListingDetails` (boolean) - Fetch full listing details
- `getAllListingPhotos` (boolean) - Fetch all photos
- `strictFiltering` (boolean) - Enable strict filtering
- `cookies` (string) - Optional cookies for auth

### Response

`items` is an array of listing objects:

```json
{
  "id": "string",
  "primary_listing_photo_url": "string",
  "listing_price": {
    "formatted_amount": "string",
    "amount": "string",
    "currency": "string"
  },
  "location": {
    "reverse_geocode": {
      "city": "string",
      "state": "string"
    },
    "latitude": "number",
    "longitude": "number"
  },
  "is_sold": "boolean",
  "is_pending": "boolean",
  "marketplace_listing_title": "string",
  "custom_title": "string",
  "marketplace_listing_seller": {
    "name": "string",
    "id": "string"
  },
  "delivery_types": ["string"],
  "redacted_description": {
    "text": "string"
  },
  "creation_time": "number",
  "condition": "string",
  "vehicle_make_display_name": "string",
  "vehicle_model_display_name": "string",
  "vehicle_odometer_data": {
    "unit": "string",
    "value": "number"
  },
  "vehicle_exterior_color": "string",
  "vehicle_transmission_type": "string",
  "vehicle_features": [
    {
      "display_name": "string",
      "feature_category": "string",
      "feature_type": "string"
    }
  ],
  "listing_photos": [
    {
      "accessibility_caption": "string",
      "image": {
        "height": "number",
        "width": "number",
        "uri": "string"
      },
      "id": "string"
    }
  ]
}
```
