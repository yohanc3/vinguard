# Extract Router

tRPC router for extracting vehicle data from PDF text and raw listing text (LLM via Palantir).

**Related docs:** [LLM Extraction](./llm-extraction.md)

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

Extract data from marketplace listing text (paste JSON or plain description).

```typescript
// Input
{ text: string }  // min 20 chars

// Output: listingExtractedDataSchema
{ listingMileage, listingDetails, listingPictures, listingPrice }
```

### `extract.combined`

Extract from PDF and/or listing text in parallel. At least one of `pdfText` or `listingText` is required.

```typescript
// Input
{
  pdfText?: string,       // min 50 chars if present
  listingText?: string,   // min 20 chars if present
}

// Output: merged pdfExtractedDataSchema + listingExtractedDataSchema
```

## Frontend Usage

```typescript
const trpc = useTRPC()

const pdfMutation = useMutation(trpc.extract.fromPdfText.mutationOptions({}))
const result = await pdfMutation.mutateAsync({ text: pdfText })

const listingMutation = useMutation(trpc.extract.fromListingText.mutationOptions({}))
const listing = await listingMutation.mutateAsync({ text: listingBody })
```

## How It Integrates

Used for ad-hoc extraction and tooling; the main report flow uses `cars.createReport` with listing fields + CarFax upload.

```
Frontend ──▶ extract.* ──▶ Palantir LLM (structured JSON)
```
