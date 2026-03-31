import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { publicProcedure, router } from "../trpc"
import { enqueueJob, getJob } from "../../services/scraper/scrape-queue"

export const scrapeRouter = router({
  startScrape: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(function startScrape({ input }) {
      const jobId = enqueueJob(input.url)
      return { jobId }
    }),

  getScrapeStatus: publicProcedure
    .input(z.object({ jobId: z.string() }))
    .query(function getScrapeStatus({ input }) {
      const job = getJob(input.jobId)

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" })
      }

      return {
        id: job.id,
        url: job.url,
        status: job.status,
        result: job.result ? JSON.parse(job.result) : null,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      }
    }),
})
