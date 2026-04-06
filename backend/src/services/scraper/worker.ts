import { claimNextJob, updateJob } from "./job-queue"
import { scrapeWithPlaywright } from "./playwright"
import { generateVehicleAnalysis } from "../vehicle-analysis"
import type { Job } from "../../db/schema"
import { logger } from "../../logger"

const POLL_INTERVAL = 2000

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms))
}

async function processJob(job: Job): Promise<void> {
  const data = JSON.parse(job.data || "{}")
  const start = Date.now()

  try {
    switch (job.type) {
      case "scrape": {
        const result = await scrapeWithPlaywright(data.url)
        updateJob(job.id, { status: "completed", result: JSON.stringify(result) })
        break
      }
      case "generate_analysis": {
        await generateVehicleAnalysis(data)
        updateJob(job.id, { status: "completed" })
        break
      }
      default:
        throw new Error(`Unknown job type: ${job.type}`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    updateJob(job.id, { status: "failed", error: message })
    const ms = Date.now() - start
    logger.error({
      message: "worker.job_failed",
      jobId: job.id,
      type: job.type,
      ms,
      errMessage: message,
      stack: err instanceof Error ? err.stack : undefined,
    })
  }
}

async function workerLoop(): Promise<void> {
  while (true) {
    const job = claimNextJob()

    if (!job) {
      await sleep(POLL_INTERVAL)
      continue
    }

    await processJob(job)

    await sleep(100)
  }
}

workerLoop().catch(function onFatalError(err) {
  logger.error({
    message: "worker.fatal",
    errMessage: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  })
  process.exit(1)
})
