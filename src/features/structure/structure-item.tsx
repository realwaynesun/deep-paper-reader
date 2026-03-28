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
  const [showFull, setShowFull] = useState(false)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div
        className="rounded-md px-2 py-1.5 text-sm hover:bg-accent"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <div
          className="flex cursor-pointer items-start gap-2"
          onClick={() => {
            if (hasChildren) setExpanded(!expanded)
            else setShowFull(!showFull)
            if (node.page > 1) onNavigate(node.page)
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
          <span className="font-medium">{node.title}</span>
        </div>
        <p className={`mt-0.5 select-text pl-[22px] text-xs text-muted-foreground ${showFull ? "" : "line-clamp-2"}`}>
          {node.summary}
        </p>
      </div>

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
