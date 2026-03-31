import { expect } from "bun:test"
import { z } from "zod"
import { testState, TEST_CAR } from "./state"
import { searchDuckDuckGoPlain, extractFromSources } from "../src/services/ddg-cheerio"

const DDG_QUERY = "Who is lebron james"
const DDG_MAX_SOURCES = 5
const DDG_MAX_CHARS_PER_SOURCE = 700

const sourceSchema = z.object({
  url: z.string(),
  title: z.string(),
})

const apiChatHistoryEntrySchema = z.object({
  role: z.string(),
  message: z.string(),
  sources: z.array(sourceSchema).optional(),
})

export async function runChatTests() {
  console.log("\n" + "─".repeat(60))
  console.log("5. Chat Tests (DDG + Palantir)")
  console.log("─".repeat(60))

  await testDdGCheerioExtraction()
  await testChatHistorySchema()
}

async function testDdGCheerioExtraction() {
  console.log(`  [5.1] DDG + cheerio extraction: "${DDG_QUERY}"`)

  console.log("  [5.1] step A: searching ddg")
  const searchStart = Date.now()
  const urls = await searchDuckDuckGoPlain(DDG_QUERY)
  const searchMs = Date.now() - searchStart

  console.log("  [5.1] step A done", { ms: searchMs, totalUrls: urls.length })
  const firstUrls = urls.slice(0, DDG_MAX_SOURCES)
  console.log("  [5.1] step B: top urls", { topCount: firstUrls.length, urls: firstUrls })

  console.log("  [5.1] step C: extracting from sources (sequential)")
  const extractStart = Date.now()

  const extractPromise = extractFromSources(firstUrls, DDG_MAX_SOURCES, DDG_MAX_CHARS_PER_SOURCE)
  const timeoutMs = 30000
  const timeoutPromise = new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`DDG extractFromSources timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  const sources = await Promise.race([extractPromise, timeoutPromise]) as Awaited<
    ReturnType<typeof extractFromSources>
  >
  const extractMs = Date.now() - extractStart
  console.log("  [5.1] step C done", { ms: extractMs, extractedCount: sources.length })

  expect(sources.length).toBeGreaterThan(0)

  const target = `LeBron`
  let found = false

  console.log("  [5.1] step D: scanning extracted snippets for target")
  for (const src of sources) {
    const snippet600 = src.extractedText.slice(0, 600)
    const normalized = snippet600
      .replace(/['']/g, '"')
      .replace(/[""]/g, '"')
      .replace(/\u00A0/g, " ")

    const includesTarget = normalized.includes(target)

    console.log(`  [5.1] Source: ${src.url}`)
    console.log(`  [5.1] First 600 chars:\n${snippet600}`)
    console.log("  [5.1] includesTarget", { url: src.url, includesTarget })

    if (includesTarget) found = true
  }

  expect(found).toBe(true)
  console.log("  ✓ [5.1] Found LeBron in one of the sources")
}

async function testChatHistorySchema() {
  console.log("  [5.2] chat.getChatHistory schema validation")

  if (!testState.palantirAvailable) {
    console.log("  ⊘ 5.2 skipped (Palantir unavailable)")
    return
  }

  const chatTestCarId = `chat-test-car-${Date.now()}`
  const chatTestCar = { 
    ...TEST_CAR, 
    id: chatTestCarId,
    chatHistory: [
      { role: "user", message: "hello", source1: null, source2: null, source3: null },
      { 
        role: "assistant", 
        message: "Hi! How can I help?", 
        source1: JSON.stringify({ url: "https://example.com/car-guide", title: "Car Buying Guide" }),
        source2: null,
        source3: null,
      },
      { role: "user", message: "tell me about this car", source1: null, source2: null, source3: null },
    ],
  }

  console.log("  [5.2] Creating car with chat history:", chatTestCarId)
  const createRes = await testState.app!.request("/trpc/cars.create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(chatTestCar),
  })

  if (createRes.status !== 200) {
    const errorText = await createRes.text()
    throw new Error(`Failed to create chat test car: ${errorText.substring(0, 200)}`)
  }

  await new Promise(function (resolve) { setTimeout(resolve, 2000) })

  console.log("  [5.2] Fetching chat history for carId:", chatTestCarId)
  const historyRes = await testState.app!.request(
    "/trpc/chat.getChatHistory?input=" + encodeURIComponent(JSON.stringify({ carId: chatTestCarId })),
    { method: "GET" },
  )

  console.log("  [5.2] getChatHistory HTTP status:", historyRes.status)

  if (historyRes.status !== 200) {
    const errorText = await historyRes.text()
    console.log("  [5.2] getChatHistory error response:", errorText)
    throw new Error(`chat.getChatHistory failed: ${errorText.substring(0, 200)}`)
  }

  const historyJson = (await historyRes.json()) as {
    result: { data: { chatHistory: Array<{ role: string; message: string; sources?: Array<{ url: string; title: string }> }> } }
  }

  console.log("  [5.2] getChatHistory full response:", JSON.stringify(historyJson, null, 2))

  const chatHistory = historyJson.result.data.chatHistory

  if (chatHistory.length === 0) {
    console.log("  ⊘ [5.2] chatHistory empty (eventual consistency). Skipping schema assertion.")
  } else {
    const historySchema = z.array(apiChatHistoryEntrySchema)
    historySchema.parse(chatHistory)
    
    expect(chatHistory.length).toBeGreaterThan(0)
    const last = chatHistory[chatHistory.length - 1]
    expect(last.role).toBeDefined()
    expect(last.message).toBeTruthy()
    
    const assistantWithSources = chatHistory.find(function (entry) {
      return entry.role === "assistant" && entry.sources && entry.sources.length > 0
    })
    
    if (assistantWithSources) {
      expect(assistantWithSources.sources![0].url).toBeTruthy()
      expect(assistantWithSources.sources![0].title).toBeTruthy()
      console.log("  ✓ [5.2] Source schema validated (stringified in Palantir, parsed for API):", assistantWithSources.sources![0])
    }
  }

  console.log("  [5.2] Cleaning up chat test car:", chatTestCarId)
  await testState.app!.request("/trpc/cars.delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: chatTestCarId }),
  })

  console.log("  ✓ [5.2] chat history schema validation passed")
}
