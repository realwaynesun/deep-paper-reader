"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, FileText, Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsButton } from "@/features/settings/settings-dialog"
import { DocumentList, type DocumentListHandle } from "@/features/documents/document-list"
import dynamic from "next/dynamic"

const ReaderView = dynamic(
  () => import("@/features/reader/reader-view").then((m) => ({ default: m.ReaderView })),
  { ssr: false }
)

export interface WebContent {
  title: string
  content: string
  sourceUrl?: string
}

export type DocumentSource =
  | { type: "file"; file: File }
  | { type: "web"; web: WebContent }

const ACCEPTED_TYPES = new Set(["application/pdf", "text/markdown", "text/x-markdown"])

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES.has(file.type)) return true
  return file.name.endsWith(".md")
}

async function saveToCloud(data: { title: string; content: string; sourceUrl?: string }) {
  const res = await fetch("/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) return null
  return res.json()
}

export default function Home() {
  const [doc, setDoc] = useState<DocumentSource | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState("")
  const docListRef = useRef<DocumentListHandle>(null)

  const handleFile = useCallback(async (f: File) => {
    if (!isAcceptedFile(f)) return

    if (f.name.endsWith(".md") || f.type === "text/markdown" || f.type === "text/x-markdown") {
      const content = await f.text()
      const title = f.name.replace(/\.md$/, "")
      setDoc({ type: "web", web: { title, content } })
      saveToCloud({ title, content }).then(() => docListRef.current?.refresh())
      return
    }

    setDoc({ type: "file", file: f })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleUrlSubmit = useCallback(async () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return

    setUrlError("")
    setUrlLoading(true)
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) {
        setUrlError(data.error || "Failed to fetch URL")
        return
      }
      setDoc({ type: "web", web: { title: data.title, content: data.content, sourceUrl: trimmed } })
      docListRef.current?.refresh()
    } catch {
      setUrlError("Network error")
    } finally {
      setUrlLoading(false)
    }
  }, [urlInput])

  const handleOpenSaved = useCallback(
    (web: { title: string; content: string; sourceUrl: string }) => {
      setDoc({ type: "web", web })
    },
    []
  )

  const handleSavedPdfText = useCallback((title: string, text: string) => {
    saveToCloud({ title, content: text }).then(() => docListRef.current?.refresh())
  }, [])

  if (doc) {
    return (
      <ReaderView
        doc={doc}
        onBack={() => setDoc(null)}
        onPdfTextSaved={doc.type === "file" ? handleSavedPdfText : undefined}
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="absolute top-4 right-4">
        <SettingsButton />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Deep Paper Reader
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          AI-powered reading assistant with translation and structure analysis
        </p>
      </div>

      <div className="flex w-full max-w-lg flex-col items-center gap-3 rounded-xl border border-muted-foreground/25 p-6">
        <div className="flex w-full items-center gap-2">
          <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="url"
            placeholder="Paste a URL to read..."
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value)
              setUrlError("")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUrlSubmit()
            }}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleUrlSubmit}
            disabled={urlLoading || !urlInput.trim()}
          >
            {urlLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Go"}
          </Button>
        </div>
        {urlError && (
          <p className="w-full text-xs text-destructive">{urlError}</p>
        )}
      </div>

      <DocumentList ref={docListRef} onOpen={handleOpenSaved} />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px w-8 bg-muted-foreground/25" />
        or upload a file
        <div className="h-px w-8 bg-muted-foreground/25" />
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex w-full max-w-lg flex-col items-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/25 p-10 transition-colors hover:border-muted-foreground/50"
      >
        <div className="rounded-full bg-muted p-4">
          <Upload className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-medium">Drag & drop a PDF or Markdown file</p>
          <p className="mt-1 text-sm text-muted-foreground">
            or click below to browse
          </p>
        </div>
        <label>
          <Button variant="outline" asChild>
            <span>
              <FileText className="mr-2 h-4 w-4" />
              Choose File
            </span>
          </Button>
          <input
            type="file"
            accept="application/pdf,.md"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      <p className="max-w-md text-center text-xs text-muted-foreground">
        Your file stays in the browser. Only selected text is sent to your AI
        provider for translation and analysis.
      </p>
    </div>
  )
}
