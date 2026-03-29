"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAllVocab, removeVocab, exportToAnki, type VocabEntry } from "@/lib/vocabulary"

export default function VocabularyPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<VocabEntry[]>(getAllVocab)
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return entries
    return entries.filter(
      (e) => e.word.toLowerCase().includes(q) || e.explanation.toLowerCase().includes(q)
    )
  }, [entries, search])

  const handleRemove = (id: string) => {
    removeVocab(id)
    setEntries(getAllVocab())
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Vocabulary</h1>
        <span className="text-sm text-muted-foreground">({entries.length} words)</span>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            disabled={entries.length === 0}
            onClick={() => exportToAnki(filtered.length < entries.length ? filtered : entries)}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export to Anki
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-muted-foreground/25 px-3 py-1.5">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search vocabulary..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {entries.length === 0 ? "No vocabulary saved yet. Select a word while reading and use Ask to save it." : "No matches found."}
        </p>
      ) : (
        <div className="space-y-1">
          {filtered.map((entry) => (
            <div key={entry.id} className="group rounded-lg border border-transparent px-4 py-3 hover:border-muted-foreground/25 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="font-medium">{entry.word}</span>
                  {entry.documentTitle && (
                    <span className="ml-2 text-xs text-muted-foreground">{entry.documentTitle}</span>
                  )}
                </button>
                <button
                  onClick={() => handleRemove(entry.id)}
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
              {expandedId === entry.id && (
                <div className="mt-2 select-text border-l-2 border-blue-500/50 pl-3 text-sm text-muted-foreground">
                  {entry.explanation}
                  {entry.context && (
                    <p className="mt-2 text-xs italic">Context: &ldquo;{entry.context}&rdquo;</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
