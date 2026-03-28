import { NextResponse } from "next/server"
import { rebuildIndex } from "@/lib/documents"

export const maxDuration = 60

export async function POST() {
  const count = await rebuildIndex()
  return NextResponse.json({ rebuilt: count })
}
