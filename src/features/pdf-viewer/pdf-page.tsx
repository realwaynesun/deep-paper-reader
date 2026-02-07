"use client"

import { Page } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

interface PdfPageProps {
  pageNumber: number
  scale: number
  onPageVisible?: (pageNumber: number) => void
}

export function PdfPage({ pageNumber, scale }: PdfPageProps) {
  return (
    <div className="mb-2 shadow-md" data-page-number={pageNumber}>
      <Page
        pageNumber={pageNumber}
        scale={scale}
        renderTextLayer={true}
        renderAnnotationLayer={true}
      />
    </div>
  )
}
