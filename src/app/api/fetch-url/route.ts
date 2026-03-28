import { z } from "zod/v4"
import { NextResponse } from "next/server"
import { extractUrlContent } from "@/lib/extract-url"

const schema = z.object({
  url: z.url(),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }

  try {
    const result = await extractUrlContent(parsed.data.url)
    return NextResponse.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to extract content"
    const status = message.includes("Failed to fetch") ? 502 : 422
    return NextResponse.json({ error: message }, { status })
  }
}
