import { streamText } from "ai"
import { openai } from "@/lib/openai"
import { SUMMARIZE_SYSTEM } from "@/lib/prompts"
import { summarizeSchema } from "@/lib/schemas"

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = summarizeSchema.safeParse(body)

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.message }), {
      status: 400,
    })
  }

  const { text } = parsed.data

  const result = streamText({
    model: openai("gpt-4o"),
    system: SUMMARIZE_SYSTEM,
    prompt: `Analyze the structure of this academic paper and return a JSON outline:\n\n${text.slice(0, 100000)}`,
  })

  return result.toTextStreamResponse()
}
