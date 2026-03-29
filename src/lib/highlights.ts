const PREFIX = "deep-paper-reader:highlights:"

export interface Highlight {
  id: string
  documentId: string
  text: string
  note?: string
  createdAt: string
}

export function getHighlights(documentId: string): Highlight[] {
  try {
    const raw = localStorage.getItem(PREFIX + documentId)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addHighlight(
  documentId: string,
  text: string,
  note?: string
): Highlight {
  const highlights = getHighlights(documentId)
  const highlight: Highlight = {
    id: crypto.randomUUID(),
    documentId,
    text,
    note,
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(PREFIX + documentId, JSON.stringify([...highlights, highlight]))
  return highlight
}

export function removeHighlight(documentId: string, id: string): void {
  const highlights = getHighlights(documentId).filter((h) => h.id !== id)
  localStorage.setItem(PREFIX + documentId, JSON.stringify(highlights))
}
