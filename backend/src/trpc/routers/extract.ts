import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { publicProcedure, router } from "../trpc"
import {
  extractCarDataFromPdf,
  extractListingData,
  pdfExtractedDataSchema,
  listingExtractedDataSchema,
  PalantirLlmHttpError,
  PalantirLlmResponseError,
} from "../../services/llm"
import { logger } from "../../logger"

const combinedExtractedDataSchema = pdfExtractedDataSchema.merge(listingExtractedDataSchema)

const combinedInputSchema = z
  .object({
    pdfText: z.string().min(50).optional(),
    listingText: z.string().min(20).optional(),
  })
  .refine(
    function hasAtLeastOneSource(data) {
      return Boolean(data.pdfText) || Boolean(data.listingText)
    },
    { message: "Provide pdfText and/or listingText" },
  )

export const extractRouter = router({
  fromPdfText: publicProcedure
    .input(z.object({ text: z.string().min(50, "PDF text must be at least 50 characters") }))
    .output(pdfExtractedDataSchema)
    .mutation(async function extractFromPdfText({ input }) {
      const start = Date.now()
      try {
        const extracted = await extractCarDataFromPdf(input.text)
        return extracted
      } catch (error) {
        const ms = Date.now() - start
        if (error instanceof PalantirLlmHttpError || error instanceof PalantirLlmResponseError) {
          logger.error({
            message: "extract.fromPdfText_llm",
            ms,
            errMessage: error.message,
            responseBody: error.responseBody,
            llmInput: error.llmInput,
            textLength: input.text.length,
          })
        } else {
          logger.error({
            message: "extract.fromPdfText",
            ms,
            errMessage: error instanceof Error ? error.message : "unknown",
            stack: error instanceof Error ? error.stack : undefined,
            textLength: input.text.length,
          })
        }
        const message = error instanceof Error ? error.message : "Failed to extract PDF data"
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        })
      }
    }),

  fromListingText: publicProcedure
    .input(z.object({ text: z.string().min(20, "Listing text must be at least 20 characters") }))
    .output(listingExtractedDataSchema)
    .mutation(async function extractFromListingText({ input }) {
      const start = Date.now()
      try {
        const extracted = await extractListingData(input.text)
        return extracted
      } catch (error) {
        const ms = Date.now() - start
        if (error instanceof PalantirLlmHttpError || error instanceof PalantirLlmResponseError) {
          logger.error({
            message: "extract.fromListingText_llm",
            ms,
            errMessage: error.message,
            responseBody: error.responseBody,
            llmInput: error.llmInput,
            textLength: input.text.length,
          })
        } else {
          logger.error({
            message: "extract.fromListingText",
            ms,
            errMessage: error instanceof Error ? error.message : "unknown",
            stack: error instanceof Error ? error.stack : undefined,
            textLength: input.text.length,
          })
        }
        const message = error instanceof Error ? error.message : "Failed to extract listing data"
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        })
      }
    }),

  combined: publicProcedure
    .input(combinedInputSchema)
    .output(combinedExtractedDataSchema)
    .mutation(async function extractCombined({ input }) {
      const start = Date.now()
      const inputSnapshot = {
        hasPdf: Boolean(input.pdfText),
        hasListingText: Boolean(input.listingText),
      }

      try {
        const { pdfText, listingText } = input

        const results = await Promise.all([
          pdfText ? extractCarDataFromPdf(pdfText) : Promise.resolve(null),
          listingText ? extractListingData(listingText) : Promise.resolve(null),
        ])

        const [pdfData, listingData] = results

        return {
          ...pdfData,
          ...listingData,
        }
      } catch (error) {
        const ms = Date.now() - start
        if (error instanceof PalantirLlmHttpError || error instanceof PalantirLlmResponseError) {
          logger.error({
            message: "extract.combined_llm",
            ms,
            errMessage: error.message,
            responseBody: error.responseBody,
            llmInput: error.llmInput,
            input: inputSnapshot,
          })
        } else {
          logger.error({
            message: "extract.combined",
            ms,
            errMessage: error instanceof Error ? error.message : "unknown",
            stack: error instanceof Error ? error.stack : undefined,
            input: inputSnapshot,
          })
        }
        const message = error instanceof Error ? error.message : "Combined extraction failed"
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        })
      }
    }),
})
