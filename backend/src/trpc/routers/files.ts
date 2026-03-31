import { z } from "zod"
import { publicProcedure, router } from "../trpc"
import { getPresignedDownloadUrl, getPresignedUploadUrl } from "../../services/r2"

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
      const url = await getPresignedUploadUrl(input.key, input.contentType)
      return { url }
    }),

  getPresignedDownloadUrl: publicProcedure
    .input(
      z.object({
        key: z.string().min(1),
      }),
    )
    .output(z.object({ url: z.string() }))
    .query(async function getDownloadUrl({ input }) {
      const url = await getPresignedDownloadUrl(input.key)
      return { url }
    }),
})

