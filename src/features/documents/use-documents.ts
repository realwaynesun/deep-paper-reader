"use client"

import { useCallback, useEffect, useState } from "react"

export interface DocumentMeta {
  id: string
  title: string
  sourceUrl: string
  savedAt: string
  category?: string
  format?: "pdf" | "markdown"
  pdfUrl?: string
}

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentMeta[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/documents")
      if (!res.ok) {
        setDocuments([])
        return
      }
      setDocuments(await res.json())
    } catch {
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const remove = useCallback(async (id: string) => {
    await fetch(`/api/documents/${id}`, { method: "DELETE" })
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }, [])

  return { documents, isLoading, refresh, remove }
}
