import { db } from "../../db/db"
import { jobs } from "../../db/schema"
import { eq, sql } from "drizzle-orm"
import { logger } from "../../logger"

export function enqueueJob(type: string, data: Record<string, unknown>, verbose: boolean): string {
  const id = crypto.randomUUID()
  if (verbose) {
    logger.debug({
      message: "scraper.job_queue.enqueue",
      jobId: id,
      type,
      dataKeys: Object.keys(data),
    })
  }
  db.insert(jobs).values({ id, type, data: JSON.stringify(data), status: "pending" }).run()
  if (verbose) {
    logger.debug({ message: "scraper.job_queue.enqueue_done", jobId: id, type })
  }
  return id
}

export function getJob(id: string, verbose: boolean) {
  if (verbose) {
    logger.debug({ message: "scraper.job_queue.get", jobId: id })
  }
  const row = db.select().from(jobs).where(eq(jobs.id, id)).get()
  if (verbose) {
    logger.debug({
      message: "scraper.job_queue.get_done",
      jobId: id,
      found: Boolean(row),
      status: row?.status ?? null,
    })
  }
  return row
}

export function claimNextJob(verbose: boolean) {
  if (verbose) {
    logger.debug({ message: "scraper.job_queue.claim_begin" })
  }
  const job = db.select().from(jobs).where(eq(jobs.status, "pending")).limit(1).get()

  if (!job) {
    if (verbose) {
      logger.debug({ message: "scraper.job_queue.claim_empty" })
    }
    return null
  }

  db.update(jobs)
    .set({ status: "processing", updatedAt: sql`(unixepoch())` })
    .where(eq(jobs.id, job.id))
    .run()

  if (verbose) {
    logger.debug({
      message: "scraper.job_queue.claim_done",
      jobId: job.id,
      type: job.type,
    })
  }
  return job
}

export function updateJob(
  id: string,
  update: { status?: string; result?: string; error?: string },
  verbose: boolean,
): void {
  if (verbose) {
    logger.debug({
      message: "scraper.job_queue.update_begin",
      jobId: id,
      nextStatus: update.status ?? null,
      hasResult: Boolean(update.result),
      hasError: Boolean(update.error),
    })
  }
  db.update(jobs)
    .set({ ...update, updatedAt: sql`(unixepoch())` })
    .where(eq(jobs.id, id))
    .run()
  if (verbose) {
    logger.debug({ message: "scraper.job_queue.update_done", jobId: id })
  }
}
