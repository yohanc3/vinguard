import { z } from "zod"
import { callPalantirLLM, PalantirLlmHttpError, PalantirLlmResponseError } from "./llm"
import { searchDuckDuckGoPlain, extractFromSourcesParallel } from "./ddg-cheerio"
import { logger } from "../logger"

const PALANTIR_URL = process.env.PALANTIR_FOUNDRY_API_URL
const ONTOLOGY_RID = process.env.PALANTIR_ONTOLOGY_RID
const API_KEY = process.env.PALANTIR_AIP_API_KEY

const checklistItemSchema = z.object({
  id: z.string(),
  priority: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.enum(["recall", "inspection", "question", "test_drive", "documentation"]),
  completed: z.boolean(),
})

const sourceSchema = z.object({
  url: z.string(),
  title: z.string()
})

const vehicleAnalysisSchema = z.object({
  summaryLine: z.string(),
  verdict: z.object({
    label: z.enum(["strong_buy", "good_deal", "proceed_with_caution", "walk_away"]),
    justification: z.string(),
    upsides: z.array(z.string()),
    risks: z.array(z.string()),
  }),
  market: z.object({
    kbbValue: z.number().nullable(),
    tradeInValue: z.number().nullable(),
    privatePartyValue: z.number().nullable(),
    listingPrice: z.number(),
    percentDifference: z.number(),
    negotiationNote: z.string().nullable(),
  }),
  checklist: z.array(checklistItemSchema),
  sources: z.array(sourceSchema).optional(),
  generatedAt: z.string(),
  status: z.enum(["pending", "generating", "completed", "failed"]),
})

export type VehicleAnalysis = z.infer<typeof vehicleAnalysisSchema>

const queriesSchema = z.object({
  queries: z.array(z.string()).max(10),
})

const QUERIES_FORMAT = `{
  "queries": ["string", "string", ...]
}`

const ANALYSIS_FORMAT = `{
  "summaryLine": "string (e.g. '2006 Toyota Corolla CE · $1,400 · 40% below market · 2 items need attention · Verdict: Strong Buy')",
  "verdict": {
    "label": "strong_buy | good_deal | proceed_with_caution | walk_away",
    "justification": "1-2 sentence plain English explanation",
    "upsides": ["string", "string", ...],
    "risks": ["string", "string", ...]
  },
  "market": {
    "kbbValue": "number or null",
    "tradeInValue": "number or null",
    "privatePartyValue": "number or null",
    "listingPrice": "number",
    "percentDifference": "number (negative = below market)",
    "negotiationNote": "string or null"
  },
  "checklist": [
    {
      "id": "string (unique)",
      "priority": "number (1 = highest)",
      "title": "string (short action item)",
      "description": "string (detailed explanation)",
      "category": "recall | inspection | question | test_drive | documentation",
      "completed": false
    }
  ],
  "generatedAt": "ISO timestamp",
  "status": "completed"
}`

