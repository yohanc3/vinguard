import { authRouter } from "./routers/auth"
import { carsRouter } from "./routers/cars"
import { extractRouter } from "./routers/extract"
import { filesRouter } from "./routers/files"
import { chatRouter } from "./routers/chat"
import { router } from "./trpc"

export const appRouter = router({
  auth: authRouter,
  cars: carsRouter,
  extract: extractRouter,
  files: filesRouter,
  chat: chatRouter,
})

export type AppRouter = typeof appRouter
