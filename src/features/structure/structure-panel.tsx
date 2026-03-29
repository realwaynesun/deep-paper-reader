"use client"

import { BookOpen, Loader2, PanelLeftClose, PanelLeftOpen, Bookmark, Highlighter, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StructureItem } from "./structure-item"
import type { StructureNode } from "./use-structure"
import type { Bookmark as BookmarkType } from "@/lib/bookmarks"
import type { Highlight } from "@/lib/highlights"

interface StructurePanelProps {
  nodes: StructureNode[]
  isLoading: boolean
  error: string | null
  fullText: string | null
  collapsed: boolean
  bookmarks: BookmarkType[]
  highlights: Highlight[]
  onToggle: () => void
  onAnalyze: (text: string) => void
  onNavigate: (page: number) => void
  onRemoveBookmark: (id: string) => void
  onRemoveHighlight: (id: string) => void
}

export function StructurePanel({
  nodes,
  isLoading,
  error,
  fullText,
  collapsed,
  bookmarks,
  highlights,
  onToggle,
  onAnalyze,
  onNavigate,
  onRemoveBookmark,
  onRemoveHighlight,
}: StructurePanelProps) {
  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center border-r pt-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggle}
          title="Expand structure panel"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col border-r" data-no-selection-toolbar>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Structure</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onToggle}
          title="Collapse structure panel"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {nodes.length > 0 ? (
          <div className="space-y-0.5">
            {nodes.map((node, i) => (
              <StructureItem
                key={i}
                node={node}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center gap-3 pt-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Analyzing paper structure...
            </p>
          </div>
        ) : error ? (
          <div className="px-2 pt-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
            {fullText && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => onAnalyze(fullText)}
              >
                Retry
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 pt-12 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            <p className="px-4 text-sm text-muted-foreground">
              {fullText
                ? "Click below to analyze the paper structure"
                : "Upload a file to analyze its structure"}
            </p>
            {fullText && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAnalyze(fullText)}
              >
                <BookOpen className="mr-2 h-3.5 w-3.5" />
                Analyze Structure
              </Button>
            )}
          </div>
        )}

        <BookmarksSection
          bookmarks={bookmarks}
          onNavigate={onNavigate}
          onRemove={onRemoveBookmark}
        />

        <HighlightsSection
          highlights={highlights}
          onRemove={onRemoveHighlight}
        />
      </div>
    </div>
  )
}

function BookmarksSection({
  bookmarks,
  onNavigate,
  onRemove,
}: {
  bookmarks: BookmarkType[]
  onNavigate: (page: number) => void
  onRemove: (id: string) => void
}) {
  if (bookmarks.length === 0) return null

  return (
    <div className="mt-4 border-t pt-3">
      <div className="flex items-center gap-1.5 px-2 pb-2">
        <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">
          Bookmarks ({bookmarks.length})
        </span>
      </div>
      <div className="space-y-0.5">
        {bookmarks.map((b) => (
          <div
            key={b.id}
            className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
          >
            <button
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              onClick={() => {
                if (b.page) onNavigate(b.page)
              }}
            >
              <span className="truncate">
                {b.label ?? (b.page ? `Page ${b.page}` : `${Math.round((b.scrollRatio ?? 0) * 100)}%`)}
              </span>
            </button>
            <button
              onClick={() => onRemove(b.id)}
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

function HighlightsSection({
  highlights,
  onRemove,
}: {
  highlights: Highlight[]
  onRemove: (id: string) => void
}) {
  if (highlights.length === 0) return null

  return (
    <div className="mt-4 border-t pt-3">
      <div className="flex items-center gap-1.5 px-2 pb-2">
        <Highlighter className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-500" />
        <span className="text-xs font-semibold text-muted-foreground">
          Highlights ({highlights.length})
        </span>
      </div>
      <div className="space-y-0.5">
        {highlights.map((h) => (
          <div
            key={h.id}
            className="group rounded-md px-2 py-1.5 hover:bg-accent"
          >
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 text-xs leading-relaxed line-clamp-3 select-text border-l-2 border-yellow-500/50 pl-2">
                {h.text}
              </p>
              <button
                onClick={() => onRemove(h.id)}
                className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
            {h.note && (
              <p className="mt-1 pl-4 text-[10px] text-muted-foreground italic">
                {h.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
