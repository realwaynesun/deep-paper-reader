import { NextResponse } from "next/server"
import { updateMeta, type Category, CATEGORIES } from "@/lib/documents"

export const maxDuration = 60

export async function POST(req: Request) {
  const body = await req.json()

  const classifications = body.classifications as Record<string, string> | undefined
  if (!classifications || typeof classifications !== "object") {
    return NextResponse.json({ error: "Provide {classifications: {id: category}}" }, { status: 400 })
  }

  let updated = 0
  const entries = Object.entries(classifications)
  const batch = entries.map(async ([id, cat]) => {
    const category = CATEGORIES.includes(cat as Category) ? (cat as Category) : "Other"
    await updateMeta(id, { category })
    updated++
  })

  await Promise.all(batch)
  return NextResponse.json({ updated })
}
