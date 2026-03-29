const PREFIX = "deep-paper-reader:bookmarks:"

export interface Bookmark {
  id: string
  documentId: string
  page?: number
  scrollRatio?: number
  label?: string
  createdAt: string
}

export function getBookmarks(documentId: string): Bookmark[] {
  try {
    const raw = localStorage.getItem(PREFIX + documentId)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addBookmark(
  documentId: string,
  data: { page?: number; scrollRatio?: number; label?: string }
): Bookmark {
  const bookmarks = getBookmarks(documentId)
  const bookmark: Bookmark = {
    id: crypto.randomUUID(),
    documentId,
    ...data,
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(PREFIX + documentId, JSON.stringify([...bookmarks, bookmark]))
  return bookmark
}

export function removeBookmark(documentId: string, id: string): void {
  const bookmarks = getBookmarks(documentId).filter((b) => b.id !== id)
  localStorage.setItem(PREFIX + documentId, JSON.stringify(bookmarks))
}
