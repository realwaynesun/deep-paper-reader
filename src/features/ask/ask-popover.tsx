"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react"
import { GripHorizontal, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"

interface AskPopoverProps {
  rect: DOMRect | null
  word: string
  explanation: string
  isStreaming: boolean
  isOpen: boolean
  onClose: () => void
}

function formatExplanation(text: string) {
  return text.replace(/(\d+)\.\s+\*\*/g, "\n$1. **").replace(/^\n/, "")
}

export function AskPopover({
  rect, word, explanation, isStreaming, isOpen, onClose,
}: AskPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const draggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })

  const virtualRef = useMemo(() => {
    if (!rect) return null
    return {
      getBoundingClientRect: () => rect,
      getClientRects: () => [rect] as unknown as DOMRectList,
    }
  }, [rect])

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    placement: "bottom-start",
    middleware: [offset(12), flip({ padding: 60 }), shift({ padding: 16 })],
    whileElementsMounted: autoUpdate,
  })

  useEffect(() => {
    refs.setPositionReference(virtualRef)
  }, [virtualRef, refs])

  // Reset drag offset when a new word is opened
  useEffect(() => {
    setDragOffset({ x: 0, y: 0 })
  }, [word])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Delay to avoid closing from the same click that opened it
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handler)
    }
  }, [isOpen, onClose])

  // Escape to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    draggingRef.current = true
    dragStartRef.current = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }

    const handleMove = (ev: MouseEvent) => {
      if (!draggingRef.current) return
      setDragOffset({
        x: ev.clientX - dragStartRef.current.x,
        y: ev.clientY - dragStartRef.current.y,
      })
    }
    const handleUp = () => {
      draggingRef.current = false
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
    }
    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleUp)
  }, [dragOffset])

  if (!isOpen || !rect) return null

  const formatted = formatExplanation(explanation)

  return (
    <div
      ref={(node) => {
        popoverRef.current = node
        refs.setFloating(node)
      }}
      style={{
        ...floatingStyles,
        top: Math.max(8, floatingStyles.top as number ?? 0),
        transform: `${floatingStyles.transform ?? ""} translate(${dragOffset.x}px, ${dragOffset.y}px)`,
      }}
      className="z-50 w-[28rem] max-w-[90vw] animate-in fade-in slide-in-from-top-1 duration-200"
    >
      <div className="flex max-h-[min(24rem,60vh)] flex-col rounded-xl border bg-popover shadow-xl">
        <div
          className="flex shrink-0 cursor-grab items-center gap-2 border-b px-4 py-2.5 active:cursor-grabbing"
          onMouseDown={handleDragStart}
        >
          <h4 className="min-w-0 flex-1 truncate text-sm font-semibold">&ldquo;{word}&rdquo;</h4>
          <GripHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={onClose}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div
          className="overflow-y-auto p-4 text-sm leading-relaxed"
          onWheel={(e) => e.stopPropagation()}
        >
          {explanation ? (
            <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
              <ReactMarkdown>{formatted}</ReactMarkdown>
            </div>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Thinking...
            </span>
          )}
          {isStreaming && explanation && (
            <Loader2 className="mt-1 inline h-3 w-3 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  )
}
