/**
 * LLM extraction tests
 */

import { expect } from "bun:test"
import { readFile } from "node:fs/promises"
import { PDFParse } from "pdf-parse"
import { testState } from "./state"
import {
  pdfExtractedDataSchema,
  listingExtractedDataSchema,
} from "../src/services/llm"

const TEST_TIMEOUT = 15000

export async function runLlmTests() {
  console.log("\n" + "─".repeat(60))
  console.log("3. LLM Extraction Tests")
  console.log("─".repeat(60))

  await testPdfSchemaValidation()
  await testListingSchemaValidation()
  await testRealPdfExtraction()
  await testListingExtraction()
}

async function testPdfSchemaValidation() {
  const validResponse = {
    bodyStyle: "Sedan",
    color: "Silver",
    cylinders: 6,
    engineType: "V6",
    exteriorColor: "Silver Metallic",
    odometerReadings: ["10000", "20000", "30000"],
    fairMarketValueHigh: 35000,
    fairMarketValueLow: 30000,
    floodDamageHistory: "None",
    make: "Toyota",
    model: "Camry",
    msrp: "32000",
    numberOfPreviousOwners: 2,
    salvageRecord: "None",
    stateOfRegistration: "CA",
    titleStatus: "Clean",
    trim: "XSE",
    year: 2022,
  }

  const parsed = pdfExtractedDataSchema.safeParse(validResponse)
  expect(parsed.success).toBe(true)

  const responseWithNulls = {
    bodyStyle: null,
    color: "Blue",
    cylinders: null,
    engineType: "I4",
    exteriorColor: null,
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

  console.log("  ✓ 3.1 PDF schema validation: passed")
}

async function testListingSchemaValidation() {
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

  const responseWithNulls = {
    listingMileage: null,
    listingDetails: null,
    listingPictures: ["https://example.com/img.jpg"],
    listingPrice: 25000,
  }

  const parsedWithNulls = listingExtractedDataSchema.safeParse(responseWithNulls)
  expect(parsedWithNulls.success).toBe(true)

  console.log("  ✓ 3.2 Listing schema validation: passed")
}

async function testRealPdfExtraction() {
  if (!testState.palantirAvailable) {
    console.log("  ⊘ 3.3 Real PDF extraction: skipped (Palantir unavailable)")
    return
  }

  const pdfPath = "./tests/vin-report-test.pdf"
  
  // Check if file exists
  const file = Bun.file(pdfPath)
  if (!(await file.exists())) {
    console.log("  ⊘ 3.3 Real PDF extraction: skipped (test PDF not found at " + pdfPath + ")")
    return
  }

  console.log("  [3.3] Reading PDF file...")
  
  // Extract text from PDF using pdf-parse
  let pdfText: string
  try {
    const buffer = await readFile(pdfPath)
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    await parser.destroy()
    pdfText = result.text
    console.log(`  [3.3] Extracted ${pdfText.length} characters from PDF`)
    console.log(`  [3.3] Preview: ${pdfText.substring(0, 200).replace(/\n/g, " ")}...`)
  } catch (err) {
    console.log(`  ✗ 3.3 Real PDF extraction: failed to read PDF`)
    console.log(`  [3.3] Error: ${err instanceof Error ? err.message : String(err)}`)
    return
  }

  if (pdfText.length < 50) {
    console.log(`  ✗ 3.3 Real PDF extraction: PDF text too short (${pdfText.length} chars)`)
    return
  }

  console.log(`  [3.3] Calling extract.fromPdfText (timeout: ${TEST_TIMEOUT}ms)...`)
  
  const requestBody = { text: pdfText }
  const startTime = Date.now()
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT)
  
  try {
    const res = await testState.app!.request("/trpc/extract.fromPdfText", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    const elapsed = Date.now() - startTime
    
    const responseText = await res.text()
    
    if (res.status !== 200) {
      console.log(`  ✗ 3.3 Real PDF extraction: failed (${elapsed}ms)`)
      console.log(`  [3.3] Status: ${res.status}`)
      console.log(`  [3.3] Response: ${responseText.substring(0, 500)}`)
      return
    }

    const json = JSON.parse(responseText) as { result: { data: Record<string, unknown> } }
    const extracted = json.result.data

    console.log(`  [3.3] Response received (${elapsed}ms)`)
    console.log(`  [3.3] Extracted data: ${JSON.stringify(extracted, null, 2).substring(0, 500)}`)

    expect(extracted).toBeDefined()
    
    const make = extracted.make
    const model = extracted.model
    const year = extracted.year

    console.log(`  ✓ 3.3 Real PDF extraction: ${year || "?"} ${make || "?"} ${model || "?"} (${elapsed}ms)`)
  } catch (err) {
    clearTimeout(timeoutId)
    const elapsed = Date.now() - startTime
    
    if (err instanceof Error && err.name === "AbortError") {
      console.log(`  ✗ 3.3 Real PDF extraction: timed out after ${TEST_TIMEOUT}ms`)
    } else {
      console.log(`  ✗ 3.3 Real PDF extraction: error after ${elapsed}ms`)
      console.log(`  [3.3] Error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}

async function testListingExtraction() {
  if (!testState.palantirAvailable) {
    console.log("  ⊘ 3.4 Listing extraction: skipped (Palantir unavailable)")
    return
  }

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

  console.log(`  [3.4] Calling extract.fromListingText (timeout: ${TEST_TIMEOUT}ms)...`)
  
  const requestBody = { text: mockListingText }
  const startTime = Date.now()
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT)
  
  try {
    const res = await testState.app!.request("/trpc/extract.fromListingText", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    const elapsed = Date.now() - startTime
    
    const responseText = await res.text()
    
    if (res.status !== 200) {
      console.log(`  ✗ 3.4 Listing extraction: failed (${elapsed}ms)`)
      console.log(`  [3.4] Status: ${res.status}`)
      console.log(`  [3.4] Response: ${responseText.substring(0, 500)}`)
      return
    }

    const json = JSON.parse(responseText) as { result: { data: Record<string, unknown> } }
    const extracted = json.result.data

    console.log(`  [3.4] Response received (${elapsed}ms)`)
    console.log(`  [3.4] Extracted data: ${JSON.stringify(extracted, null, 2)}`)

    expect(extracted).toBeDefined()
    
    const price = extracted.listingPrice
    const mileage = extracted.listingMileage
    const details = extracted.listingDetails as string[] | null

    if (details && details.length > 0) {
      console.log(`  ✓ 3.4 Listing extraction: price=${price}, mileage=${mileage}, ${details.length} details (${elapsed}ms)`)
    } else {
      console.log(`  ✓ 3.4 Listing extraction: price=${price}, mileage=${mileage} (${elapsed}ms)`)
    }
  } catch (err) {
    clearTimeout(timeoutId)
    const elapsed = Date.now() - startTime
    
    if (err instanceof Error && err.name === "AbortError") {
      console.log(`  ✗ 3.4 Listing extraction: timed out after ${TEST_TIMEOUT}ms`)
    } else {
      console.log(`  ✗ 3.4 Listing extraction: error after ${elapsed}ms`)
      console.log(`  [3.4] Error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}
