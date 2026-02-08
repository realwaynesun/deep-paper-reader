import { streamText } from "ai"
import { getModelFromRequest } from "@/lib/route-utils"
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
    model: getModelFromRequest(req),
    system: TRANSLATE_SYSTEM,
    prompt: context
      ? `[CONTEXT - DO NOT TRANSLATE]\n"${context}"\n\n[TRANSLATE THIS - translate ONLY the text below, nothing more]\n"${text}"`
      : `[TRANSLATE THIS]\n"${text}"`,
  })

  return result.toTextStreamResponse()
}
