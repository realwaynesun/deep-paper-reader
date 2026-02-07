"use client"

import { useCallback, useRef, useEffect, useState } from "react"
import { Document } from "react-pdf"
import { pdfjs } from "react-pdf"
import { PdfPage } from "./pdf-page"
import { PdfControls } from "./pdf-controls"
import { Loader2 } from "lucide-react"

import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfViewerProps {
  url: string
  onTextExtracted?: (text: string) => void
}

export function PdfViewer({ url, onTextExtracted }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1.2)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(3, s + 0.2))
  }, [])

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(0.5, s - 0.2))
  }, [])

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, numPages))
      setCurrentPage(clamped)
      const el = containerRef.current?.querySelector(
        `[data-page-number="${clamped}"]`
      )
      el?.scrollIntoView({ behavior: "smooth", block: "start" })
    },
    [numPages]
  )

  const handleLoadSuccess = useCallback(
    async (pdf: { numPages: number }) => {
      setNumPages(pdf.numPages)

      if (!onTextExtracted) return

      const pages: string[] = []
      const pdfDoc = await pdfjs.getDocument(url).promise
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
    [onTextExtracted, url]
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
  }, [numPages])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-center border-b bg-background/80 px-4 py-2 backdrop-blur-sm">
        <PdfControls
          currentPage={currentPage}
          numPages={numPages}
          scale={scale}
          onPageChange={goToPage}
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
