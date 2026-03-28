import { put, list, del } from "@vercel/blob"

export const CATEGORIES = [
  "Research",
  "Blog",
  "News",
  "Documentation",
  "Tutorial",
  "30-implementations",
  "Other",
] as const

export type Category = (typeof CATEGORIES)[number]

export interface StoredDocument {
  readonly id: string
  readonly title: string
  readonly content: string
  readonly sourceUrl: string
  readonly savedAt: string
  readonly category?: Category
}

export interface DocumentMeta {
  readonly id: string
  readonly title: string
  readonly sourceUrl: string
  readonly savedAt: string
  readonly category?: Category
  readonly format?: "pdf" | "markdown"
  readonly pdfUrl?: string
}

function ensureToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Document storage not configured: BLOB_READ_WRITE_TOKEN is missing")
  }
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) return null
  try {
    return res.json()
  } catch {
    return null
  }
}

const BLOB_OPTS = { access: "public" as const, addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" }

async function readIndex(): Promise<DocumentMeta[]> {
  const { blobs } = await list({ prefix: "index.json" })
  if (blobs.length === 0) return []
  return await fetchJson<DocumentMeta[]>(blobs[0].url) ?? []
}

async function writeIndex(items: DocumentMeta[]): Promise<void> {
  const sorted = [...items].sort((a, b) => b.savedAt.localeCompare(a.savedAt))
  await put("index.json", JSON.stringify(sorted), BLOB_OPTS)
}

export async function saveDocument(input: {
  title: string
  content: string
  sourceUrl: string
  category?: Category
}): Promise<DocumentMeta> {
  ensureToken()
  const id = crypto.randomUUID()
  const savedAt = new Date().toISOString()
  const doc: StoredDocument = { id, ...input, savedAt }
  const meta: DocumentMeta = {
    id, title: input.title, sourceUrl: input.sourceUrl, savedAt, category: input.category,
  }

  await Promise.all([
    put(`documents/${id}.json`, JSON.stringify(doc), BLOB_OPTS),
    put(`meta/${id}.json`, JSON.stringify(meta), BLOB_OPTS),
  ])

  const index = await readIndex()
  await writeIndex([meta, ...index])

  return meta
}

export async function savePdf(input: {
  title: string
  pdfData: ArrayBuffer
  category?: Category
}): Promise<DocumentMeta> {
  ensureToken()
  const id = crypto.randomUUID()
  const savedAt = new Date().toISOString()

  const pdfBlob = await put(`pdfs/${id}.pdf`, input.pdfData, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/pdf",
  })

  const meta: DocumentMeta = {
    id, title: input.title, sourceUrl: "", savedAt,
    category: input.category, format: "pdf", pdfUrl: pdfBlob.url,
  }

  await put(`meta/${id}.json`, JSON.stringify(meta), BLOB_OPTS)

  const index = await readIndex()
  await writeIndex([meta, ...index])

  return meta
}

export async function updateMeta(id: string, updates: Partial<DocumentMeta>): Promise<void> {
  ensureToken()
  const index = await readIndex()
  const i = index.findIndex((d) => d.id === id)
  if (i === -1) return
  const updated = [...index]
  updated[i] = { ...updated[i], ...updates, id }
  await Promise.all([
    put(`meta/${id}.json`, JSON.stringify(updated[i]), BLOB_OPTS),
    writeIndex(updated),
  ])
}

export async function listDocuments(): Promise<DocumentMeta[]> {
  ensureToken()
  return readIndex()
}

export async function getDocument(id: string): Promise<StoredDocument | null> {
  ensureToken()
  const { blobs } = await list({ prefix: `documents/${id}.json` })
  if (blobs.length === 0) return null
  return fetchJson<StoredDocument>(blobs[0].url)
}

export async function deleteDocument(id: string): Promise<void> {
  ensureToken()
  const [docs, pdfs, metas] = await Promise.all([
    list({ prefix: `documents/${id}.json` }),
    list({ prefix: `pdfs/${id}.pdf` }),
    list({ prefix: `meta/${id}.json` }),
  ])
  const urls = [...docs.blobs, ...pdfs.blobs, ...metas.blobs].map((b) => b.url)
  if (urls.length > 0) await del(urls)

  const index = await readIndex()
  await writeIndex(index.filter((d) => d.id !== id))
}

export async function rebuildIndex(): Promise<number> {
  ensureToken()
  const allMeta: DocumentMeta[] = []
  let cursor: string | undefined

  do {
    const result = await list({ prefix: "meta/", cursor, limit: 100 })
    const fetches = result.blobs.map((b) => fetchJson<DocumentMeta>(b.url))
    const items = await Promise.all(fetches)
    for (const item of items) {
      if (item) allMeta.push(item)
    }
    cursor = result.hasMore ? result.cursor : undefined
  } while (cursor)

  await writeIndex(allMeta)
  return allMeta.length
}
