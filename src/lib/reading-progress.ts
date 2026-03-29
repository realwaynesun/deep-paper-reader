const PREFIX = "deep-paper-reader:progress:"

export interface ReadingProgress {
  documentId: string
  page?: number
  scrollRatio?: number
  zoom?: number
  totalReadingTime?: number
  lastReadAt: string
}

export function getProgress(id: string): ReadingProgress | null {
  try {
    const raw = localStorage.getItem(PREFIX + id)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setProgress(id: string, data: Partial<ReadingProgress>): void {
  const current = getProgress(id) ?? { documentId: id }
  const updated = { ...current, ...data, documentId: id, lastReadAt: new Date().toISOString() }
  localStorage.setItem(PREFIX + id, JSON.stringify(updated))
}

export function getAllProgress(): ReadingProgress[] {
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

export function formatReadingTime(seconds: number): string {
  if (seconds < 60) return "<1 min"
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return remaining > 0 ? `${hours}h ${remaining}min` : `${hours}h`
}
