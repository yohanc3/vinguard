import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { sign, verify } from "hono/jwt"
import { eq } from "drizzle-orm"
import { publicProcedure, router } from "../trpc"
import { db } from "../../db/db"
import { users } from "../../db/schema"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authRouter = router({
  register: publicProcedure
    .input(credentialsSchema)
    .mutation(async function register({ input }) {
      const { email, password } = input

      const existingUser = await db.select().from(users).where(eq(users.email, email)).get()
      if (existingUser) {
        throw new TRPCError({ code: "CONFLICT", message: "User already exists" })
      }

      const hashedPassword = await Bun.password.hash(password)

      const result = await db.insert(users).values({
        email,
        password: hashedPassword,
      }).returning()

      const user = result[0]
      const payload = {
        sub: user.id.toString(),
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      }
      const token = await sign(payload, JWT_SECRET, "HS256")

      return {
        user: { id: user.id, email: user.email },
        token,
      }
    }),

  login: publicProcedure
    .input(credentialsSchema)
    .mutation(async function login({ input }) {
      const { email, password } = input

      const user = await db.select().from(users).where(eq(users.email, email)).get()
      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" })
      }

      const isValidPassword = await Bun.password.verify(password, user.password)
      if (!isValidPassword) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" })
      }

      const payload = {
        sub: user.id.toString(),
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      }
      const token = await sign(payload, JWT_SECRET, "HS256")

      return {
        user: { id: user.id, email: user.email },
        token,
      }
    }),

  me: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async function getMe({ input }) {
      try {
        const payload = await verify(input.token, JWT_SECRET, "HS256")

        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, parseInt(payload.sub as string)))
          .get()

        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
        }

        return { id: user.id, email: user.email }
      } catch {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" })
      }
    }),
})
