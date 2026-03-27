import { db } from "../db/db"
import { scrapeJobs } from "../db/schema"
import { eq, sql } from "drizzle-orm"

export function enqueueJob(url: string): string {
  const id = crypto.randomUUID()
  db.insert(scrapeJobs).values({ id, url, status: "pending" }).run()
  console.log(`[Queue] Job ${id} enqueued for ${url}`)
  return id
}

export function getJob(id: string) {
  return db.select().from(scrapeJobs).where(eq(scrapeJobs.id, id)).get()
}

export function claimNextJob() {
  const job = db.select().from(scrapeJobs).where(eq(scrapeJobs.status, "pending")).limit(1).get()

  if (!job) return null

  db.update(scrapeJobs)
    .set({ status: "processing", updatedAt: sql`(unixepoch())` })
    .where(eq(scrapeJobs.id, job.id))
    .run()

  console.log(`[Queue] Job ${job.id} claimed`)
  return job
}

export function updateJob(
  id: string,
  data: { status?: string; result?: string; error?: string }
): void {
  db.update(scrapeJobs)
    .set({ ...data, updatedAt: sql`(unixepoch())` })
    .where(eq(scrapeJobs.id, id))
    .run()

  console.log(`[Queue] Job ${id} updated: ${data.status || ""}`)
}
