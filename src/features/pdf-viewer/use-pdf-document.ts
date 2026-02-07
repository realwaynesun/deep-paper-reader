"use client"

import { useState, useEffect, useCallback } from "react"
import { pdfjs } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfState {
  url: string | null
  name: string | null
  numPages: number
  currentPage: number
  scale: number
}

export function usePdfDocument() {
  const [state, setState] = useState<PdfState>({
    url: null,
    name: null,
    numPages: 0,
    currentPage: 1,
    scale: 1.2,
  })

  useEffect(() => {
    const url = sessionStorage.getItem("pdf-url")
    const name = sessionStorage.getItem("pdf-name")
    if (url) {
      setState((prev) => ({ ...prev, url, name }))
    }
  }, [])

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setState((prev) => ({ ...prev, numPages }))
    },
    []
  )

  const setCurrentPage = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.numPages)),
    }))
  }, [])

  const setScale = useCallback((scale: number) => {
    setState((prev) => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, scale)),
    }))
  }, [])

  const zoomIn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: Math.min(3, prev.scale + 0.2),
    }))
  }, [])

  const zoomOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      scale: Math.max(0.5, prev.scale - 0.2),
    }))
  }, [])

  return {
    ...state,
    onDocumentLoadSuccess,
    setCurrentPage,
    setScale,
    zoomIn,
    zoomOut,
  }
}
