"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  cleanSelectedText,
  classifySelection,
  getSurroundingContext,
  type SelectionAction,
} from "./selection-utils"

interface SelectionState {
  text: string
  context: string
  action: SelectionAction
  rect: DOMRect | null
}

const INITIAL_STATE: SelectionState = {
  text: "",
  context: "",
  action: null,
  rect: null,
}

export function useTextSelection() {
  const [state, setState] = useState<SelectionState>(INITIAL_STATE)
  const dismissRef = useRef(false)

  const clear = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  useEffect(() => {
    const handleMouseUp = () => {
      if (dismissRef.current) {
        dismissRef.current = false
        return
      }

      setTimeout(() => {
        const selection = window.getSelection()
        if (!selection || selection.isCollapsed) {
          clear()
          return
        }

        const raw = selection.toString()
        const text = cleanSelectedText(raw)
        const action = classifySelection(text)

        if (!action) {
          clear()
          return
        }

        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        const context = getSurroundingContext(selection)

        setState({ text, context, action, rect })
      }, 10)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") clear()
    }

    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [clear])

  const preventDismiss = useCallback(() => {
    dismissRef.current = true
  }, [])

  return { ...state, clear, preventDismiss }
}
