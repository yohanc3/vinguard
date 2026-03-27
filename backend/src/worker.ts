import { claimNextJob, updateJob } from "./services/scrape-queue"
import { scrapeWithPlaywright } from "./services/scraper/playwright"
import type { ScrapeJob } from "./db/schema"

const POLL_INTERVAL = 2000

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms))
}

async function processJob(job: ScrapeJob): Promise<void> {
  console.log(`[Worker] Processing job ${job.id}: ${job.url}`)

  try {
    const result = await scrapeWithPlaywright(job.url)
    updateJob(job.id, { status: "completed", result: JSON.stringify(result) })
    console.log(`[Worker] Job ${job.id} completed`)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    updateJob(job.id, { status: "failed", error: message })
    console.error(`[Worker] Job ${job.id} failed: ${message}`)
  }
}

async function workerLoop(): Promise<void> {
  console.log("[Worker] Starting worker loop...")

  while (true) {
    const job = claimNextJob()

    if (!job) {
      await sleep(POLL_INTERVAL)
      continue
    }

    // Process job in parallel (don't await)
    processJob(job)

    // Small delay before checking for next job
    await sleep(100)
  }
}

console.log("=".repeat(60))
console.log("VINGUARD SCRAPER WORKER")
console.log("=".repeat(60))

workerLoop().catch((err) => {
  console.error("[Worker] Fatal error:", err)
  process.exit(1)
})
