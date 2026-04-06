import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { publicProcedure, router } from "../trpc"
import { getPresignedDownloadUrl, getPresignedUploadUrl } from "../../services/r2"
import { logger } from "../../logger"

export const filesRouter = router({
  getPresignedUploadUrl: publicProcedure
    .input(
      z.object({
        key: z.string().min(1),
        contentType: z.string().min(1),
      }),
    )
    .output(z.object({ url: z.string() }))
    .mutation(async function getUploadUrl({ input }) {
      const start = Date.now()
      try {
        const url = await getPresignedUploadUrl(input.key, input.contentType)
        return { url }
      } catch (error) {
        const ms = Date.now() - start
        logger.error({
          message: "files.getPresignedUploadUrl",
          ms,
          errMessage: error instanceof Error ? error.message : "unknown",
          stack: error instanceof Error ? error.stack : undefined,
          key: input.key,
          contentType: input.contentType,
        })
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create upload URL",
        })
      }
    }),

  getPresignedDownloadUrl: publicProcedure
    .input(
      z.object({
        key: z.string().min(1),
      }),
    )
    .output(z.object({ url: z.string() }))
    .query(async function getDownloadUrl({ input }) {
      const start = Date.now()
      try {
        const url = await getPresignedDownloadUrl(input.key)
        return { url }
      } catch (error) {
        const ms = Date.now() - start
        logger.error({
          message: "files.getPresignedDownloadUrl",
          ms,
          errMessage: error instanceof Error ? error.message : "unknown",
          stack: error instanceof Error ? error.stack : undefined,
          key: input.key,
        })
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to create download URL",
        })
      }
    }),
})
