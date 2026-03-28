import { NextResponse } from "next/server"
import { getDocument, deleteDocument } from "@/lib/documents"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const doc = await getDocument(id)
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(doc)
  } catch (e) {
    const message = e instanceof Error ? e.message : "Storage error"
    return NextResponse.json({ error: message }, { status: 503 })
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
