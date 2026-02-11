"use client"

import { useState, useCallback, useRef } from "react"
import { useSettings } from "@/features/settings/settings-context"
import { aiHeaders } from "@/features/settings/ai-headers"
import { getCached, setCache } from "@/lib/result-cache"

interface AskState {
  word: string
  explanation: string
  isStreaming: boolean
  isOpen: boolean
}

export function useAsk() {
  const [state, setState] = useState<AskState>({
    word: "",
    explanation: "",
    isStreaming: false,
    isOpen: false,
  })
  const abortRef = useRef<AbortController | null>(null)
  const { settings } = useSettings()

  const ask = useCallback(
    async (word: string, context: string, paperTitle?: string) => {
      abortRef.current?.abort()

      const cached = getCached("ask", word)
      if (cached) {
        setState({ word, explanation: cached, isStreaming: false, isOpen: true })
        return
      }

      const controller = new AbortController()
      abortRef.current = controller

      setState({
        word,
        explanation: "",
        isStreaming: true,
        isOpen: true,
      })

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...aiHeaders(settings) },
          body: JSON.stringify({ word, context, paperTitle }),
          signal: controller.signal,
        })

        if (!res.ok) throw new Error("Ask failed")

        const reader = res.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) throw new Error("No response body")

        let buffer = ""
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value)
          setState((prev) => ({ ...prev, explanation: buffer }))
        }
        setCache("ask", word, buffer)
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setState((prev) => ({
            ...prev,
            explanation: "Failed to get explanation. Please try again.",
          }))
        }
      } finally {
        setState((prev) => ({ ...prev, isStreaming: false }))
      }
    },
    [settings]
  )

  const close = useCallback(() => {
    abortRef.current?.abort()
    setState((prev) => ({ ...prev, isOpen: false, isStreaming: false }))
  }, [])

  return { ...state, ask, close }
}
