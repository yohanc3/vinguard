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
  console.log("\n" + "=".repeat(60))
  console.log("VINGUARD BACKEND TEST SUITE")
  console.log("=".repeat(60))

  // Clean up any existing test database
  if (existsSync(TEST_DB_PATH)) {
    await unlink(TEST_DB_PATH)
  }

  // Set test database path
  process.env.DB_FILE_NAME = TEST_DB_PATH

  // Create and migrate test database
  console.log("\n[Setup] Creating test database...")
  const sqlite = new Database(TEST_DB_PATH)
  const db = drizzle({ client: sqlite })
  migrate(db, { migrationsFolder: "./drizzle" })
  sqlite.close()
  console.log("[Setup] Test database created and migrated")

  // Verify Palantir config
  console.log("[Setup] Palantir API config loaded")

  // Import app router after DB is set up (dynamic import)
  const { appRouter } = await import("../src/trpc/root")

  // Create test app
  const app = new Hono()
  app.use("/*", cors({ origin: "*" }))
  app.use("/trpc/*", trpcServer({ router: appRouter }))

  console.log("[Setup] Test app created\n")

  return app
}

export async function cleanupTestEnvironment() {
  console.log("\n[Cleanup] Removing test database...")
  if (existsSync(TEST_DB_PATH)) {
    await unlink(TEST_DB_PATH)
    console.log("[Cleanup] Test database deleted")
  }
  console.log("\n" + "=".repeat(60))
  console.log("TEST SUITE COMPLETE")
  console.log("=".repeat(60) + "\n")
}
