const PREFIX = "deep-paper-reader:progress:"

function isBrowser() {
  return typeof window !== "undefined"
}

export interface ReadingProgress {
  documentId: string
  page?: number
  scrollRatio?: number
  zoom?: number
  structureCollapsed?: boolean
  lastReadAt: string
}

export function getProgress(id: string): ReadingProgress | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(PREFIX + id)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setProgress(id: string, data: Partial<ReadingProgress>): void {
  if (!isBrowser()) return
  const current = getProgress(id) ?? { documentId: id }
  const updated = { ...current, ...data, documentId: id, lastReadAt: new Date().toISOString() }
  localStorage.setItem(PREFIX + id, JSON.stringify(updated))
}

export function getAllProgress(): ReadingProgress[] {
  if (!isBrowser()) return []
  const results: ReadingProgress[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(PREFIX)) continue
    try {
      results.push(JSON.parse(localStorage.getItem(key)!))
    } catch { /* skip */ }
  }
  return results.sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt))
}
