import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { publicProcedure, router } from "../trpc"
import { callPalantirLLM } from "../../services/llm"
import { extractFromSourcesParallel, searchDuckDuckGoPlain } from "../../services/ddg-cheerio"

const CHAT_MAX_MESSAGES = 10

const sourceSchema = z.object({
    url: z.string(),
    title: z.string(),
})

export type Source = z.infer<typeof sourceSchema>

const palantirChatHistoryEntrySchema = z.object({
    role: z.string(),
    message: z.string(),
    source1: z.string().optional().nullable(),
    source2: z.string().optional().nullable(),
    source3: z.string().optional().nullable(),
})

const apiChatHistoryEntrySchema = z.object({
    role: z.string(),
    message: z.string(),
    sources: z.array(sourceSchema).optional(),
})

const carContextSchema = z.object({
    vin: z.string().nullable(),
    make: z.string().nullable(),
    model: z.string().nullable(),
    year: z.number().nullable(),
    trim: z.string().nullable(),
    listingMileage: z.string().nullable(),
    listingPrice: z.number().nullable(),
    listingDetails: z.array(z.string()).nullable(),
    odometerReadings: z.array(z.number()).nullable(),
})

const llmQueriesSchema = z.object({
    queries: z.array(z.string()),
})

const llmAnswerSchema = z.object({
    message: z.string(),
    sources: z.array(sourceSchema),
})

const LLM_QUERIES_FORMAT = `{
  "queries": ["string", "string"]
}`

const LLM_ANSWER_FORMAT = `{
  "message": "string (use markdown formatting for better readability)",
  "sources": [{ "url": "string", "title": "short descriptive title (3-6 words)" }]
}`

function parseSourceString(sourceStr: string | null | undefined): Source | null {
    if (!sourceStr) return null
    try {
        const parsed = JSON.parse(sourceStr)
        if (parsed && typeof parsed.url === "string" && typeof parsed.title === "string") {
            return parsed as Source
        }
        return null
    } catch {
        return null
    }
}

function palantirEntryToApiEntry(entry: z.infer<typeof palantirChatHistoryEntrySchema>): z.infer<typeof apiChatHistoryEntrySchema> {
    const sources: Source[] = []
    const s1 = parseSourceString(entry.source1)
    const s2 = parseSourceString(entry.source2)
    const s3 = parseSourceString(entry.source3)
    if (s1) sources.push(s1)
    if (s2) sources.push(s2)
    if (s3) sources.push(s3)

    return {
        role: entry.role,
        message: entry.message,
        sources,
    }
}

function apiEntryToPalantirEntry(entry: z.infer<typeof apiChatHistoryEntrySchema>): z.infer<typeof palantirChatHistoryEntrySchema> {
    const sources = entry.sources ?? []
    return {
        role: entry.role,
        message: entry.message,
        source1: sources[0] ? JSON.stringify(sources[0]) : null,
        source2: sources[1] ? JSON.stringify(sources[1]) : null,
        source3: sources[2] ? JSON.stringify(sources[2]) : null,
    }
}

const sendMessageInputSchema = z.object({
    carId: z.string().min(1),
    message: z.string().min(1),
    chatHistory: z.array(apiChatHistoryEntrySchema).max(CHAT_MAX_MESSAGES),
    carContext: carContextSchema,
})

