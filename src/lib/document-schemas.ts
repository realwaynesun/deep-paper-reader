import { z } from "zod/v4"

export const saveDocumentSchema = z.object({
  url: z.url(),
})

export const documentIdSchema = z.object({
  id: z.string(),
})
