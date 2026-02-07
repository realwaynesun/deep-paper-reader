import { createModel } from "./ai-providers"
import { createOpenAI } from "@ai-sdk/openai"

export function getModelFromRequest(req: Request) {
  const providerId = req.headers.get("x-ai-provider") ?? "openai"
  const modelId = req.headers.get("x-ai-model") ?? "gpt-4o"
  const apiKey = req.headers.get("x-ai-api-key") ?? ""

  if (!apiKey) {
    const envKey = process.env.OPENAI_API_KEY
    if (!envKey) {
      throw new Error("No API key provided")
    }
    return createOpenAI({ apiKey: envKey })(modelId)
  }

  return createModel(providerId, modelId, apiKey)
}
