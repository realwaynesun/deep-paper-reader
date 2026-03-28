"use client"

import { useState, useCallback, useEffect } from "react"
import { ArrowLeft, Bookmark, Check } from "lucide-react"
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
import type { DocumentSource } from "@/app/page"

interface ReaderViewProps {
  doc: DocumentSource
  onBack: () => void
}

export function ReaderView({ doc, onBack }: ReaderViewProps) {
  const [fullText, setFullText] = useState<string | null>(null)
  const [translateOpen, setTranslateOpen] = useState(false)
  const [askRect, setAskRect] = useState<DOMRect | null>(null)
  const [structureCollapsed, setStructureCollapsed] = useState(false)
  const [saved, setSaved] = useState(false)

  const isPdf = doc.type === "file" && !doc.file.name.endsWith(".md")
  const canSave = doc.type === "web" && !!doc.web.sourceUrl
  const [pdfUrl, setPdfUrl] = useState("")

  const title =
    doc.type === "file" ? doc.file.name : doc.web.title

  useEffect(() => {
    if (doc.type !== "file" || doc.file.name.endsWith(".md")) return
    const url = URL.createObjectURL(doc.file)
    setPdfUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [doc])

  const selection = useTextSelection()
  const translate = useTranslate()
  const ask = useAsk()
  const structure = useStructure()

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
    if (isPdf) {
      return <PdfViewer url={pdfUrl} onTextExtracted={setFullText} />
    }
    if (doc.type === "file") {
      return <MarkdownViewer file={doc.file} onTextExtracted={setFullText} />
    }
    return <MarkdownViewer content={doc.web.content} onTextExtracted={setFullText} />
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
          {canSave && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={saved}
              onClick={async () => {
                if (doc.type !== "web" || !doc.web.sourceUrl) return
                const res = await fetch("/api/documents", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url: doc.web.sourceUrl }),
                })
                if (res.ok) setSaved(true)
              }}
            >
              {saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
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
            onToggle={() => setStructureCollapsed((v) => !v)}
            onAnalyze={structure.analyze}
            onNavigate={handleNavigate}
          />
        </div>

        <div className="relative flex-1 overflow-hidden">
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
