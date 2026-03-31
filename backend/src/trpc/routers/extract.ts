import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { publicProcedure, router } from "../trpc"
import {
  extractCarDataFromPdf,
  extractListingData,
  pdfExtractedDataSchema,
  listingExtractedDataSchema,
} from "../../services/llm"
import { scrapeMarketplaceListing } from "../../services/marketplace"

const combinedExtractedDataSchema = pdfExtractedDataSchema.merge(listingExtractedDataSchema)

export const extractRouter = router({
  fromPdfText: publicProcedure
    .input(z.object({ text: z.string().min(50, "PDF text must be at least 50 characters") }))
    .output(pdfExtractedDataSchema)
    .mutation(async function extractFromPdfText({ input }) {
      try {
        const extracted = await extractCarDataFromPdf(input.text)
        return extracted
      } catch (error) {
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
      try {
        const extracted = await extractListingData(input.text)
        return extracted
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to extract listing data"
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        })
      }
    }),

  fromListingUrl: publicProcedure
    .input(z.object({ url: z.string().url("Must be a valid URL") }))
    .output(listingExtractedDataSchema)
    .mutation(async function extractFromListingUrl({ input }) {
      console.log(`[extract.fromListingUrl] Starting scrape for URL: ${input.url}`)
      
      let listing
      try {
        listing = await scrapeMarketplaceListing(input.url)
        console.log(`[extract.fromListingUrl] Scrape complete. Listing title: ${listing.marketplace_listing_title || "N/A"}`)
        console.log(`[extract.fromListingUrl] Listing data: ${JSON.stringify(listing, null, 2)}...`)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown scrape error"
        const stack = error instanceof Error ? error.stack : undefined
        console.error(`[extract.fromListingUrl] Scrape failed for URL: ${input.url}`)
        console.error(`[extract.fromListingUrl] Error: ${message}`)
        if (stack) console.error(`[extract.fromListingUrl] Stack: ${stack}`)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Scrape failed: ${message}`,
        })
      }

      try {
        const extracted = await extractListingData(listing)
        console.log(`[extract.fromListingUrl] Extraction complete: ${JSON.stringify(extracted)}`)
        return extracted
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown extraction error"
        const stack = error instanceof Error ? error.stack : undefined
        console.error(`[extract.fromListingUrl] LLM extraction failed: ${message}`)
        if (stack) console.error(`[extract.fromListingUrl] Stack: ${stack}`)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `LLM extraction failed: ${message}`,
        })
      }
    }),

  combined: publicProcedure
    .input(
      z.object({
        pdfText: z.string().min(50).optional(),
        listingUrl: z.string().url().optional(),
        listingText: z.string().min(20).optional(),
      })
    )
    .output(combinedExtractedDataSchema)
    .mutation(async function extractCombined({ input }) {
      const { pdfText, listingUrl, listingText } = input

      const results = await Promise.all([
        pdfText ? extractCarDataFromPdf(pdfText) : Promise.resolve(null),
        listingUrl
          ? (async function () {
              const listing = await scrapeMarketplaceListing(listingUrl)
              return extractListingData(listing)
            })()
          : listingText
            ? extractListingData(listingText)
            : Promise.resolve(null),
      ])

      const [pdfData, listingData] = results

      return {
        ...pdfData,
        ...listingData,
      }
    }),
})
