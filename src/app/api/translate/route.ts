import { streamText } from "ai"
import { openai } from "@/lib/openai"
import { TRANSLATE_SYSTEM } from "@/lib/prompts"
import { translateSchema } from "@/lib/schemas"

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = translateSchema.safeParse(body)

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.message }), {
      status: 400,
    })
  }

  const { text, context } = parsed.data

  const result = streamText({
    model: openai("gpt-4o"),
    system: TRANSLATE_SYSTEM,
    prompt: context
      ? `Context from the paper:\n"${context}"\n\nTranslate this passage to Chinese:\n"${text}"`
      : `Translate this academic passage to Chinese:\n"${text}"`,
  })

  return result.toTextStreamResponse()
}
