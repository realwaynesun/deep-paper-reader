import { NextResponse } from "next/server"
import { put, list } from "@vercel/blob"
import { getDocument, deleteDocument } from "@/lib/documents"

async function getDocumentOrMeta(id: string) {
  const doc = await getDocument(id)
  if (doc) return doc
  const { blobs } = await list({ prefix: `meta/${id}.json` })
  if (blobs.length === 0) return null
  const res = await fetch(blobs[0].url, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const doc = await getDocumentOrMeta(id)
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(doc)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Storage error"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params
  try {
    const doc = await getDocument(id)
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    const updates = await req.json()
    const updated = { ...doc, ...updates, id }
    await put(`documents/${id}.json`, JSON.stringify(updated), {
      access: "public", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json",
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    await deleteDocument(id)
    return new Response(null, { status: 204 })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Storage error"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
