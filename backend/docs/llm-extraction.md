# LLM Extraction Service

Extracts structured car data from text using Palantir AIP.

## Location

`src/services/llm.ts`

## Functions

### `extractCarDataFromPdf(pdfText: string)`

Extracts vehicle data from CarFax-style report text.

**Returns:**
```typescript
{
  make?: string | null
  model?: string | null
  year?: number | null
  trim?: string | null
  bodyStyle?: string | null
  engineType?: string | null
  cylinders?: number | null
  exteriorColor?: string | null
  color?: string | null
  msrp?: string | null
  odometerReadings?: string[] | null
  numberOfPreviousOwners?: number | null
  stateOfRegistration?: string | null
  titleStatus?: string | null
  salvageRecord?: string | null
  floodDamageHistory?: string | null
  fairMarketValueHigh?: number | null
  fairMarketValueLow?: number | null
}
```

### `extractListingData(listingText: string)`

Extracts data from marketplace listing text.

**Returns:**
```typescript
{
  listingMileage?: string | null
  listingDetails?: string[] | null  // Array of 5-15 word phrases
  listingPictures?: string[] | null // Image URLs
  listingPrice?: number | null
}
```

## Usage

```typescript
import { extractCarDataFromPdf, extractListingData } from "../services/llm"

const pdfData = await extractCarDataFromPdf(pdfText)
const listingData = await extractListingData(listingText)
```

## Notes

- Returns `null` for fields not found in text
- Requires `PALANTIR_AIP_API_KEY` env var
- Uses Palantir AIP `chatCompletion` query (see `palantir-llm.md`)
