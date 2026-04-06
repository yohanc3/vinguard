import { authRouter } from "./routers/auth"
import { carsRouter } from "./routers/cars"
import { extractRouter } from "./routers/extract"
import { scrapeRouter } from "./routers/scrape"
import { filesRouter } from "./routers/files"
import { chatRouter } from "./routers/chat"
import { router } from "./trpc"

export const appRouter = router({
  auth: authRouter,
  cars: carsRouter,
  extract: extractRouter,
  scrape: scrapeRouter,
  files: filesRouter,
  chat: chatRouter,
})

export type AppRouter = typeof appRouter
