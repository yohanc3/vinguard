import { trpcServer } from "@hono/trpc-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { appRouter } from "./trpc/root"
import { TEST_CAR } from "../tests/state"

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173"
const port = Number(process.env.PORT) || 3000

const app = new Hono()

app.use(logger())

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
}
