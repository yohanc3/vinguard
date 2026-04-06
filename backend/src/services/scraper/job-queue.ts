import { db } from "../../db/db"
import { jobs } from "../../db/schema"
import { eq, sql } from "drizzle-orm"

export function enqueueJob(type: string, data: Record<string, unknown>): string {
  const id = crypto.randomUUID()
  db.insert(jobs).values({ id, type, data: JSON.stringify(data), status: "pending" }).run()
  return id
}

export function getJob(id: string) {
  return db.select().from(jobs).where(eq(jobs.id, id)).get()
}

export function claimNextJob() {
  const job = db.select().from(jobs).where(eq(jobs.status, "pending")).limit(1).get()

  if (!job) return null

  db.update(jobs)
    .set({ status: "processing", updatedAt: sql`(unixepoch())` })
    .where(eq(jobs.id, job.id))
    .run()

  return job
}

export function updateJob(
  id: string,
  update: { status?: string; result?: string; error?: string }
): void {
  db.update(jobs)
    .set({ ...update, updatedAt: sql`(unixepoch())` })
    .where(eq(jobs.id, id))
    .run()
}
