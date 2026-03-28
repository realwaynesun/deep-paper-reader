import { z } from "zod/v4"

export const saveByUrlSchema = z.object({
  url: z.url(),
})

export const saveByContentSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  sourceUrl: z.string().optional(),
})

export const documentIdSchema = z.object({
  id: z.string(),
})
