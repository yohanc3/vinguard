import { initTRPC } from "@trpc/server"

const t = initTRPC.create()

const loggerMiddleware = t.middleware(async function logger(opts) {
  const { path, type, next, getRawInput } = opts
  const start = performance.now()

  let inputStr = ""
  try {
    const rawInput = await getRawInput()
    if (rawInput !== undefined) inputStr = JSON.stringify(rawInput)
  } catch {
    // ignore parse errors for logging
  }

  const result = await next()
  const duration = Math.round(performance.now() - start)
  const status = result.ok ? "OK" : "ERROR"

  console.log(`[tRPC] ${type.toUpperCase()} ${path}${inputStr ? ` input=${inputStr.substring(0, 100)}` : ""} → ${status} (${duration}ms)`)

  return result
})

export const router = t.router
export const publicProcedure = t.procedure.use(loggerMiddleware)