async function fetchCarFromPalantir(carId: string): Promise<Record<string, unknown> | null> {
  const baseUrl = `${PALANTIR_URL}/api/v2/ontologies/${ONTOLOGY_RID}`
  const res = await fetch(`${baseUrl}/objects/cars/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ where: { type: "eq", field: "id", value: carId } }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw Object.assign(new Error("palantir_fetch_car_failed"), {
      httpStatus: res.status,
      responseBody: body,
    })
  }

  const json = await res.json()
  return json?.data?.[0] ?? null
}

async function updateCarInPalantir(carId: string, vehicleAnalysis: string): Promise<boolean> {
  const baseUrl = `${PALANTIR_URL}/api/v2/ontologies/${ONTOLOGY_RID}`
  const res = await fetch(`${baseUrl}/actions/edit-cars/apply`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parameters: { cars: carId, vehicleAnalysis } }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw Object.assign(new Error("palantir_update_car_failed"), {
      httpStatus: res.status,
      responseBody: body,
    })
  }

  return true
}

interface ScrapeResult {
  miles: string | null
  price: string | null
  photos: string[]
  details: string | null
}

interface AnalysisJobData {
  carId: string
  scrapeResult?: ScrapeResult
  carfaxText?: string
}

export async function generateVehicleAnalysis(jobData: AnalysisJobData): Promise<void> {
  const { carId, scrapeResult, carfaxText } = jobData
  const start = Date.now()
  let failedStep = "init"
  let queriesResponseRaw = ""
  let analysisResponseRaw = ""
  let lastSourceCount = 0

  try {
    let carContext: Record<string, unknown>

    if (scrapeResult && carfaxText) {
      failedStep = "build_context_from_job"
      carContext = {
        listingMileage: scrapeResult.miles,
        listingPrice: scrapeResult.price ? parseFloat(scrapeResult.price.replace(/[^0-9.]/g, "")) : null,
        listingDetails: scrapeResult.details,
        carfaxReportText: carfaxText,
      }
    } else {
      failedStep = "fetch_car_palantir"
      const car = await fetchCarFromPalantir(carId)
      if (!car) {
        throw new Error(`Car not found: ${carId}`)
      }

      carContext = {
        vin: car.vin,
        make: car.make,
        model: car.model,
        year: car.year,
        trim: car.trim,
        color: car.color,
        bodyStyle: car.bodyStyle,
        engineType: car.engineType,
        cylinders: car.cylinders,
        listingPrice: car.listingPrice,
        listingMileage: car.listingMileage,
        listingDetails: car.listingDetails,
        msrp: car.msrp,
        fairMarketValueHigh: car.fairMarketValueHigh,
        fairMarketValueLow: car.fairMarketValueLow,
        numberOfPreviousOwners: car.numberOfPreviousOwners,
        titleStatus: car.titleStatus,
        salvageRecord: car.salvageRecord,
        floodDamageHistory: car.floodDamageHistory,
        odometerReadings: car.odometerReadings,
        stateOfRegistration: car.stateOfRegistration,
        carReport: car.carReport,
      }
    }

    failedStep = "llm_queries"
    const queriesPrompt = `You are a vehicle research assistant. Given the following car data and CarFax report, generate exactly 10 search queries to research this vehicle.

Distribute queries across these categories:
- 2-3 queries about common problems/reliability for this make/model/year
- 1-2 queries about recall information
- 2-3 queries about fair market value and pricing
- 1-2 queries about model-specific inspection points
- 1-2 queries about known weak points or things to ask the seller

Car Data:
${JSON.stringify(carContext, null, 2)}

Return ONLY valid JSON with exactly this shape:
{ "queries": ["query1", "query2", ...] }

Each query should be a specific, searchable phrase that will help evaluate this vehicle.`

    queriesResponseRaw = await callPalantirLLM({
      systemContent: "You are a vehicle research query generator. Return only valid JSON.",
      userContent: queriesPrompt,
      jsonResponseFormat: QUERIES_FORMAT,
      jsonResponseFormatInstructions: "Return raw JSON only. No markdown code blocks. Return exactly 10 queries.",
    })

    failedStep = "parse_queries"
    let queries: string[]
    try {
      const parsed = queriesSchema.parse(JSON.parse(queriesResponseRaw))
      queries = parsed.queries.slice(0, 10)
    } catch {
      throw new Error("Failed to generate search queries")
    }

    failedStep = "web_research"
    const maxCharsPerSource = 700

    const allUrlsPromises = queries.map(async function runQuery(query) {
      let results = await searchDuckDuckGoPlain(query)
      results = results.slice(0, 3)
      return results
    })

    const allUrlsResults = await Promise.allSettled(allUrlsPromises)

    const allUrls = allUrlsResults
      .filter(function isFulfilled(result): result is PromiseFulfilledResult<string[]> {
        return result.status === "fulfilled"
      })
      .flatMap(function getValue(result) {
        return result.value
      })

    const urlsData = await extractFromSourcesParallel(allUrls, 30, maxCharsPerSource)
    lastSourceCount = urlsData.length

    const webContext = urlsData
      .map(function formatSource(s, i) {
        return `[Source ${i + 1}] \nURL: ${s.url}\n${s.extractedText}`
      })
      .join("\n\n")

    failedStep = "llm_analysis"
    const analysisPrompt = `You are an expert vehicle analyst. Based on the car data, CarFax report, and web research provided, generate a comprehensive vehicle analysis report.

CAR DATA:
${JSON.stringify(carContext, null, 2)}

WEB RESEARCH:
${webContext}

Generate a complete analysis with:

1. SUMMARY LINE: A single line like "2006 Toyota Corolla CE · $1,400 · 40% below market · 2 items need attention · Verdict: Strong Buy"

2. VERDICT:
   - label: Choose from strong_buy, good_deal, proceed_with_caution, or walk_away
   - justification: 1-2 sentences explaining why
   - upsides: 3-4 positive points about this deal
   - risks: 3-4 concerns or red flags

3. MARKET COMPARISON:
   - Estimate KBB value, trade-in value, and private party value based on research
   - Calculate percent difference from listing price (negative = below market)
   - Include a negotiation note if relevant

4. CHECKLIST: Create 5-8 prioritized action items. Keep items general (e.g., "Verify recall status" not individual recalls). Categories:
   - recall: Check/verify recalls
   - inspection: Pre-purchase inspection items
   - question: Questions to ask the seller
   - test_drive: Things to check during test drive
   - documentation: Paperwork to verify

Return ONLY valid JSON matching this exact schema:
${ANALYSIS_FORMAT}`

    analysisResponseRaw = await callPalantirLLM({
      systemContent: "You are an expert vehicle analyst. Return only valid JSON matching the exact schema provided.",
      userContent: analysisPrompt,
      jsonResponseFormat: ANALYSIS_FORMAT,
      jsonResponseFormatInstructions: "Return raw JSON only. No markdown code blocks.",
    })

    failedStep = "parse_analysis"
    let analysis: VehicleAnalysis
    try {
      const parsed = JSON.parse(analysisResponseRaw) as Record<string, unknown>
      parsed.generatedAt = new Date().toISOString()
      parsed.status = "completed"

      const checklist = parsed.checklist as Array<Record<string, unknown>>
      for (let i = 0; i < checklist.length; i++) {
        if (!checklist[i].id) {
          checklist[i].id = `item-${i + 1}`
        }
        checklist[i].completed = false
      }

      const uniqueUrls = new Set<string>()
      parsed.sources = urlsData
        .filter(function dedupe(source) {
          if (uniqueUrls.has(source.url)) return false
          uniqueUrls.add(source.url)
          return true
        })
        .map(function toSource(source) {
          return { url: source.url, title: source.title }
        })

      analysis = vehicleAnalysisSchema.parse(parsed)
    } catch {
      throw new Error("Failed to generate vehicle analysis")
    }

    failedStep = "save_palantir"
    await updateCarInPalantir(carId, JSON.stringify(analysis))
  } catch (error) {
    const ms = Date.now() - start

    if (error instanceof PalantirLlmHttpError) {
      logger.error({
        message: "vehicle-analysis_llm_http",
        carId,
        failedStep,
        ms,
        errMessage: error.message,
        responseBody: error.responseBody,
        llmInput: error.llmInput,
      })
      throw error
    }
    if (error instanceof PalantirLlmResponseError) {
      logger.error({
        message: "vehicle-analysis_llm_response",
        carId,
        failedStep,
        ms,
        errMessage: error.message,
        responseBody: error.responseBody,
        llmInput: error.llmInput,
      })
      throw error
    }

    if (error instanceof Error && error.message === "Failed to generate search queries") {
      logger.error({
        message: "vehicle-analysis_queries_parse",
        carId,
        failedStep,
        ms,
        errMessage: error.message,
        queriesResponsePreview: queriesResponseRaw.slice(0, 800),
      })
      throw error
    }
    if (error instanceof Error && error.message === "Failed to generate vehicle analysis") {
      logger.error({
        message: "vehicle-analysis_analysis_parse",
        carId,
        failedStep,
        ms,
        errMessage: error.message,
        analysisResponsePreview: analysisResponseRaw.slice(0, 1200),
        sourceCount: lastSourceCount,
      })
      throw error
    }
    if (error instanceof Error && error.message === "palantir_update_car_failed") {
      const extra = error as Error & { httpStatus?: number; responseBody?: string }
      logger.error({
        message: "vehicle-analysis_palantir_update",
        carId,
        failedStep,
        ms,
        httpStatus: extra.httpStatus,
        responseBody: extra.responseBody,
      })
      throw error
    }
    if (error instanceof Error && error.message === "palantir_fetch_car_failed") {
      const extra = error as Error & { httpStatus?: number; responseBody?: string }
      logger.error({
        message: "vehicle-analysis_palantir_fetch",
        carId,
        failedStep,
        ms,
        httpStatus: extra.httpStatus,
        responseBody: extra.responseBody,
      })
      throw error
    }
    if (error instanceof Error && error.message.startsWith("Car not found")) {
      logger.error({
        message: "vehicle-analysis_car_not_found",
        carId,
        failedStep,
        ms,
        errMessage: error.message,
      })
      throw error
    }

    logger.error({
      message: "vehicle-analysis",
      carId,
      failedStep,
      ms,
      errMessage: error instanceof Error ? error.message : "unknown",
      stack: error instanceof Error ? error.stack : undefined,
      sourceCount: lastSourceCount,
    })
    throw error
  }
}
