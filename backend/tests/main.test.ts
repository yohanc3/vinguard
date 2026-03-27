/**
 * Main Test Runner
 * 
 * Orchestrates all test files in sequential order:
 * 1. Setup test database
 * 2. Auth tests (register, login, validate token)
 * 3. Cars CRUD tests (create, fetch, update, verify, delete)
 * 4. LLM extraction tests (PDF, listing)
 * 5. Scraper tests (Playwright)
 * 6. Cleanup test database
 * 
 * Run with: bun test tests/main.test.ts
 */

import { describe, test, beforeAll, afterAll } from "bun:test"
import { setupTestEnvironment, cleanupTestEnvironment } from "./setup"
import { testState } from "./state"
import { runAuthTests } from "./auth"
import { runCarsTests } from "./cars"
import { runLlmTests } from "./llm"
import { runScraperTests } from "./scraper"

describe("Vinguard Backend", function testSuite() {
  beforeAll(async function setup() {
    testState.app = await setupTestEnvironment()
  })

  afterAll(async function cleanup() {
    await cleanupTestEnvironment()
  })

  test("1. Authentication", async function authTests() {
    await runAuthTests()
  })

  test("2. Cars CRUD (Palantir)", async function carsTests() {
    await runCarsTests()
  })

  test("3. LLM Extraction", async function llmTests() {
    await runLlmTests()
  }, 60000)

  test("4. Scraper (Playwright)", async function scraperTests() {
    await runScraperTests()
  }, 60000)
})
