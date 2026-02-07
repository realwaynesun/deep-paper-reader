import type { AISettings } from "./types"

export function aiHeaders(settings: AISettings): Record<string, string> {
  if (!settings.apiKey) return {}

  return {
    "x-ai-provider": settings.providerId,
    "x-ai-model": settings.modelId,
    "x-ai-api-key": settings.apiKey,
  }
}
