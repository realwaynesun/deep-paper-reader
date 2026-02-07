"use client"

import { Page } from "react-pdf"

interface PdfPageProps {
  pageNumber: number
  scale: number
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
