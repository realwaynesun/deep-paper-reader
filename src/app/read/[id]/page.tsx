"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import type { DocumentSource } from "@/app/page"

const ReaderView = dynamic(
  () => import("@/features/reader/reader-view").then((m) => ({ default: m.ReaderView })),
  { ssr: false }
)

export default function ReadPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [doc, setDoc] = useState<DocumentSource | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/documents/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found")
        return r.json()
      })
      .then((data) => {
        if (data.format === "pdf" && data.pdfUrl) {
          setDoc({ type: "pdf", id: data.id, title: data.title, pdfUrl: data.pdfUrl })
        } else {
          setDoc({ type: "web", web: { id: data.id, title: data.title, content: data.content, sourceUrl: data.sourceUrl } })
        }
      })
      .catch(() => setError("Document not found"))
  }, [params.id])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <ReaderView doc={doc} onBack={() => router.push("/")} />
}
