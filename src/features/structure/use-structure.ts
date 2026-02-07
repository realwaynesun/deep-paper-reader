"use client"

import { useState, useCallback, useRef } from "react"
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

export function useStructure() {
  const [state, setState] = useState<StructureState>({
    nodes: [],
    isLoading: false,
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)
  const { settings } = useSettings()

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
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to analyze structure.",
        }))
      }
    }
  }, [settings])

  return { ...state, analyze }
}
