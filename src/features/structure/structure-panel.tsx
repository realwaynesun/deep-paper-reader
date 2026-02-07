"use client"

import { BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StructureItem } from "./structure-item"
import type { StructureNode } from "./use-structure"

interface StructurePanelProps {
  nodes: StructureNode[]
  isLoading: boolean
  error: string | null
  fullText: string | null
  onAnalyze: (text: string) => void
  onNavigate: (page: number) => void
}

export function StructurePanel({
  nodes,
  isLoading,
  error,
  fullText,
  onAnalyze,
  onNavigate,
}: StructurePanelProps) {
  return (
    <div className="flex h-full flex-col border-r">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Structure</h2>
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
                : "Upload a PDF to analyze its structure"}
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
      </div>
    </div>
  )
}
