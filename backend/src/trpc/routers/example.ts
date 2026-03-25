import { z } from "zod"
import { publicProcedure, router } from "../trpc"

export const exampleRouter = router({
  hello: publicProcedure
    .input(z.string().optional())
    .query(function helloResolver({ input }) {
      return { message: `Hello ${input ?? "World"}` }
    }),
})
