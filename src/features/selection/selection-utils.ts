export function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function cleanSelectedText(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}

export function getSurroundingContext(
  selection: Selection,
  maxChars = 500
): string {
  const range = selection.getRangeAt(0)
  const container = range.commonAncestorContainer

  const parent =
    container.nodeType === Node.TEXT_NODE
      ? container.parentElement
      : (container as HTMLElement)

  if (!parent) return ""

  const grandParent = parent.closest("[data-page-number], [data-section-id]") ?? parent
  const fullText = grandParent.textContent ?? ""
  const selectedText = selection.toString()
  const idx = fullText.indexOf(selectedText)

  if (idx === -1) return fullText.slice(0, maxChars)

  const start = Math.max(0, idx - 200)
  const end = Math.min(fullText.length, idx + selectedText.length + 200)
  return fullText.slice(start, end)
}

export type SelectionAction = "ask" | "translate" | null

export function classifySelection(text: string): SelectionAction {
  const wordCount = getWordCount(text)
  if (wordCount === 0) return null
  if (wordCount <= 3) return "ask"
  return "translate"
}
