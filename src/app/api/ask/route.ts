import { streamText } from "ai"
import { getModelFromRequest } from "@/lib/route-utils"
import { ASK_SYSTEM } from "@/lib/prompts"
import { askSchema } from "@/lib/schemas"

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = askSchema.safeParse(body)

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.message }), {
      status: 400,
    })
  }

  const { word, context, paperTitle } = parsed.data

  const prompt = [
    paperTitle ? `Paper: "${paperTitle}"` : "",
    `Sentence context: "${context}"`,
    `Selected term: "${word}"`,
    `Explain this term in context.`,
  ]
    .filter(Boolean)
    .join("\n")

  const result = streamText({
    model: getModelFromRequest(req),
    system: ASK_SYSTEM,
    prompt,
  })

  return result.toTextStreamResponse()
}
