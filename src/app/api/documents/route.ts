import { NextResponse } from "next/server"
import { saveByUrlSchema, saveByContentSchema } from "@/lib/document-schemas"
import { listDocuments, saveDocument } from "@/lib/documents"
import { extractUrlContent } from "@/lib/extract-url"

export async function GET() {
  try {
    const docs = await listDocuments()
    return NextResponse.json(docs)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Storage error"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}

export async function POST(req: Request) {
  const body = await req.json()

  const byContent = saveByContentSchema.safeParse(body)
  if (byContent.success) {
    try {
      const { title, content, sourceUrl } = byContent.data
      const meta = await saveDocument({ title, content, sourceUrl: sourceUrl ?? "" })
      return NextResponse.json({ ...meta, content }, { status: 201 })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save"
      return NextResponse.json({ error: message }, { status: 503 })
    }
  }

  const byUrl = saveByUrlSchema.safeParse(body)
  if (byUrl.success) {
    try {
      const { title, content } = await extractUrlContent(byUrl.data.url)
      const meta = await saveDocument({ title, content, sourceUrl: byUrl.data.url })
      return NextResponse.json({ ...meta, content }, { status: 201 })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save"
      const status = message.includes("not configured") ? 503 : 500
      return NextResponse.json({ error: message }, { status })
    }
  }

  return NextResponse.json({ error: "Provide {url} or {title, content}" }, { status: 400 })
}
