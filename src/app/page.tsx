"use client"

import { useCallback, useState } from "react"
import { Upload, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsButton } from "@/features/settings/settings-dialog"
import dynamic from "next/dynamic"

const ReaderView = dynamic(
  () => import("@/features/reader/reader-view").then((m) => ({ default: m.ReaderView })),
  { ssr: false }
)

const ACCEPTED_TYPES = new Set(["application/pdf", "text/markdown", "text/x-markdown"])

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_TYPES.has(file.type)) return true
  return file.name.endsWith(".md")
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)

  const handleFile = useCallback((f: File) => {
    if (!isAcceptedFile(f)) return
    setFile(f)
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

  if (file) {
    return <ReaderView file={file} onBack={() => setFile(null)} />
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
          AI-powered academic paper reader with translation and structure
          analysis
        </p>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex w-full max-w-lg flex-col items-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/25 p-12 transition-colors hover:border-muted-foreground/50"
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
