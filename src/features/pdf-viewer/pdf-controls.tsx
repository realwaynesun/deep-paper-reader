"use client"

import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PdfControlsProps {
  currentPage: number
  numPages: number
  scale: number
  onPageChange: (page: number) => void
  onZoomIn: () => void
  onZoomOut: () => void
}

export function PdfControls({
  currentPage,
  numPages,
  scale,
  onPageChange,
  onZoomIn,
  onZoomOut,
}: PdfControlsProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="min-w-[4rem] text-center text-sm tabular-nums">
        {currentPage} / {numPages}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= numPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-4 w-px bg-border" />

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onZoomOut}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      <span className="min-w-[3rem] text-center text-sm tabular-nums">
        {Math.round(scale * 100)}%
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onZoomIn}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  )
}
