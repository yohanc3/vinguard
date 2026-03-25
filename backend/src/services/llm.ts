import { z } from "zod"

const PALANTIR_URL = process.env.PALANTIR_FOUNDRY_API_URL
const ONTOLOGY_RID = process.env.PALANTIR_ONTOLOGY_RID
const API_KEY = process.env.PALANTIR_AIP_API_KEY

const queryUrl = `${PALANTIR_URL}/api/v2/ontologies/${ONTOLOGY_RID}/queries/chatCompletion/execute`

export const pdfExtractedDataSchema = z.object({
  bodyStyle: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  cylinders: z.number().nullable().optional(),
  engineType: z.string().nullable().optional(),
  odometerReadings: z.array(z.string()).nullable().optional(),
  fairMarketValueHigh: z.number().nullable().optional(),
  fairMarketValueLow: z.number().nullable().optional(),
  floodDamageHistory: z.string().nullable().optional(),
  make: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  msrp: z.string().nullable().optional(),
  numberOfPreviousOwners: z.number().nullable().optional(),
  salvageRecord: z.string().nullable().optional(),
  stateOfRegistration: z.string().nullable().optional(),
  titleStatus: z.string().nullable().optional(),
  trim: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
})

export const listingExtractedDataSchema = z.object({
  listingMileage: z.string().nullable().optional(),
  listingDetails: z.array(z.string()).nullable().optional(),
  listingPictures: z.array(z.string()).nullable().optional(),
  listingPrice: z.number().nullable().optional(),
})

export type PdfExtractedData = z.infer<typeof pdfExtractedDataSchema>
export type ListingExtractedData = z.infer<typeof listingExtractedDataSchema>

async function callPalantirLLM(params: {
  systemContent: string
  userContent: string
  jsonResponseFormat?: string
  jsonResponseFormatInstructions?: string
}): Promise<string> {
  if (!API_KEY) {
    throw new Error("PALANTIR_AIP_API_KEY is not configured")
  }

  const response = await fetch(queryUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ parameters: params }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Palantir LLM API error: ${errorText}`)
  }

  const data = await response.json()
  
  // Palantir returns { value: "stringified json with response field" }
  if (!data.value) {
    throw new Error(`Palantir LLM returned no value: ${JSON.stringify(data)}`)
  }
  
  // Parse the stringified value
  const valueObj = typeof data.value === "string" ? JSON.parse(data.value) : data.value
  
  if (typeof valueObj.response !== "string") {
    throw new Error(`Palantir LLM returned unexpected format: ${JSON.stringify(data)}`)
  }
  
  // The response might be wrapped in markdown code blocks, extract the JSON
  let responseText = valueObj.response
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    responseText = jsonMatch[1].trim()
  }
  
  return responseText
}

const PDF_EXTRACTION_SYSTEM = `You are a vehicle data extraction assistant. Extract data from vehicle history reports (like CarFax).
Return ONLY valid JSON. Use null for any field you cannot find in the text.`

const PDF_EXTRACTION_FORMAT = `{
  "bodyStyle": "string or null (e.g. Sedan, SUV, Coupe)",
  "color": "string or null",
  "cylinders": "number or null",
  "engineType": "string or null (e.g. V6, I4, V8)",
  "odometerReadings": "array of strings or null (historical mileage readings)",
  "fairMarketValueHigh": "number or null (dollars)",
  "fairMarketValueLow": "number or null (dollars)",
  "floodDamageHistory": "string or null (description or 'None')",
  "make": "string or null",
  "model": "string or null",
  "msrp": "string or null",
  "numberOfPreviousOwners": "number or null",
  "salvageRecord": "string or null (description or 'None')",
  "stateOfRegistration": "string or null (2-letter state code)",
  "titleStatus": "string or null (e.g. Clean, Salvage, Rebuilt)",
  "trim": "string or null",
  "year": "number or null"
}`

const LISTING_EXTRACTION_SYSTEM = `You are a marketplace listing data extraction assistant. Extract data from vehicle marketplace listings.
Return ONLY valid JSON. Use null for any field you cannot find in the text.`

const LISTING_EXTRACTION_FORMAT = `{
  "listingMileage": "string or null (current mileage from listing)",
  "listingDetails": "array of strings or null (5-15 word phrases capturing important details, e.g. ['New brakes installed 2024', 'Single owner vehicle', 'Garage kept'])",
  "listingPictures": "array of strings or null (image URLs from listing)",
  "listingPrice": "number or null (asking price in dollars)"
}`

const LISTING_EXTRACTION_INSTRUCTIONS = `Extract the following from the marketplace listing:
- listingMileage: The current mileage stated in the listing
- listingDetails: An array of brief phrases (5-15 words each) summarizing ALL important information mentioned. Include details about condition, maintenance history, features, modifications, issues, etc. Make each phrase easy to read and digest.
- listingPictures: Array of any image URLs found in the listing data
- listingPrice: The asking price as a number

Return null for any field not found.`

export async function extractCarDataFromPdf(pdfText: string): Promise<PdfExtractedData> {
  const response = await callPalantirLLM({
    systemContent: PDF_EXTRACTION_SYSTEM,
    userContent: `Extract vehicle data from this report:\n\n${pdfText}`,
    jsonResponseFormat: PDF_EXTRACTION_FORMAT,
  })

  const parsed = JSON.parse(response)
  return pdfExtractedDataSchema.parse(parsed)
}

export async function extractListingData(listingText: string): Promise<ListingExtractedData> {
  const response = await callPalantirLLM({
    systemContent: LISTING_EXTRACTION_SYSTEM,
    userContent: `Extract listing data from this marketplace listing:\n\n${listingText}`,
    jsonResponseFormat: LISTING_EXTRACTION_FORMAT,
    jsonResponseFormatInstructions: LISTING_EXTRACTION_INSTRUCTIONS,
  })

  const parsed = JSON.parse(response)
  return listingExtractedDataSchema.parse(parsed)
}
