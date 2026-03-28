import { NextResponse } from "next/server"
import { put, list } from "@vercel/blob"

interface Params {
  params: Promise<{ id: string }>
}

const BLOB_OPTS = { access: "public" as const, addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const { blobs } = await list({ prefix: `structure/${id}.json` })
  if (blobs.length === 0) {
    return NextResponse.json(null)
  }
  const res = await fetch(blobs[0].url, { cache: "no-store" })
  if (!res.ok) return NextResponse.json(null)
  const data = await res.json()
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  await put(`structure/${id}.json`, JSON.stringify(body), BLOB_OPTS)
  return NextResponse.json({ ok: true })
}
