export interface AISettings {
  providerId: string
  modelId: string
  apiKey: string
}

export const DEFAULT_SETTINGS: AISettings = {
  providerId: "openai",
  modelId: "gpt-4o",
  apiKey: "",
}
