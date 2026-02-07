"use client"

import { useEffect, useMemo } from "react"
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react"
import { Languages, MessageCircleQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SelectionToolbarProps {
  rect: DOMRect | null
  action: "ask" | "translate" | null
  onAsk: () => void
  onTranslate: () => void
  onMouseDown: () => void
}

export function SelectionToolbar({
  rect,
  action,
  onAsk,
  onTranslate,
  onMouseDown,
}: SelectionToolbarProps) {
  const virtualRef = useMemo(() => {
    if (!rect) return null
    return {
      getBoundingClientRect: () => rect,
      getClientRects: () => [rect] as unknown as DOMRectList,
    }
  }, [rect])

  const { refs, floatingStyles } = useFloating({
    open: !!virtualRef,
    placement: "top",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  useEffect(() => {
    refs.setPositionReference(virtualRef)
  }, [virtualRef, refs])

  if (!rect || !action) return null

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className="z-50 animate-in fade-in zoom-in-95 duration-150"
      onMouseDown={onMouseDown}
    >
      <div className="flex gap-1 rounded-lg border bg-popover p-1 shadow-lg">
        {action === "ask" ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 px-3 text-xs"
            onClick={onAsk}
          >
            <MessageCircleQuestion className="h-3.5 w-3.5" />
            Ask
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 px-3 text-xs"
            onClick={onTranslate}
          >
            <Languages className="h-3.5 w-3.5" />
            Translate
          </Button>
        )}
      </div>
    </div>
  )
}
