"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (file.type !== "application/pdf") return
      const url = URL.createObjectURL(file)
      sessionStorage.setItem("pdf-url", url)
      sessionStorage.setItem("pdf-name", file.name)
      router.push("/reader")
    },
    [router]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
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
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex w-full max-w-lg flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
      >
        <div className="rounded-full bg-muted p-4">
          {isDragging ? (
            <FileText className="h-8 w-8 text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="text-center">
          <p className="font-medium">
            {isDragging ? "Drop your PDF here" : "Drag & drop a PDF"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or click below to browse
          </p>
        </div>
        <label>
          <Button variant="outline" asChild>
            <span>
              <Upload className="mr-2 h-4 w-4" />
              Choose PDF
            </span>
          </Button>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      <p className="max-w-md text-center text-xs text-muted-foreground">
        Your PDF stays in the browser. Only selected text is sent to OpenAI for
        translation and analysis.
      </p>
    </div>
  )
}
