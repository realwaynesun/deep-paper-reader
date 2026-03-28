"use client"

import { forwardRef, useImperativeHandle, useMemo, useState } from "react"
import { Loader2, Search, Trash2 } from "lucide-react"
import { useDocuments, type DocumentMeta } from "./use-documents"

export interface DocumentListHandle {
  refresh: () => void
}

interface DocumentListProps {
  onOpen: (doc: { title: string; content: string; sourceUrl: string }) => void
}

export const DocumentList = forwardRef<DocumentListHandle, DocumentListProps>(
  function DocumentList({ onOpen }, ref) {
    const { documents, isLoading, refresh, remove } = useDocuments()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [activeCategory, setActiveCategory] = useState<string | null>(null)

    useImperativeHandle(ref, () => ({ refresh }), [refresh])

    const categories = useMemo(() => {
      const counts = new Map<string, number>()
      for (const d of documents) {
        const cat = d.category ?? "Uncategorized"
        counts.set(cat, (counts.get(cat) ?? 0) + 1)
      }
      return [...counts.entries()].sort((a, b) => b[1] - a[1])
    }, [documents])

    const filtered = useMemo(() => {
      const q = search.toLowerCase()
      return documents.filter((d) => {
        if (activeCategory && (d.category ?? "Uncategorized") !== activeCategory) return false
        if (!q) return true
        return d.title.toLowerCase().includes(q) || d.sourceUrl.toLowerCase().includes(q)
      })
    }, [documents, search, activeCategory])

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
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-muted-foreground/25 px-3 py-1.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${documents.length} documents...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
        </div>

        {categories.length > 1 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveCategory(null)}
              className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                !activeCategory
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
              }`}
            >
              All
            </button>
            {categories.map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                  activeCategory === cat
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                }`}
              >
                {cat} ({count})
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          {filtered.map((doc) => (
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
              {doc.category && (
                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  {doc.category}
                </span>
              )}
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
          {filtered.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">No matching documents</p>
          )}
        </div>
      </div>
    )
  }
)

function formatDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return ""
  }
}
