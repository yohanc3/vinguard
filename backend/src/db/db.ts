import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import { Database } from "bun:sqlite"

const dbFile = process.env.DB_FILE_NAME ?? "database.sqlite"
const sqlite = new Database(dbFile)
const db = drizzle({ client: sqlite })

const migrationsFolder = "./drizzle"
migrate(db, { migrationsFolder })

export { db }
