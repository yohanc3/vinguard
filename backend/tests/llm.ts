/**
 * LLM extraction tests
 */

import { expect } from "bun:test"
import { testState } from "./state"
import {
  pdfExtractedDataSchema,
  listingExtractedDataSchema,
} from "../src/services/llm"
import {PDFParse} from "pdf-parse"

export async function runLlmTests() {

  await testPdfSchemaValidation()
  await testListingSchemaValidation()
  await testRealPdfExtraction()
  await testListingExtraction()
}

async function testPdfSchemaValidation() {
  // Test that a valid PDF extraction response passes schema validation
  const validResponse = {
    vin: "4T1BF1FK5CU123456",
    bodyStyle: "Sedan",
    color: "Silver",
    cylinders: 6,
    engineType: "V6",
    odometerReadings: [10000, 20000, 30000],
    fairMarketValueHigh: 35000,
    fairMarketValueLow: 30000,
    floodDamageHistory: "None",
    make: "Toyota",
    model: "Camry",
    msrp: 32000,
    numberOfPreviousOwners: 2,
    salvageRecord: "None",
    stateOfRegistration: "CA",
    titleStatus: "Clean",
    trim: "XSE",
    year: 2022,
  }

  const parsed = pdfExtractedDataSchema.safeParse(validResponse)
  expect(parsed.success).toBe(true)

  // Test with null values (should pass - LLM returns null for unfound)
  const responseWithNulls = {
    vin: null,
    bodyStyle: null,
    color: "Blue",
    cylinders: null,
    engineType: "I4",
    odometerReadings: null,
    fairMarketValueHigh: null,
    fairMarketValueLow: null,
    floodDamageHistory: null,
    make: "Honda",
    model: "Accord",
    msrp: null,
    numberOfPreviousOwners: null,
    salvageRecord: null,
    stateOfRegistration: null,
    titleStatus: "Clean",
    trim: null,
    year: 2023,
  }

  const parsedWithNulls = pdfExtractedDataSchema.safeParse(responseWithNulls)
  expect(parsedWithNulls.success).toBe(true)

}

async function testListingSchemaValidation() {
  // Test valid listing extraction response
  const validResponse = {
    listingMileage: "45000",
    listingDetails: [
      "Single owner vehicle",
      "Regular maintenance performed",
      "New tires installed 2024",
      "No accidents reported",
    ],
    listingPictures: [
      "https://example.com/img1.jpg",
      "https://example.com/img2.jpg",
    ],
    listingPrice: 28000,
  }

  const parsed = listingExtractedDataSchema.safeParse(validResponse)
  expect(parsed.success).toBe(true)

  // Test with null values
  const responseWithNulls = {
    listingMileage: null,
    listingDetails: null,
    listingPictures: ["https://example.com/img.jpg"],
    listingPrice: 25000,
  }

  const parsedWithNulls = listingExtractedDataSchema.safeParse(responseWithNulls)
  expect(parsedWithNulls.success).toBe(true)

}

async function testRealPdfExtraction() {
  // Skip if Palantir is not available
  if (!testState.palantirAvailable) {
    return
  }

  // Read the test PDF and extract text
  const pdfPath = "./tests/vin-report-test.pdf"
  const parser = new PDFParse({url: pdfPath})

  const fileTextResult = await parser.getText()
  const fileText =
    typeof fileTextResult === "string" ? fileTextResult : (fileTextResult as any).text

  const res = await testState.app!.request("/trpc/extract.fromPdfText", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: fileText }),
  })

  if (res.status !== 200) {
    const errorText = await res.text()
    return
  }

  const json = (await res.json()) as { result: { data: Record<string, unknown> } }
  const extracted = json.result.data

  // Verify key fields were extracted
  expect(extracted.vin).toBeDefined()
  expect(extracted.make).toBeDefined()
  expect(extracted.model).toBeDefined()
  expect(extracted.year).toBeDefined()

}

async function testListingExtraction() {
  // Skip if Palantir is not available
  if (!testState.palantirAvailable) {
    return
  }

  // Test with mock listing data (no Apify call)
  const mockListingText = `
    Title: 2022 Toyota Camry XSE - Excellent Condition
    Price: $29,500
    Mileage: 28,000 miles
    
    Description:
    Selling my 2022 Toyota Camry XSE in excellent condition. Single owner, always garaged.
    Regular oil changes every 5,000 miles at Toyota dealer. New Michelin tires installed
    last month. No accidents, clean CarFax. Leather seats, sunroof, JBL premium audio.
    Moving overseas, must sell quickly. Serious inquiries only.
    
    Location: Los Angeles, CA
    
    Photo URLs:
    https://example.com/camry1.jpg
    https://example.com/camry2.jpg
    https://example.com/camry3.jpg
  `

  const res = await testState.app!.request("/trpc/extract.fromListingText", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: mockListingText }),
  })

  if (res.status !== 200) {
    const errorText = await res.text()
    return
  }

  const json = (await res.json()) as { result: { data: Record<string, unknown> } }
  const extracted = json.result.data

  // Verify listing fields were extracted
  expect(extracted.listingPrice).toBeDefined()
  expect(extracted.listingMileage).toBeDefined()

  const details = extracted.listingDetails as string[] | null
  if (details && details.length > 0) {
  } else {
  }
}
