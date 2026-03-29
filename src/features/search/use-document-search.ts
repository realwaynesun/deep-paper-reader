"use client"

import { useState, useEffect, useCallback, useRef } from "react"

declare global {
  interface Window {
    find(query: string, caseSensitive?: boolean, backwards?: boolean): boolean
  }
}

interface SearchState {
  isOpen: boolean
  query: string
  matchCount: number
  currentMatch: number
}

const INITIAL_STATE: SearchState = {
  isOpen: false,
  query: "",
  matchCount: 0,
  currentMatch: 0,
}

function countMatches(query: string): number {
  if (!query) return 0
  const body = document.body.innerText
  const lower = body.toLowerCase()
  const target = query.toLowerCase()
  let count = 0
  let pos = 0
  while ((pos = lower.indexOf(target, pos)) !== -1) {
    count++
    pos += target.length
  }
  return count
}

export function useDocumentSearch() {
  const [state, setState] = useState<SearchState>(INITIAL_STATE)
  const inputRef = useRef<HTMLInputElement>(null)

  const open = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }))
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const close = useCallback(() => {
    setState(INITIAL_STATE)
    window.getSelection()?.removeAllRanges()
  }, [])

  const findMatch = useCallback((query: string, forward: boolean) => {
    if (!query) return
    window.getSelection()?.removeAllRanges()
    // window.find: (query, caseSensitive, backwards)
    const found = window.find(query, false, !forward)
    if (!found) {
      // Wrap around: move to start/end and try again
      const sel = window.getSelection()
      sel?.removeAllRanges()
      window.find(query, false, !forward)
    }
  }, [])

  const setQuery = useCallback(
    (query: string) => {
      const matchCount = countMatches(query)
      setState((prev) => ({
        ...prev,
        query,
        matchCount,
        currentMatch: matchCount > 0 ? 1 : 0,
      }))
      if (query) findMatch(query, true)
    },
    [findMatch]
  )

  const next = useCallback(() => {
    findMatch(state.query, true)
    setState((prev) => ({
      ...prev,
      currentMatch:
        prev.currentMatch >= prev.matchCount ? 1 : prev.currentMatch + 1,
    }))
  }, [state.query, findMatch])

  const prev = useCallback(() => {
    findMatch(state.query, false)
    setState((prev) => ({
      ...prev,
      currentMatch:
        prev.currentMatch <= 1 ? prev.matchCount : prev.currentMatch - 1,
    }))
  }, [state.query, findMatch])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey
      if (isMod && e.key === "f") {
        e.preventDefault()
        open()
      }
      if (e.key === "Escape" && state.isOpen) {
        close()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, close, state.isOpen])

  return { ...state, inputRef, open, close, setQuery, next, prev }
}
