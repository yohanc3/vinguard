/**
 * Scraper tests
 * 
 * Tests the Playwright scraper and job queue.
 * Note: These tests require a browser and network access.
 */

import { expect } from "bun:test"
import { testState } from "./state"
import { scrapeWithPlaywright } from "../src/services/scraper/playwright"

const TEST_URL = "https://www.facebook.com/marketplace/item/1271906570938853"
const TEST_TIMEOUT = 30000

export async function runScraperTests() {

  await testDirectScrape()
  await testQueueEndpoints()
}

async function testDirectScrape() {

  const startTime = Date.now()

  try {
    const result = await Promise.race([
      scrapeWithPlaywright(TEST_URL, false),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Scrape timed out")), TEST_TIMEOUT)
      ),
    ])

    const elapsed = Date.now() - startTime

    // Verify miles
    expect(result.miles).toBe("140,000")

    // Verify price
    expect(result.price).toBe("1400")

    // Verify details contains expected text
    expect(result.details).toContain("2006 Corolla 140k miles.")

    // Verify at least 3 photos
    expect(result.photos.length).toBeGreaterThanOrEqual(3)

  } catch (err) {
    const elapsed = Date.now() - startTime
    const message = err instanceof Error ? err.message : String(err)
    throw err
  }
}

async function testQueueEndpoints() {

  // Test startScrape endpoint
  const startRes = await testState.app!.request("/trpc/scrape.startScrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: TEST_URL }),
  })

  if (startRes.status !== 200) {
    const errorText = await startRes.text()
    return
  }

  const startJson = (await startRes.json()) as { result: { data: { jobId: string } } }
  const jobId = startJson.result.data.jobId

  // Test getScrapeStatus endpoint
  const statusRes = await testState.app!.request(
    `/trpc/scrape.getScrapeStatus?input=${encodeURIComponent(JSON.stringify({ jobId }))}`,
    { method: "GET" }
  )

  if (statusRes.status !== 200) {
    const errorText = await statusRes.text()
    return
  }

  const statusJson = (await statusRes.json()) as { result: { data: { status: string } } }
  const status = statusJson.result.data.status

  // Job should be pending (since worker isn't running in test)
  expect(status).toBe("pending")

}
