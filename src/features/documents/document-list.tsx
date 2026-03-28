"use client"

import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { useDocuments, type DocumentMeta } from "./use-documents"

interface DocumentListProps {
  onOpen: (doc: { title: string; content: string; sourceUrl: string }) => void
}

export function DocumentList({ onOpen }: DocumentListProps) {
  const { documents, isLoading, remove } = useDocuments()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleOpen = async (doc: DocumentMeta) => {
    setLoadingId(doc.id)
    try {
      const res = await fetch(`/api/documents/${doc.id}`)
      if (!res.ok) return
      const full = await res.json()
      onOpen({ title: full.title, content: full.content, sourceUrl: full.sourceUrl })
    } finally {
      setLoadingId(null)
    }
  }

  if (isLoading) return null
  if (documents.length === 0) return null

  return (
    <div className="w-full max-w-lg">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Saved Documents</p>
      <div className="flex flex-col gap-1">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm transition-colors hover:border-muted-foreground/25 hover:bg-muted/50"
          >
            <button
              onClick={() => handleOpen(doc)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
              disabled={loadingId === doc.id}
            >
              {loadingId === doc.id ? (
                <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
              ) : (
                <span className="truncate">{doc.title}</span>
              )}
            </button>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatDomain(doc.sourceUrl)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                remove(doc.id)
              }}
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return ""
  }
}
