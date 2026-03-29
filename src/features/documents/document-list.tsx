"use client"

import { forwardRef, useImperativeHandle, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search, Trash2, BookOpen } from "lucide-react"
import { useDocuments, type DocumentMeta } from "./use-documents"
import { getAllProgress, formatReadingTime } from "@/lib/reading-progress"

export interface DocumentListHandle {
  refresh: () => void
}

export const DocumentList = forwardRef<DocumentListHandle>(
  function DocumentList(_, ref) {
    const router = useRouter()
    const { documents, isLoading, refresh, remove } = useDocuments()
    const [search, setSearch] = useState("")
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [showAll, setShowAll] = useState(false)
    const DEFAULT_COUNT = 20

    useImperativeHandle(ref, () => ({ refresh }), [refresh])

    const recentReads = useMemo(() => {
      const progress = getAllProgress()
      return progress
        .slice(0, 5)
        .map((p) => {
          const doc = documents.find((d) => d.id === p.documentId)
          return doc ? { ...doc, progress: p } : null
        })
        .filter(Boolean) as (DocumentMeta & { progress: { page?: number; scrollRatio?: number; totalReadingTime?: number; lastReadAt: string } })[]
    }, [documents])

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

    const isSearching = search.length > 0 || activeCategory !== null

    if (isLoading) return null
    if (documents.length === 0) return null

    return (
      <div className="w-full max-w-lg">
        {recentReads.length > 0 && !isSearching && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Continue Reading</p>
            <div className="flex flex-col gap-1">
              {recentReads.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => router.push(`/read/${doc.id}`)}
                  className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left text-sm transition-colors hover:border-muted-foreground/25 hover:bg-muted/50"
                >
                  <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{doc.title}</span>
                  {doc.progress.totalReadingTime && doc.progress.totalReadingTime >= 60 ? (
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatReadingTime(doc.progress.totalReadingTime)}
                    </span>
                  ) : null}
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {doc.progress.page ? `p.${doc.progress.page}` : doc.progress.scrollRatio ? `${Math.round(doc.progress.scrollRatio * 100)}%` : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

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
          {(isSearching ? filtered : filtered.slice(0, showAll ? undefined : DEFAULT_COUNT)).map((doc) => (
            <div
              key={doc.id}
              className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm transition-colors hover:border-muted-foreground/25 hover:bg-muted/50"
            >
              <button
                onClick={() => router.push(`/read/${doc.id}`)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="truncate">{doc.title}</span>
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
          {!isSearching && !showAll && filtered.length > DEFAULT_COUNT && (
            <button
              onClick={() => setShowAll(true)}
              className="mt-1 w-full py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Show all {filtered.length} documents
            </button>
          )}
          {!isSearching && showAll && filtered.length > DEFAULT_COUNT && (
            <button
              onClick={() => setShowAll(false)}
              className="mt-1 w-full py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Show less
            </button>
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
