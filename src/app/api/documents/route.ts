import { NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { saveByUrlSchema, saveByContentSchema } from "@/lib/document-schemas"
import { listDocuments, saveDocument, updateMeta, CATEGORIES, type Category } from "@/lib/documents"
import { extractUrlContent } from "@/lib/extract-url"

async function classifyInBackground(id: string, title: string, content: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return
  try {
    const model = createOpenAI({ apiKey })("gpt-4o-mini")
    const { text } = await generateText({
      model,
      system: `Classify into one category. Reply with ONLY the category name. Categories: ${CATEGORIES.join(", ")}`,
      prompt: `Title: ${title}\n\n${content.slice(0, 500)}`,
    })
    const category = CATEGORIES.find((c) => text.trim().includes(c)) ?? "Other"
    await updateMeta(id, { category: category as Category })
  } catch { /* non-critical */ }
}

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
      classifyInBackground(meta.id, title, content)
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
      classifyInBackground(meta.id, title, content)
      return NextResponse.json({ ...meta, content }, { status: 201 })
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save"
      const status = message.includes("not configured") ? 503 : 500
      return NextResponse.json({ error: message }, { status })
    }
  }

  return NextResponse.json({ error: "Provide {url} or {title, content}" }, { status: 400 })
}
