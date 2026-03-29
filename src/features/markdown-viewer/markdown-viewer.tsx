"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"

type MarkdownViewerProps = {
  onTextExtracted: (text: string) => void
  onScrollChange?: (ratio: number) => void
  initialScrollRatio?: number
} & ({ file: File; content?: never } | { content: string; file?: never })

export function MarkdownViewer({ file, content: rawContent, onTextExtracted, onScrollChange, initialScrollRatio }: MarkdownViewerProps) {
  const [content, setContent] = useState<string>(rawContent ?? "")
  const [error, setError] = useState<string>("")
  const onTextExtractedRef = useRef(onTextExtracted)
  const scrollRef = useRef<HTMLDivElement>(null)
  const restoredRef = useRef(false)
  onTextExtractedRef.current = onTextExtracted

  useEffect(() => {
    if (rawContent != null) {
      setContent(rawContent)
      onTextExtractedRef.current(rawContent)
      return
    }
    if (file) {
      file
        .text()
        .then((text) => {
          setContent(text)
          onTextExtractedRef.current(text)
        })
        .catch(() => setError("Failed to read file"))
    }
  }, [file, rawContent])

  // Restore scroll position
  useEffect(() => {
    if (!content || restoredRef.current || !initialScrollRatio || !scrollRef.current) return
    restoredRef.current = true
    const el = scrollRef.current
    requestAnimationFrame(() => {
      el.scrollTop = initialScrollRatio * (el.scrollHeight - el.clientHeight)
    })
  }, [content, initialScrollRatio])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || !onScrollChange) return
    const ratio = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight)
    onScrollChange(ratio)
  }, [onScrollChange])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-destructive">
        {error}
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <div ref={scrollRef} onScroll={handleScroll} className="h-full overflow-y-auto p-8">
      <article
        className="prose prose-neutral mx-auto max-w-3xl dark:prose-invert"
        data-section-id="markdown-root"
      >
        <ReactMarkdown
          skipHtml
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1: createHeading("h1"),
            h2: createHeading("h2"),
            h3: createHeading("h3"),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  )
}

let headingCounter = 0

function createHeading(Tag: "h1" | "h2" | "h3") {
  function Heading({ children, ...props }: React.ComponentProps<"h1">) {
    return (
      <Tag data-section-id={`${Tag}-${++headingCounter}`} {...props}>
        {children}
      </Tag>
    )
  }
  Heading.displayName = `Heading_${Tag}`
  return Heading
}
