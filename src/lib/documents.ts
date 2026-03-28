import { put, list, del } from "@vercel/blob"

export interface StoredDocument {
  readonly id: string
  readonly title: string
  readonly content: string
  readonly sourceUrl: string
  readonly savedAt: string
}

export interface DocumentMeta {
  readonly id: string
  readonly title: string
  readonly sourceUrl: string
  readonly savedAt: string
}

function ensureToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Document storage not configured: BLOB_READ_WRITE_TOKEN is missing")
  }
}

async function readManifest(): Promise<DocumentMeta[]> {
  const { blobs } = await list({ prefix: "documents/_index" })
  if (blobs.length === 0) return []
  const res = await fetch(blobs[0].url)
  return res.json()
}

async function writeManifest(items: DocumentMeta[]) {
  await put("documents/_index.json", JSON.stringify(items), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  })
}

export async function saveDocument(input: {
  title: string
  content: string
  sourceUrl: string
}): Promise<DocumentMeta> {
  ensureToken()
  const id = crypto.randomUUID()
  const savedAt = new Date().toISOString()
  const doc: StoredDocument = { id, ...input, savedAt }

  await put(`documents/${id}.json`, JSON.stringify(doc), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  })

  const meta: DocumentMeta = { id, title: input.title, sourceUrl: input.sourceUrl, savedAt }
  const manifest = await readManifest()
  await writeManifest([meta, ...manifest])
  return meta
}

export async function listDocuments(): Promise<DocumentMeta[]> {
  ensureToken()
  return readManifest()
}

export async function getDocument(id: string): Promise<StoredDocument | null> {
  ensureToken()
  const { blobs } = await list({ prefix: `documents/${id}.json` })
  if (blobs.length === 0) return null
  const res = await fetch(blobs[0].url)
  return res.json()
}

export async function deleteDocument(id: string): Promise<void> {
  ensureToken()
  const { blobs } = await list({ prefix: `documents/${id}.json` })
  if (blobs.length > 0) {
    await del(blobs[0].url)
  }
  const manifest = await readManifest()
  await writeManifest(manifest.filter((d) => d.id !== id))
}
