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
  console.log("\n" + "─".repeat(60))
  console.log("4. Scraper Tests")
  console.log("─".repeat(60))

  await testDirectScrape()
  await testQueueEndpoints()
}

async function testDirectScrape() {
  console.log(`  [4.1] Testing direct scrape (timeout: ${TEST_TIMEOUT}ms)...`)
  console.log(`  [4.1] URL: ${TEST_URL}`)

  const startTime = Date.now()

  try {
    const result = await Promise.race([
      scrapeWithPlaywright(TEST_URL),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Scrape timed out")), TEST_TIMEOUT)
      ),
    ])

    const elapsed = Date.now() - startTime
    console.log(`  [4.1] Scrape completed in ${elapsed}ms`)
    console.log(`  [4.1] Result: ${JSON.stringify(result, null, 2)}`)

    // Verify miles
    expect(result.miles).toBe("140,000")
    console.log(`  [4.1] ✓ Miles: ${result.miles}`)

    // Verify price
    expect(result.price).toBe("1400")
    console.log(`  [4.1] ✓ Price: ${result.price}`)

    // Verify details contains expected text
    expect(result.details).toContain("2006 Corolla 140k miles.")
    console.log(`  [4.1] ✓ Details contains expected text`)

    // Verify at least 3 photos
    expect(result.photos.length).toBeGreaterThanOrEqual(3)
    console.log(`  [4.1] ✓ Photos: ${result.photos.length}`)

    console.log(`  ✓ 4.1 Direct scrape: passed (${elapsed}ms)`)
  } catch (err) {
    const elapsed = Date.now() - startTime
    const message = err instanceof Error ? err.message : String(err)
    console.log(`  ✗ 4.1 Direct scrape: failed after ${elapsed}ms`)
    console.log(`  [4.1] Error: ${message}`)
    throw err
  }
}

async function testQueueEndpoints() {
  console.log(`  [4.2] Testing queue endpoints...`)

  // Test startScrape endpoint
  const startRes = await testState.app!.request("/trpc/scrape.startScrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: TEST_URL }),
  })

  if (startRes.status !== 200) {
    const errorText = await startRes.text()
    console.log(`  ✗ 4.2 Queue endpoints: startScrape failed`)
    console.log(`  [4.2] Error: ${errorText}`)
    return
  }

  const startJson = (await startRes.json()) as { result: { data: { jobId: string } } }
  const jobId = startJson.result.data.jobId
  console.log(`  [4.2] Job created: ${jobId}`)

  // Test getScrapeStatus endpoint
  const statusRes = await testState.app!.request(
    `/trpc/scrape.getScrapeStatus?input=${encodeURIComponent(JSON.stringify({ jobId }))}`,
    { method: "GET" }
  )

  if (statusRes.status !== 200) {
    const errorText = await statusRes.text()
    console.log(`  ✗ 4.2 Queue endpoints: getScrapeStatus failed`)
    console.log(`  [4.2] Error: ${errorText}`)
    return
  }

  const statusJson = (await statusRes.json()) as { result: { data: { status: string } } }
  const status = statusJson.result.data.status

  // Job should be pending (since worker isn't running in test)
  expect(status).toBe("pending")
  console.log(`  [4.2] Job status: ${status}`)

  console.log(`  ✓ 4.2 Queue endpoints: passed`)
}
