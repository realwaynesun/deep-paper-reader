"use client"

import dynamic from "next/dynamic"
import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SelectionToolbar } from "@/features/selection/selection-toolbar"
import { useTextSelection } from "@/features/selection/use-text-selection"
import { TranslatePanel } from "@/features/translate/translate-panel"
import { useTranslate } from "@/features/translate/use-translate"
import { AskPopover } from "@/features/ask/ask-popover"
import { useAsk } from "@/features/ask/use-ask"
import { StructurePanel } from "@/features/structure/structure-panel"
import { useStructure } from "@/features/structure/use-structure"

const PdfViewer = dynamic(
  () =>
    import("@/features/pdf-viewer/pdf-viewer").then((m) => ({
      default: m.PdfViewer,
    })),
  { ssr: false }
)

export default function ReaderPage() {
  const router = useRouter()
  const [fullText, setFullText] = useState<string | null>(null)
  const [translateOpen, setTranslateOpen] = useState(false)
  const [askRect, setAskRect] = useState<DOMRect | null>(null)

  const selection = useTextSelection()
  const translate = useTranslate()
  const ask = useAsk()
  const structure = useStructure()
  const pdfNameRef = useRef(
    typeof window !== "undefined"
      ? sessionStorage.getItem("pdf-name")
      : null
  )

  const handleTranslate = useCallback(() => {
    setTranslateOpen(true)
    translate.translate(selection.text, selection.context)
    selection.clear()
  }, [selection, translate])

  const handleAsk = useCallback(() => {
    setAskRect(selection.rect)
    ask.ask(selection.text, selection.context, pdfNameRef.current ?? undefined)
    selection.clear()
  }, [selection, ask])

  const handleNavigate = useCallback((page: number) => {
    const el = document.querySelector(`[data-page-number="${page}"]`)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-sm font-medium">Deep Paper Reader</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 shrink-0 overflow-hidden">
          <StructurePanel
            nodes={structure.nodes}
            isLoading={structure.isLoading}
            error={structure.error}
            fullText={fullText}
            onAnalyze={structure.analyze}
            onNavigate={handleNavigate}
          />
        </div>

        <div className="relative flex-1 overflow-hidden">
          <PdfViewer onTextExtracted={setFullText} />

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
