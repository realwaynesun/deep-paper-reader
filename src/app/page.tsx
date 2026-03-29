"use client"

import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsButton } from "@/features/settings/settings-dialog"
import { DocumentList, type DocumentListHandle } from "@/features/documents/document-list"
import dynamic from "next/dynamic"

const ReaderView = dynamic(
  () => import("@/features/reader/reader-view").then((m) => ({ default: m.ReaderView })),
  { ssr: false }
)

export interface WebContent {
  id?: string
  title: string
  content: string
  sourceUrl?: string
}

export type DocumentSource =
  | { type: "file"; file: File }
  | { type: "web"; web: WebContent }
  | { type: "pdf"; id: string; title: string; pdfUrl: string }

const ACCEPTED_TYPES = new Set(["application/pdf", "text/markdown", "text/x-markdown"])

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES.has(file.type)) return true
  return file.name.endsWith(".md")
}

export default function Home() {
  const router = useRouter()
  const [localDoc, setLocalDoc] = useState<DocumentSource | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState("")
  const docListRef = useRef<DocumentListHandle>(null)

  const handleFile = useCallback(async (f: File) => {
    if (!isAcceptedFile(f)) return

    if (f.name.endsWith(".md") || f.type === "text/markdown" || f.type === "text/x-markdown") {
      const content = await f.text()
      const title = f.name.replace(/\.md$/, "")
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/read/${data.id}`)
      } else {
        setLocalDoc({ type: "web", web: { title, content } })
      }
      return
    }

    // PDF — upload to cloud, then navigate
    setLocalDoc({ type: "file", file: f })
    const form = new FormData()
    form.append("file", f)
    form.append("title", f.name.replace(/\.pdf$/i, ""))
    fetch("/api/documents", { method: "POST", body: form })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          router.push(`/read/${data.id}`)
          setLocalDoc(null)
        }
      })
      .catch(() => {})
  }, [router])

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
      router.push(`/read/${data.id}`)
    } catch {
      setUrlError("Network error")
    } finally {
      setUrlLoading(false)
    }
  }, [urlInput, router])

  // Local file being viewed before cloud save completes
  if (localDoc) {
    return <ReaderView doc={localDoc} onBack={() => setLocalDoc(null)} />
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center p-8"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="absolute top-4 right-4">
        <SettingsButton />
      </div>

      <div className="mt-8 mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Deep Paper Reader</h1>
      </div>

      <div className="flex w-full max-w-lg items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-muted-foreground/25 px-3 py-2">
          <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="url"
            placeholder="Paste a URL..."
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
            variant="ghost"
            size="sm"
            onClick={handleUrlSubmit}
            disabled={urlLoading || !urlInput.trim()}
          >
            {urlLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Go"}
          </Button>
        </div>
        <label>
          <Button variant="outline" size="sm" asChild>
            <span>
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              File
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
      {urlError && (
        <p className="mt-1 w-full max-w-lg text-xs text-destructive">{urlError}</p>
      )}

      <div className="mt-6 w-full max-w-lg flex-1">
        <DocumentList ref={docListRef} />
      </div>
    </div>
  )
}
