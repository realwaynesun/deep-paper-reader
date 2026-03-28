"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useSettings } from "@/features/settings/settings-context"
import { aiHeaders } from "@/features/settings/ai-headers"

export interface StructureNode {
  title: string
  summary: string
  page: number
  children?: StructureNode[]
}

interface StructureState {
  nodes: StructureNode[]
  isLoading: boolean
  error: string | null
}

export function useStructure(documentId?: string) {
  const [state, setState] = useState<StructureState>({
    nodes: [],
    isLoading: false,
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)
  const { settings } = useSettings()
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!documentId || loadedRef.current) return
    loadedRef.current = true
    fetch(`/api/documents/${documentId}/structure`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setState({ nodes: data, isLoading: false, error: null })
        }
      })
      .catch(() => {})
  }, [documentId])

  const analyze = useCallback(async (text: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState({ nodes: [], isLoading: true, error: null })

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...aiHeaders(settings) },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error("Summarize failed")

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error("No response body")

      let buffer = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value)
      }

      const cleaned = buffer
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim()
      const nodes = JSON.parse(cleaned) as StructureNode[]
      setState({ nodes, isLoading: false, error: null })

      if (documentId) {
        fetch(`/api/documents/${documentId}/structure`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nodes),
        }).catch(() => {})
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to analyze structure.",
        }))
      }
    }
  }, [settings, documentId])

  return { ...state, analyze }
}
