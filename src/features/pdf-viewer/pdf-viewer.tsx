"use client"

import { useCallback, useRef, useEffect } from "react"
import { Document } from "react-pdf"
import { PdfPage } from "./pdf-page"
import { PdfControls } from "./pdf-controls"
import { usePdfDocument } from "./use-pdf-document"
import { Loader2 } from "lucide-react"

interface PdfViewerProps {
  onTextExtracted?: (text: string) => void
}

export function PdfViewer({ onTextExtracted }: PdfViewerProps) {
  const {
    url,
    numPages,
    currentPage,
    scale,
    onDocumentLoadSuccess,
    setCurrentPage,
    zoomIn,
    zoomOut,
  } = usePdfDocument()

  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const handleLoadSuccess = useCallback(
    async (pdf: { numPages: number }) => {
      onDocumentLoadSuccess(pdf)

      if (!onTextExtracted) return

      const pages: string[] = []
      const pdfDoc = await (
        await import("react-pdf")
      ).pdfjs.getDocument(url!).promise
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const content = await page.getTextContent()
        const text = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ")
        pages.push(text)
      }
      onTextExtracted(pages.join("\n\n--- Page Break ---\n\n"))
    },
    [onDocumentLoadSuccess, onTextExtracted, url]
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container || numPages === 0) return

    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible.length > 0) {
          const pageNum = Number(
            (visible[0].target as HTMLElement).dataset.pageNumber
          )
          if (pageNum) setCurrentPage(pageNum)
        }
      },
      { root: container, threshold: 0.5 }
    )

    const pages = container.querySelectorAll("[data-page-number]")
    pages.forEach((page) => observerRef.current?.observe(page))

    return () => observerRef.current?.disconnect()
  }, [numPages, setCurrentPage])

  if (!url) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No PDF loaded
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-center border-b bg-background/80 px-4 py-2 backdrop-blur-sm">
        <PdfControls
          currentPage={currentPage}
          numPages={numPages}
          scale={scale}
          onPageChange={setCurrentPage}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
        />
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-muted/30 px-4 py-4"
      >
        <Document
          file={url}
          onLoadSuccess={handleLoadSuccess}
          loading={
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <div className="flex flex-col items-center gap-4">
            {Array.from({ length: numPages }, (_, i) => (
              <PdfPage key={i + 1} pageNumber={i + 1} scale={scale} />
            ))}
          </div>
        </Document>
      </div>
    </div>
  )
}
