import { NextResponse } from "next/server"
import { z } from "zod/v4"

const schema = z.object({ password: z.string().min(1) })

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Password required" }, { status: 400 })
  }

  const expected = process.env.READER_PASSWORD
  if (!expected || parsed.data.password !== expected) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  const isSecure = process.env.NODE_ENV === "production"
  const res = NextResponse.json({ ok: true })
  res.cookies.set("reader-auth", parsed.data.password, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    maxAge: 60 * 60 * 24 * 365,
  })
  return res
}
