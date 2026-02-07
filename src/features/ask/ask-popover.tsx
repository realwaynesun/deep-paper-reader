"use client"

import { useEffect, useMemo } from "react"
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react"
import { Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AskPopoverProps {
  rect: DOMRect | null
  word: string
  explanation: string
  isStreaming: boolean
  isOpen: boolean
  onClose: () => void
}

export function AskPopover({
  rect,
  word,
  explanation,
  isStreaming,
  isOpen,
  onClose,
}: AskPopoverProps) {
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
    middleware: [offset(12), flip(), shift({ padding: 16 })],
    whileElementsMounted: autoUpdate,
  })

  useEffect(() => {
    refs.setPositionReference(virtualRef)
  }, [virtualRef, refs])

  if (!isOpen || !rect) return null

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className="z-50 w-80 animate-in fade-in slide-in-from-top-1 duration-200"
    >
      <div className="rounded-lg border bg-popover p-4 shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <h4 className="font-semibold">&ldquo;{word}&rdquo;</h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="max-h-64 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap">
          {explanation || (
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
