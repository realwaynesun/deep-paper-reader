import { NextResponse } from "next/server"
import { saveByUrlSchema, saveByContentSchema } from "@/lib/document-schemas"
import { listDocuments, saveDocument, savePdf } from "@/lib/documents"
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
  const ct = req.headers.get("content-type") ?? ""

  if (ct.includes("multipart/form-data")) {
    try {
      const form = await req.formData()
      const file = form.get("file") as File | null
      if (!file) {
        return NextResponse.json({ error: "No file" }, { status: 400 })
      }
      const title = (form.get("title") as string) || file.name.replace(/\.pdf$/i, "")
      const pdfData = await file.arrayBuffer()
      const meta = await savePdf({ title, pdfData })
      return NextResponse.json(meta, { status: 201 })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save PDF"
      return NextResponse.json({ error: message }, { status: 503 })
    }
  }

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

  return NextResponse.json({ error: "Provide {url}, {title,content}, or multipart PDF" }, { status: 400 })
}
