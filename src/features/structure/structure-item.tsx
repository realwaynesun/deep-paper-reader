"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import type { StructureNode } from "./use-structure"

interface StructureItemProps {
  node: StructureNode
  onNavigate: (page: number) => void
  depth?: number
}

export function StructureItem({
  node,
  onNavigate,
  depth = 0,
}: StructureItemProps) {
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <button
        className="group flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (hasChildren) setExpanded(!expanded)
          onNavigate(node.page)
        }}
      >
        {hasChildren && (
          <ChevronRight
            className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
        )}
        {!hasChildren && <div className="w-3.5 shrink-0" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-medium">{node.title}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              p.{node.page}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {node.summary}
          </p>
        </div>
      </button>

      {expanded && hasChildren && (
        <div>
          {node.children!.map((child, i) => (
            <StructureItem
              key={i}
              node={child}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
