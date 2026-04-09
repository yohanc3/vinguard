import { claimNextJob, updateJob } from "./job-queue"
import { generateVehicleAnalysis } from "../vehicle-analysis"
import type { Job } from "../../db/schema"
import { logger } from "../../logger"

const POLL_INTERVAL = 2000

function sleep(ms: number): Promise<void> {
  return new Promise(function scheduleSleep(res) {
    setTimeout(res, ms)
  })
}

async function processJob(job: Job, verbose: boolean): Promise<void> {
  const data = JSON.parse(job.data || "{}") as Record<string, unknown>
  const start = Date.now()

  if (verbose) {
    logger.debug({
      message: "scraper.worker.job_process_begin",
      jobId: job.id,
      type: job.type,
    })
  }

  try {
    switch (job.type) {
      case "generate_analysis": {
        await generateVehicleAnalysis(
          data as unknown as Parameters<typeof generateVehicleAnalysis>[0],
        )
        updateJob(job.id, { status: "completed" }, verbose)
        if (verbose) {
          logger.debug({
            message: "scraper.worker.job_process_done",
            jobId: job.id,
            type: job.type,
            ms: Date.now() - start,
          })
        }
        break
      }
      default:
        throw new Error(`Unknown job type: ${job.type}`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    updateJob(job.id, { status: "failed", error: message }, verbose)
    const ms = Date.now() - start
    if (verbose) {
      logger.debug({
        message: "scraper.worker.job_process_error",
        jobId: job.id,
        type: job.type,
        ms,
        errMessage: message,
      })
    }
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
  const verbose = process.env.VERBOSE === "true"
  if (verbose) {
    logger.debug({
      message: "scraper.worker.loop_start",
      pollIntervalMs: POLL_INTERVAL,
      verbose: true,
    })
  }

  while (true) {
    const job = claimNextJob(verbose)

    if (!job) {
      if (verbose) {
        logger.debug({
          message: "scraper.worker.poll_idle",
          sleepMs: POLL_INTERVAL,
        })
      }
      await sleep(POLL_INTERVAL)
      continue
    }

    await processJob(job, verbose)

    if (verbose) {
      logger.debug({ message: "scraper.worker.post_job_sleep", sleepMs: 100 })
    }
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
