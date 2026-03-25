# Extract Router

tRPC router for extracting vehicle data from PDFs and marketplace listings.

## Location

`src/trpc/routers/extract.ts`

## Endpoints

### `extract.fromPdfText`

Extract data from PDF text (CarFax-style reports).

```typescript
// Input
{ text: string }  // min 50 chars

// Output: pdfExtractedDataSchema
{ make, model, year, trim, bodyStyle, ... }
```

### `extract.fromListingText`

Extract data from marketplace listing text.

```typescript
// Input
{ text: string }  // min 20 chars

// Output: listingExtractedDataSchema
{ listingMileage, listingDetails, listingPictures, listingPrice }
```

### `extract.fromListingUrl`

Scrape URL and extract listing data.

```typescript
// Input
{ url: string }  // valid URL

// Output: listingExtractedDataSchema
```

**Note:** Triggers Apify scrape (billed).

### `extract.combined`

Extract from both PDF and listing in parallel.

```typescript
// Input
{
  pdfText?: string,      // PDF report text
  listingUrl?: string,   // Marketplace URL (triggers scrape)
  listingText?: string   // OR raw listing text
}

// Output: merged pdfExtractedDataSchema + listingExtractedDataSchema
```

## Frontend Usage

```typescript
const trpc = useTRPC()

// PDF extraction
const pdfMutation = useMutation(trpc.extract.fromPdfText.mutationOptions({}))
const result = await pdfMutation.mutateAsync({ text: pdfText })

// Listing extraction (from URL)
const listingMutation = useMutation(trpc.extract.fromListingUrl.mutationOptions({}))
const result = await listingMutation.mutateAsync({ url: listingUrl })
```
