import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

export interface ProviderConfig {
  id: string
  name: string
  models: { id: string; name: string }[]
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: [
      { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5" },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5" },
    ],
  },
  {
    id: "google",
    name: "Google",
    models: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    ],
  },
]

const providerFactories: Record<
  string,
  (apiKey: string) => ReturnType<typeof createOpenAI>
> = {
  openai: (apiKey) => createOpenAI({ apiKey }),
  anthropic: (apiKey) => createAnthropic({ apiKey }) as never,
  google: (apiKey) => createGoogleGenerativeAI({ apiKey }) as never,
}

export function createModel(providerId: string, modelId: string, apiKey: string) {
  const factory = providerFactories[providerId]
  if (!factory) {
    throw new Error(`Unknown provider: ${providerId}`)
  }
  return factory(apiKey)(modelId)
}
