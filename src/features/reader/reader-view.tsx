"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsButton } from "@/features/settings/settings-dialog"
import { PdfViewer } from "@/features/pdf-viewer/pdf-viewer"
import { MarkdownViewer } from "@/features/markdown-viewer/markdown-viewer"
import { SelectionToolbar } from "@/features/selection/selection-toolbar"
import { useTextSelection } from "@/features/selection/use-text-selection"
import { TranslatePanel } from "@/features/translate/translate-panel"
import { useTranslate } from "@/features/translate/use-translate"
import { AskPopover } from "@/features/ask/ask-popover"
import { useAsk } from "@/features/ask/use-ask"
import { StructurePanel } from "@/features/structure/structure-panel"
import { useStructure } from "@/features/structure/use-structure"
import { getProgress, setProgress } from "@/lib/reading-progress"
import type { DocumentSource } from "@/app/page"

interface ReaderViewProps {
  doc: DocumentSource
  onBack: () => void
}

export function ReaderView({ doc, onBack }: ReaderViewProps) {
  const router = useRouter()

  const isPdf =
    doc.type === "pdf" ||
    (doc.type === "file" && !doc.file.name.endsWith(".md"))

  const title =
    doc.type === "file" ? doc.file.name :
    doc.type === "pdf" ? doc.title :
    doc.web.title

  const documentId =
    doc.type === "pdf" ? doc.id :
    doc.type === "web" ? doc.web.id :
    undefined

  const savedProgress = documentId ? getProgress(documentId) : null

  const [fullText, setFullText] = useState<string | null>(null)
  const [translateOpen, setTranslateOpen] = useState(false)
  const [askRect, setAskRect] = useState<DOMRect | null>(null)
  const [pdfUrl, setPdfUrl] = useState(doc.type === "pdf" ? doc.pdfUrl : "")
  const [structureCollapsed, setStructureCollapsed] = useState(savedProgress?.structureCollapsed ?? false)
  const [readProgress, setReadProgress] = useState(0)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (doc.type !== "file" || doc.file.name.endsWith(".md")) return
    const url = URL.createObjectURL(doc.file)
    setPdfUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [doc])

  // Mark as read
  useEffect(() => {
    if (documentId) setProgress(documentId, {})
  }, [documentId])

  const throttledSave = useCallback((data: Record<string, unknown>) => {
    if (!documentId) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => setProgress(documentId, data), 2000)
  }, [documentId])

  const handlePageChange = useCallback((page: number, totalPages: number) => {
    throttledSave({ page, totalPages })
    setReadProgress(totalPages > 0 ? page / totalPages : 0)
  }, [throttledSave])

  const handleScrollChange = useCallback((ratio: number) => {
    throttledSave({ scrollRatio: ratio })
    setReadProgress(ratio)
  }, [throttledSave])

  const handleZoomChange = useCallback((zoom: number) => {
    throttledSave({ zoom })
  }, [throttledSave])

  const handleStructureToggle = useCallback(() => {
    setStructureCollapsed((v) => {
      const next = !v
      throttledSave({ structureCollapsed: next })
      return next
    })
  }, [throttledSave])

  const selection = useTextSelection()
  const translate = useTranslate()
  const ask = useAsk()
  const structure = useStructure(documentId)

  const handleTranslate = useCallback(() => {
    setTranslateOpen(true)
    translate.translate(selection.text, selection.context)
    selection.clear()
  }, [selection, translate])

  const handleAsk = useCallback(() => {
    setAskRect(selection.rect)
    ask.ask(selection.text, selection.context, title)
    selection.clear()
  }, [selection, ask, title])

  const handleNavigate = useCallback((page: number) => {
    if (!Number.isFinite(page) || page < 1) return
    const el = document.querySelector(`[data-page-number="${page}"]`)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const renderViewer = () => {
    if (isPdf && pdfUrl) {
      return (
        <PdfViewer
          url={pdfUrl}
          onTextExtracted={setFullText}
          initialPage={savedProgress?.page}
          initialZoom={savedProgress?.zoom}
          onPageChange={handlePageChange}
          onZoomChange={handleZoomChange}
        />
      )
    }
    if (doc.type === "file") {
      return <MarkdownViewer file={doc.file} onTextExtracted={setFullText} onScrollChange={handleScrollChange} initialScrollRatio={savedProgress?.scrollRatio} />
    }
    if (doc.type === "web") {
      return <MarkdownViewer content={doc.web.content} onTextExtracted={setFullText} onScrollChange={handleScrollChange} initialScrollRatio={savedProgress?.scrollRatio} />
    }
    return null
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="truncate text-sm font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-1">
          {doc.type === "pdf" && doc.pdfUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground"
              onClick={() => {
                navigator.clipboard.writeText(doc.pdfUrl)
                window.open("https://notebooklm.google.com", "_blank")
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              NotebookLM
            </Button>
          )}
          <SettingsButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className={`${structureCollapsed ? "w-12" : "w-72"} shrink-0 overflow-hidden transition-[width] duration-200`}>
          <StructurePanel
            nodes={structure.nodes}
            isLoading={structure.isLoading}
            error={structure.error}
            fullText={fullText}
            collapsed={structureCollapsed}
            onToggle={handleStructureToggle}
            onAnalyze={structure.analyze}
            onNavigate={handleNavigate}
          />
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div
            className="absolute left-0 top-0 z-10 h-[2px] bg-primary transition-[width] duration-300"
            style={{ width: `${readProgress * 100}%` }}
          />
          {renderViewer()}

          <SelectionToolbar
            rect={selection.rect}
            action={selection.action}
            onAsk={handleAsk}
            onTranslate={handleTranslate}
            onMouseDown={selection.preventDismiss}
          />

          <AskPopover
            rect={askRect}
            word={ask.word}
            explanation={ask.explanation}
            isStreaming={ask.isStreaming}
            isOpen={ask.isOpen}
            onClose={() => {
              ask.close()
              setAskRect(null)
            }}
          />
        </div>
      </div>

      <TranslatePanel
        open={translateOpen}
        onClose={() => {
          setTranslateOpen(false)
          translate.cancel()
        }}
        original={translate.original}
        translation={translate.translation}
        isStreaming={translate.isStreaming}
      />
    </div>
  )
}
