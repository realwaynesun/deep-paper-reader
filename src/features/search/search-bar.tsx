"use client"

import { useCallback, type KeyboardEvent } from "react"
import { ChevronUp, ChevronDown, X } from "lucide-react"

interface SearchBarProps {
  isOpen: boolean
  query: string
  matchCount: number
  currentMatch: number
  inputRef: React.RefObject<HTMLInputElement | null>
  onQueryChange: (query: string) => void
  onNext: () => void
  onPrev: () => void
  onClose: () => void
}

export function SearchBar({
  isOpen,
  query,
  matchCount,
  currentMatch,
  inputRef,
  onQueryChange,
  onNext,
  onPrev,
  onClose,
}: SearchBarProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        if (e.shiftKey) {
          onPrev()
        } else {
          onNext()
        }
      }
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    },
    [onNext, onPrev, onClose]
  )

  if (!isOpen) return null

  return (
    <div
      data-no-selection-toolbar
      className="absolute right-4 top-2 z-50 flex items-center gap-1 rounded-lg border bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur"
    >
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Find in document..."
        className="w-48 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <span className="min-w-[3.5rem] text-center text-xs text-muted-foreground">
        {query ? `${currentMatch}/${matchCount}` : ""}
      </span>
      <button
        onClick={onPrev}
        disabled={matchCount === 0}
        className="rounded p-0.5 hover:bg-muted disabled:opacity-30"
        aria-label="Previous match"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        onClick={onNext}
        disabled={matchCount === 0}
        className="rounded p-0.5 hover:bg-muted disabled:opacity-30"
        aria-label="Next match"
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      <button
        onClick={onClose}
        className="rounded p-0.5 hover:bg-muted"
        aria-label="Close search"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