export const chatRouter = router({
    getChatHistory: publicProcedure
        .input(z.object({ carId: z.string().min(1) }))
        .output(
            z.object({
                chatHistory: z.array(apiChatHistoryEntrySchema),
            }),
        )
        .query(async function getChatHistory({ input }) {
            const res = await fetch(
                `${process.env.PALANTIR_FOUNDRY_API_URL}/api/v2/ontologies/${process.env.PALANTIR_ONTOLOGY_RID}/objects/cars/search`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.PALANTIR_AIP_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ where: { type: "eq", field: "id", value: input.carId } }),
                },
            )

            if (!res.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to load car" })

            const json = await res.json()
            const car = json?.data?.[0] ?? null
            const rawHistory = Array.isArray(car?.chatHistory) ? car.chatHistory : []

            const chatHistory = rawHistory.map(function(entry: unknown) {
                const parsed = palantirChatHistoryEntrySchema.safeParse(entry)
                if (parsed.success) {
                    return palantirEntryToApiEntry(parsed.data)
                }
                return { role: "unknown", message: "", sources: [] }
            })

            return { chatHistory }
        }),

    sendMessageStream: publicProcedure
        .input(sendMessageInputSchema)
        .subscription(async function* sendMessageStream({ input }) {
            console.log("[chat.sendMessageStream] input", {
                carId: input.carId,
                message: input.message,
                chatHistoryCount: input.chatHistory.length,
                carContext: input.carContext,
            })

            const palantirUrl = process.env.PALANTIR_FOUNDRY_API_URL
            const ontologyRid = process.env.PALANTIR_ONTOLOGY_RID
            const apiKey = process.env.PALANTIR_AIP_API_KEY

            if (!palantirUrl || !ontologyRid || !apiKey) {
                console.log("[chat.sendMessageStream] missing env")
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Palantir env missing" })
            }

            const baseUrl = `${palantirUrl}/api/v2/ontologies/${ontologyRid}`
            const headers = {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            }

            const carContext = input.carContext

            const last10ChatForPrompt = input.chatHistory.slice(-CHAT_MAX_MESSAGES).map(function(m) {
                return {
                    role: m.role,
                    message: m.message,
                    sources: m.sources ?? [],
                }
            })

            // Step 1: Generate search queries
            yield { type: "status" as const, message: "Thinking..." }

            console.log("[chat.sendMessageStream] step1 LLM queries")
            const queryResponseRaw = await callPalantirLLM({
                systemContent: `You are a research query generator for a car-focused assistant.
Given the car context and the user's message, return ONLY valid JSON with EXACTLY this shape:
{ "queries": [ "string", "string" ] }
Use best-effort web search queries that help answer the user. Do not include markdown code fences.`,
                jsonResponseFormat: LLM_QUERIES_FORMAT,
                jsonResponseFormatInstructions: `Return raw JSON only. No markdown code blocks.
Schema:
{ "queries": [ "string", "string" ] }`,
                userContent: `Car context:\n${JSON.stringify(carContext)}\n\nLast 10 chat messages:\n${JSON.stringify(last10ChatForPrompt)}\n\nUser message:\n${input.message}`,
            })

            console.log("[chat.sendMessageStream] step1 LLM queries raw (preview)", queryResponseRaw.substring(0, 400))
            let queryParsed: z.infer<typeof llmQueriesSchema> | null = null
            try {
                queryParsed = llmQueriesSchema.parse(JSON.parse(queryResponseRaw))
            } catch (error) {
                console.log("[chat.sendMessageStream] invalid LLM query JSON", {
                    error: error instanceof Error ? error.message : "unknown error",
                    rawPreview: queryResponseRaw.substring(0, 500),
                })
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "LLM returned invalid query JSON",
                })
            }

            const queries = queryParsed.queries
            console.log("[chat.sendMessageStream] step1 queries", queries)

            // Step 2: Search the web
            yield { type: "status" as const, message: "Searching the web..." }

            console.log("[chat.sendMessageStream] step2 DDG search")
            const maxCharsPerSource = 700

            const queryBlocks = await Promise.all(
                queries.map(async function(q, idx) {
                    console.log("[chat.sendMessageStream] DDG search start", { idx, query: q })
                    const urls = await searchDuckDuckGoPlain(q)
                    const topUrls = urls.slice(0, 3)
                    console.log("[chat.sendMessageStream] DDG search urls", { idx, query: q, topUrls })
                    return { idx, query: q, urls: topUrls }
                }),
            )

            // Step 3: Extract content from sources
            yield { type: "status" as const, message: "Reading sources..." }

            console.log("[chat.sendMessageStream] step3 extracting from sources")
            const extractedBlocks = await Promise.all(
                queryBlocks.map(async function(block) {
                    const extracted = await extractFromSourcesParallel(block.urls, 3, maxCharsPerSource)
                    console.log("[chat.sendMessageStream] extracted", {
                        idx: block.idx,
                        query: block.query,
                        extractedCount: extracted.length,
                    })
                    return { ...block, extracted }
                }),
            )

            const ddgContext = extractedBlocks
                .flatMap(function(b) {
                    return b.extracted.map(function(s, i) {
                        return `Source ${b.idx + 1}.${i + 1} (${s.url}):\n${s.extractedText}`
                    })
                })
                .join("\n\n")

            console.log("[chat.sendMessageStream] ddgContext chars", ddgContext.length)

            // Step 4: Generate final answer
            yield { type: "status" as const, message: "Writing response..." }

            console.log("[chat.sendMessageStream] step4 final LLM answer")
            const answerResponseRaw = await callPalantirLLM({
                systemContent: `You are a helpful car-focused assistant.
Use the car context, the last 10 chat messages, and the provided web sources to answer the user's message.
Use markdown formatting for better readability (headers, bold, lists, etc.).
Return ONLY valid JSON with this shape:
{ "message": "string (markdown formatted)", "sources": [{ "url": "string", "title": "short descriptive title" }] }
Include up to 3 most relevant sources used. Each title should be 3-6 words describing what the source contains.
Do NOT include markdown code fences around the JSON.`,
                jsonResponseFormat: LLM_ANSWER_FORMAT,
                jsonResponseFormatInstructions: `Return raw JSON only. No markdown code blocks.
Schema:
{ "message": "string", "sources": [{ "url": "string", "title": "string" }] }`,
                userContent: `Car context:\n${JSON.stringify(carContext)}\n\nLast 10 chat messages:\n${JSON.stringify(last10ChatForPrompt)}\n\nWeb sources:\n${ddgContext}\n\nUser message:\n${input.message}`,
            })

            console.log("[chat.sendMessageStream] step4 LLM answer raw (preview)", answerResponseRaw.substring(0, 500))
            let answerParsed: z.infer<typeof llmAnswerSchema> | null = null
            try {
                answerParsed = llmAnswerSchema.parse(JSON.parse(answerResponseRaw))
            } catch (error) {
                console.log("[chat.sendMessageStream] invalid LLM answer JSON", {
                    error: error instanceof Error ? error.message : "unknown error",
                    rawPreview: answerResponseRaw.substring(0, 500),
                })
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "LLM returned invalid answer JSON",
                })
            }

            const assistantMessage = answerParsed.message
            const sources = answerParsed.sources.slice(0, 3)

            console.log("[chat.sendMessageStream] assistantMessage preview", assistantMessage.substring(0, 200))
            console.log("[chat.sendMessageStream] sources", sources)

            // Step 5: Persist to Palantir (convert to Palantir format with stringified sources)
            console.log("[chat.sendMessageStream] step5 persisting to Palantir")

            const assistantApiEntry: z.infer<typeof apiChatHistoryEntrySchema> = {
                role: "assistant",
                message: assistantMessage,
                sources: sources,
            }

            const finalHistoryForPalantir = input.chatHistory
                .slice(-CHAT_MAX_MESSAGES)
                .concat([assistantApiEntry])
                .slice(-CHAT_MAX_MESSAGES)
                .map(apiEntryToPalantirEntry)

            console.log("[chat.sendMessageStream] finalHistoryForPalantir", finalHistoryForPalantir)

            const editAssistantRes = await fetch(`${baseUrl}/actions/edit-cars/apply`, {
                method: "POST",
                headers,
                body: JSON.stringify({ parameters: { cars: input.carId, chatHistory: finalHistoryForPalantir } }),
            })

            if (!editAssistantRes.ok) {
                const errorText = await editAssistantRes.text()
                console.log("[chat.sendMessageStream] persist failed", {
                    status: editAssistantRes.status,
                    bodyPreview: errorText.substring(0, 300),
                })
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: `Failed to persist assistant chat: ${errorText.substring(0, 200)}`,
                })
            }

            const res = await editAssistantRes.text();

            console.log("[chat.sendMessageStream] persist ok", "response", res, { carId: input.carId, finalHistoryCount: finalHistoryForPalantir.length })

            // Final: Send complete event (with parsed sources for frontend)
            yield {
                type: "complete" as const,
                message: assistantMessage,
                sources: sources,
            }
            
            console.log("finishing sending events") 
            return;
        }),
})
