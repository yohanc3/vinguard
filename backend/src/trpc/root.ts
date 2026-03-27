import { authRouter } from "./routers/auth"
import { carsRouter } from "./routers/cars"
import { extractRouter } from "./routers/extract"
import { exampleRouter } from "./routers/example"
import { scrapeRouter } from "./routers/scrape"
import { router } from "./trpc"

export const appRouter = router({
  auth: authRouter,
  cars: carsRouter,
  extract: extractRouter,
  example: exampleRouter,
  scrape: scrapeRouter,
})

export type AppRouter = typeof appRouter
