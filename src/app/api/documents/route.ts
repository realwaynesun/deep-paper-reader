import { NextResponse } from "next/server"
import { saveDocumentSchema } from "@/lib/document-schemas"
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
  const parsed = saveDocumentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  try {
    const { title, content } = await extractUrlContent(parsed.data.url)
    const meta = await saveDocument({ title, content, sourceUrl: parsed.data.url })
    return NextResponse.json(meta, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save"
    const status = message.includes("not configured") ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
