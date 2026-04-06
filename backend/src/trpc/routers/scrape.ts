import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { publicProcedure, router } from "../trpc"
import { enqueueJob, getJob } from "../../services/scraper/job-queue"
import { logger } from "../../logger"

export const scrapeRouter = router({
  startScrape: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(function startScrape({ input }) {
      const jobId = enqueueJob("scrape", { url: input.url })
      return { jobId }
    }),

  getScrapeStatus: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .query(function getScrapeStatus({ input }) {
      const job = getJob(input.jobId)

      if (!job) {
        logger.error({
          message: "scrape.getScrapeStatus_not_found",
          jobId: input.jobId,
        })
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" })
      }

      const data = job.data ? JSON.parse(job.data) : {}

      return {
        id: job.id,
        type: job.type,
        url: data.url,
        status: job.status,
        result: job.result ? JSON.parse(job.result) : null,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      }
    }),
})
