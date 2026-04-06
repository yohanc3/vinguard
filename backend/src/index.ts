import { trpcServer } from "@hono/trpc-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { appRouter } from "./trpc/root"
import { TEST_CAR } from "../tests/state"
import { extractFromSourcesParallel, searchDuckDuckGoPlain } from "./services/ddg-cheerio"
import { logger } from "./logger"

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173"
const port = Number(process.env.PORT) || 3000

const app = new Hono()

app.use(async function accessLogSuccessOnly(c, next) {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  const status = c.res.status
  if (status >= 200 && status < 300) {
    logger.info({
      message: "http_ok",
      method: c.req.method,
      path: c.req.path,
      status,
      ms,
    })
  }
})

app.get("/debug/ddg", async function debugDdG(c) {
  const q = c.req.query("q")

  if (!q) return c.json({ error: "Missing query param `q`" }, 400)

  const urls = await searchDuckDuckGoPlain(q)
  const top3 = urls.slice(0, 3)

  const maxCharsPerSource = 7000
  const extracted = await extractFromSourcesParallel(top3, 3, maxCharsPerSource)

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

export default {
  port,
  fetch: app.fetch,
  idleTimeout: 210,
}
