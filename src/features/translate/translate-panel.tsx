"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Loader2 } from "lucide-react"

interface TranslatePanelProps {
  open: boolean
  onClose: () => void
  original: string
  translation: string
  isStreaming: boolean
}

export function TranslatePanel({
  open,
  onClose,
  original,
  translation,
  isStreaming,
}: TranslatePanelProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[400px] overflow-y-auto sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Translation
            {isStreaming && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Original
            </h3>
            <p className="text-sm leading-relaxed">{original}</p>
          </div>

          <div className="h-px bg-border" />

          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Chinese Translation
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {translation || (
                <span className="text-muted-foreground">
                  Translating...
                </span>
              )}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
