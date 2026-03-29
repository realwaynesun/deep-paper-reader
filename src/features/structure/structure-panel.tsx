"use client"

import { useState } from "react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { BookOpen, Loader2, PanelLeftClose, PanelLeftOpen, Bookmark, Highlighter, BookA, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StructureItem } from "./structure-item"
import type { StructureNode } from "./use-structure"
import type { Bookmark as BookmarkType } from "@/lib/bookmarks"
import type { Highlight } from "@/lib/highlights"
import type { VocabEntry } from "@/lib/vocabulary"

type Tab = "structure" | "notes" | "vocab"

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
  vocabulary: VocabEntry[]
  onRemoveVocab: (id: string) => void
}

export function StructurePanel({
  nodes, isLoading, error, fullText, collapsed,
  bookmarks, highlights,
  onToggle, onAnalyze, onNavigate,
  onRemoveBookmark, onRemoveHighlight,
  vocabulary, onRemoveVocab,
}: StructurePanelProps) {
  const [tab, setTab] = useState<Tab>("structure")

  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center border-r pt-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col border-r" data-no-selection-toolbar>
      <div className="flex items-center border-b">
        <div className="flex flex-1">
          <TabButton active={tab === "structure"} onClick={() => setTab("structure")}>Structure</TabButton>
          <TabButton active={tab === "notes"} onClick={() => setTab("notes")} count={bookmarks.length + highlights.length}>Notes</TabButton>
          <TabButton active={tab === "vocab"} onClick={() => setTab("vocab")} count={vocabulary.length}>Vocab</TabButton>
        </div>
        <Button variant="ghost" size="icon" className="mr-1 h-7 w-7" onClick={onToggle}>
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {tab === "structure" && (
          <StructureContent
            nodes={nodes} isLoading={isLoading} error={error}
            fullText={fullText} onAnalyze={onAnalyze} onNavigate={onNavigate}
          />
        )}
        {tab === "notes" && (
          <NotesContent
            bookmarks={bookmarks} highlights={highlights}
            onNavigate={onNavigate} onRemoveBookmark={onRemoveBookmark}
            onRemoveHighlight={onRemoveHighlight}
          />
        )}
        {tab === "vocab" && (
          <VocabContent vocabulary={vocabulary} onRemove={onRemoveVocab} />
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children, count }: {
  active: boolean; onClick: () => void; children: React.ReactNode; count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2.5 text-xs font-medium transition-colors ${
        active ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {count != null && count > 0 && (
        <span className="ml-1 text-[10px] text-muted-foreground">({count})</span>
      )}
    </button>
  )
}

function StructureContent({ nodes, isLoading, error, fullText, onAnalyze, onNavigate }: {
  nodes: StructureNode[]; isLoading: boolean; error: string | null
  fullText: string | null; onAnalyze: (text: string) => void; onNavigate: (page: number) => void
}) {
  if (nodes.length > 0) {
    return (
      <div className="space-y-0.5">
        {nodes.map((node, i) => (
          <StructureItem key={i} node={node} onNavigate={onNavigate} />
        ))}
      </div>
    )
  }
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 pt-12 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Analyzing...</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="px-2 pt-8 text-center">
        <p className="text-sm text-destructive">{error}</p>
        {fullText && (
          <Button variant="outline" size="sm" className="mt-3" onClick={() => onAnalyze(fullText)}>Retry</Button>
        )}
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-3 pt-12 text-center">
      <BookOpen className="h-8 w-8 text-muted-foreground/50" />
      <p className="px-4 text-sm text-muted-foreground">
        {fullText ? "Click below to analyze" : "Upload a file first"}
      </p>
      {fullText && (
        <Button variant="outline" size="sm" onClick={() => onAnalyze(fullText)}>
          <BookOpen className="mr-2 h-3.5 w-3.5" />Analyze Structure
        </Button>
      )}
    </div>
  )
}

function NotesContent({ bookmarks, highlights, onNavigate, onRemoveBookmark, onRemoveHighlight }: {
  bookmarks: BookmarkType[]; highlights: Highlight[]
  onNavigate: (page: number) => void
  onRemoveBookmark: (id: string) => void; onRemoveHighlight: (id: string) => void
}) {
  if (bookmarks.length === 0 && highlights.length === 0) {
    return (
      <p className="pt-12 text-center text-sm text-muted-foreground">
        No bookmarks or highlights yet
      </p>
    )
  }
  return (
    <>
      {bookmarks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 px-2 pb-2">
            <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">Bookmarks ({bookmarks.length})</span>
          </div>
          <div className="space-y-0.5">
            {bookmarks.map((b) => (
              <div key={b.id} className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                <button className="flex min-w-0 flex-1 text-left" onClick={() => b.page && onNavigate(b.page)}>
                  {b.label ?? (b.page ? `Page ${b.page}` : `${Math.round((b.scrollRatio ?? 0) * 100)}%`)}
                </button>
                <button onClick={() => onRemoveBookmark(b.id)} className="shrink-0 opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {highlights.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 px-2 pb-2">
            <Highlighter className="h-3.5 w-3.5 text-yellow-500" />
            <span className="text-xs font-semibold text-muted-foreground">Highlights ({highlights.length})</span>
          </div>
          <div className="space-y-0.5">
            {highlights.map((h) => (
              <div key={h.id} className="group rounded-md px-2 py-1.5 hover:bg-accent">
                <div className="flex items-start gap-2">
                  <p className="min-w-0 flex-1 select-text border-l-2 border-yellow-500/50 pl-2 text-xs leading-relaxed line-clamp-3">{h.text}</p>
                  <button onClick={() => onRemoveHighlight(h.id)} className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function VocabContent({ vocabulary, onRemove }: { vocabulary: VocabEntry[]; onRemove: (id: string) => void }) {
  if (vocabulary.length === 0) {
    return (
      <div className="pt-12 text-center">
        <BookA className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">Select a word and use Ask to save it</p>
      </div>
    )
  }
  return (
    <>
      <div className="space-y-0.5">
        {vocabulary.map((v) => (
          <VocabItem key={v.id} entry={v} onRemove={onRemove} />
        ))}
      </div>
      <div className="mt-3 border-t pt-3 text-center">
        <Link href="/vocabulary" className="text-xs text-muted-foreground hover:text-foreground">
          View all vocabulary →
        </Link>
      </div>
    </>
  )
}

function formatExplanation(text: string) {
  return text.replace(/(\d+)\.\s+\*\*/g, "\n$1. **").replace(/^\n/, "")
}

function VocabItem({ entry, onRemove }: { entry: VocabEntry; onRemove: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="group rounded-md px-2 py-1.5 hover:bg-accent">
      <div className="flex items-center gap-2">
        <button onClick={() => setExpanded(!expanded)} className="min-w-0 flex-1 text-left text-sm font-medium">
          {entry.word}
        </button>
        <button onClick={() => onRemove(entry.id)} className="shrink-0 opacity-0 group-hover:opacity-100">
          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
      {expanded && (
        <div className="prose prose-xs prose-neutral dark:prose-invert mt-1 max-w-none select-text border-l-2 border-blue-500/50 pl-2 text-xs [&_ol]:text-xs [&_li]:text-xs [&_p]:text-xs [&_strong]:text-xs">
          <ReactMarkdown>{formatExplanation(entry.explanation)}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
