/**
 * Test database setup and teardown utilities
 */

import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"
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

  // Set test database path
  process.env.DB_FILE_NAME = TEST_DB_PATH

  // Create and migrate test database
  const sqlite = new Database(TEST_DB_PATH)
  const db = drizzle({ client: sqlite })
  migrate(db, { migrationsFolder: "./drizzle" })
  sqlite.close()

  // Verify Palantir config

  // Import app router after DB is set up (dynamic import)
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
