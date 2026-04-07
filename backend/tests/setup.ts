/**
 * Test database setup and teardown utilities
 */

import { unlink } from "fs/promises"
import { existsSync } from "fs"
import { trpcServer } from "@hono/trpc-server"
import { Hono } from "hono"
import { cors } from "hono/cors"

export const TEST_DB_PATH = "./test-database.sqlite"

// Palantir API configuration for tests
export const palantirConfig = {
  url: process.env.PALANTIR_FOUNDRY_API_URL,
  ontologyRid: process.env.PALANTIR_ONTOLOGY_RID,
  apiKey: process.env.PALANTIR_AIP_API_KEY,
}

export async function setupTestEnvironment() {

  // Clean up any existing test database
  if (existsSync(TEST_DB_PATH)) {
    await unlink(TEST_DB_PATH)
  }

  process.env.DB_FILE_NAME = TEST_DB_PATH

  // Import app after env is set (db module opens SQLite and runs migrations)
  const { appRouter } = await import("../src/trpc/root")

  // Create test app
  const app = new Hono()
  app.use("/*", cors({ origin: "*" }))
  app.use("/trpc/*", trpcServer({ router: appRouter }))


  return app
}

export async function cleanupTestEnvironment() {
  if (existsSync(TEST_DB_PATH)) {
    await unlink(TEST_DB_PATH)
  }
}
