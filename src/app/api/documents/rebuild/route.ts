import { NextResponse } from "next/server"
import { list, put } from "@vercel/blob"

export const maxDuration = 60

export async function POST() {
  let rebuilt = 0
  let cursor: string | undefined

  do {
    const result = await list({ prefix: "documents/", cursor, limit: 50 })
    const docBlobs = result.blobs.filter(
      (b) => !b.pathname.includes("_index")
    )

    const batch = docBlobs.map(async (blob) => {
      const id = blob.pathname.replace("documents/", "").replace(".json", "")
      const existing = await list({ prefix: `meta/${id}.json` })
      if (existing.blobs.length > 0) return false

      const res = await fetch(blob.url, { cache: "no-store" })
      if (!res.ok) return false
      const doc = await res.json()

      await put(`meta/${id}.json`, JSON.stringify({
        id: doc.id,
        title: doc.title,
        sourceUrl: doc.sourceUrl,
        savedAt: doc.savedAt,
      }), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
      })
      return true
    })

    const results = await Promise.all(batch)
    rebuilt += results.filter(Boolean).length
    cursor = result.hasMore ? result.cursor : undefined
  } while (cursor)

  return NextResponse.json({ rebuilt })
}
