import { Context, Next } from "hono"
import { verify } from "hono/jwt"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function authMiddleware(c: Context, next: Next) {
    const authHeader = c.req.header("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({ success: false, error: "Unauthorized" }, 401)
    }

    try {
        const token = authHeader.split(" ")[1]
        const payload = await verify(token, JWT_SECRET, "HS256")
        c.set("user", payload)
        await next()
    } catch (error) {
        return c.json({ success: false, error: "Not authorized."}, 401)
    }
}
