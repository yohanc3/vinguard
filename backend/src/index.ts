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

Bun.serve({
  port,
  fetch: app.fetch,
  idleTimeout: 210,
})
