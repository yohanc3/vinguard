/**
 * Main Test Runner
 * 
 * Orchestrates all test files in sequential order:
 * - Setup / teardown: test database (beforeAll / afterAll)
 * - Auth, Cars CRUD (Palantir), LLM extraction, Chat (DDG + Palantir)
 * 
 * Run with: bun test tests/main.test.ts
 */

import { describe, test, beforeAll, afterAll } from "bun:test"
import { setupTestEnvironment, cleanupTestEnvironment } from "./setup"
import { testState } from "./state"
import { runAuthTests } from "./auth"
import { runCarsTests } from "./cars"
import { runLlmTests } from "./llm"
import { runChatTests } from "./chat"

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
  }, 60000)

  test("3. LLM Extraction", async function llmTests() {
    await runLlmTests()
  }, 60000)

  test("4. Chat (DDG + Palantir)", async function chatTests() {
    await runChatTests()
  }, 120000)
})
