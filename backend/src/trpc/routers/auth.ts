import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { sign, verify } from "hono/jwt"
import { eq } from "drizzle-orm"
import { publicProcedure, router } from "../trpc"
import { db } from "../../db/db"
import { users } from "../../db/schema"
import { logger } from "../../logger"

const JWT_SECRET = process.env.JWT_SECRET!

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
        logger.error({
          message: "auth.register_conflict",
          email,
        })
        throw new TRPCError({ code: "CONFLICT", message: "User already exists" })
      }

      const hashedPassword = await Bun.password.hash(password)

      let result
      try {
        result = await db.insert(users).values({
          email,
          password: hashedPassword,
        }).returning()
      } catch (err) {
        logger.error({
          message: "auth.register_insert_failed",
          email,
          errMessage: err instanceof Error ? err.message : "unknown",
        })
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Registration failed" })
      }

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
        logger.error({
          message: "auth.login_failed",
          reason: "unknown_user",
          email,
        })
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" })
      }

      const isValidPassword = await Bun.password.verify(password, user.password)
      if (!isValidPassword) {
        logger.error({
          message: "auth.login_failed",
          reason: "bad_password",
          email,
        })
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
          logger.error({
            message: "auth.me_not_found",
            sub: payload.sub,
          })
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
        }

        return { id: user.id, email: user.email }
      } catch (err) {
        if (err instanceof TRPCError) {
          throw err
        }
        logger.error({
          message: "auth.me_invalid_token",
          errMessage: err instanceof Error ? err.message : "unknown",
        })
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" })
      }
    }),
})
