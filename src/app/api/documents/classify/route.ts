import { NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { getDocument, updateMeta, CATEGORIES, type Category } from "@/lib/documents"

export const maxDuration = 60

export async function POST(req: Request) {
  const { ids } = await req.json() as { ids?: string[] }
  if (!ids || ids.length === 0) {
    return NextResponse.json({ error: "Provide {ids: string[]}" }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "No OPENAI_API_KEY configured" }, { status: 503 })
  }

  const model = createOpenAI({ apiKey })("gpt-4o-mini")
  const results: Record<string, string> = {}

  const batch = ids.slice(0, 20).map(async (id) => {
    const doc = await getDocument(id)
    if (!doc) return
    const snippet = doc.content.slice(0, 500)

    const { text } = await generateText({
      model,
      system: `Classify the document into exactly one category. Reply with ONLY the category name, nothing else. Categories: ${CATEGORIES.join(", ")}`,
      prompt: `Title: ${doc.title}\n\nContent: ${snippet}`,
    })

    const category = CATEGORIES.find((c) => text.trim().includes(c)) ?? "Other"
    await updateMeta(id, { category: category as Category })
    results[id] = category
  })

  await Promise.all(batch)
  return NextResponse.json({ classified: Object.keys(results).length, results })
}
