import { z } from "zod"

export const translateSchema = z.object({
  text: z.string().min(1).max(50000),
  context: z.string().optional(),
})

export const askSchema = z.object({
  word: z.string().min(1).max(200),
  context: z.string().min(1).max(2000),
  paperTitle: z.string().optional(),
})

export const summarizeSchema = z.object({
  text: z.string().min(1).max(200000),
})

export type TranslateInput = z.infer<typeof translateSchema>
export type AskInput = z.infer<typeof askSchema>
export type SummarizeInput = z.infer<typeof summarizeSchema>
