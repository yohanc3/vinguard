import { trpcServer } from "@hono/trpc-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { appRouter } from "./trpc/root"
import { TEST_CAR } from "../tests/state"
import { extractFromSourcesParallel, searchDuckDuckGoPlain } from "./services/ddg-cheerio"

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173"
const port = Number(process.env.PORT) || 3000

const app = new Hono()

app.use(logger())

app.get("/debug/ddg", async function debugDdG(c) {
  const q = c.req.query("q")

  if (!q) return c.json({ error: "Missing query param `q`" }, 400)

  console.log("[debug.ddg] start", { q })

  const urls = await searchDuckDuckGoPlain(q)
  const top3 = urls.slice(0, 3)

  console.log("[debug.ddg] top3", { count: top3.length, urls: top3 })

  // Use a large limit for debugging so we can see where the target text appears.
  const maxCharsPerSource = 7000
  const extracted = await extractFromSourcesParallel(top3, 3, maxCharsPerSource)

  console.log("[debug.ddg] extracted", {
    count: extracted.length,
    lenses: extracted.map(function (s) {
      return { url: s.url, chars: s.extractedText.length }
    }),
  })

  return c.json({
    query: q,
    results: extracted.map(function (s) {
      return {
        url: s.url,
        extractedText: s.extractedText,
        snippet: s.extractedText.slice(0, 600),
      }
    }),
  })
})

app.use(
  "/*",
  cors({
    origin: corsOrigin,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
)

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  }),
)

console.log(`API listening on http://localhost:${port} (CORS origin: ${corsOrigin})`)

export default {
  port,
  fetch: app.fetch,
  idleTimeout: 120,
}
