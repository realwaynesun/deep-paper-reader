"use client"

import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"

type MarkdownViewerProps = {
  onTextExtracted: (text: string) => void
} & ({ file: File; content?: never } | { content: string; file?: never })

export function MarkdownViewer({ file, content: rawContent, onTextExtracted }: MarkdownViewerProps) {
  const [content, setContent] = useState<string>(rawContent ?? "")
  const [error, setError] = useState<string>("")
  const onTextExtractedRef = useRef(onTextExtracted)
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
    <div className="h-full overflow-y-auto p-8">
      <article
        className="prose prose-neutral mx-auto max-w-3xl dark:prose-invert"
        data-section-id="markdown-root"
      >
        <ReactMarkdown
          skipHtml
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
