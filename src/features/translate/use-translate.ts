"use client"

import { useState, useCallback, useRef } from "react"
import { useSettings } from "@/features/settings/settings-context"
import { aiHeaders } from "@/features/settings/ai-headers"
import { getCached, setCache } from "@/lib/result-cache"

interface TranslateState {
  original: string
  translation: string
  isStreaming: boolean
}

export function useTranslate() {
  const [state, setState] = useState<TranslateState>({
    original: "",
    translation: "",
    isStreaming: false,
  })
  const abortRef = useRef<AbortController | null>(null)
  const { settings } = useSettings()

  const translate = useCallback(async (text: string, context?: string) => {
    abortRef.current?.abort()

    const cached = getCached("translate", text)
    if (cached) {
      setState({ original: text, translation: cached, isStreaming: false })
      return
    }

    const controller = new AbortController()
    abortRef.current = controller

    setState({ original: text, translation: "", isStreaming: true })

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...aiHeaders(settings) },
        body: JSON.stringify({ text, context }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error("Translation failed")

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error("No response body")

      let buffer = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value)
        setState((prev) => ({ ...prev, translation: buffer }))
      }
      setCache("translate", text, buffer)
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setState((prev) => ({
          ...prev,
          translation: "Translation failed. Please try again.",
        }))
      }
    } finally {
      setState((prev) => ({ ...prev, isStreaming: false }))
    }
  }, [settings])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setState((prev) => ({ ...prev, isStreaming: false }))
  }, [])

  return { ...state, translate, cancel }
}
