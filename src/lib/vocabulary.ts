const STORAGE_KEY = "deep-paper-reader:vocabulary"

export interface VocabEntry {
  readonly id: string
  readonly word: string
  readonly explanation: string
  readonly context?: string
  readonly documentTitle?: string
  readonly documentId?: string
  readonly createdAt: string
}

function isBrowser() {
  return typeof window !== "undefined"
}

function readStore(): VocabEntry[] {
  if (!isBrowser()) return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
  } catch {
    return []
  }
}

function writeStore(entries: VocabEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function getAllVocab(): VocabEntry[] {
  return readStore().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getVocabForDocument(documentId: string): VocabEntry[] {
  return readStore().filter((v) => v.documentId === documentId)
}

export function addVocab(entry: Omit<VocabEntry, "id" | "createdAt">): VocabEntry | null {
  const store = readStore()
  const normalized = entry.word.trim().toLowerCase()
  if (store.some((v) => v.word.trim().toLowerCase() === normalized)) return null

  const newEntry: VocabEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  writeStore([newEntry, ...store])
  return newEntry
}

export function removeVocab(id: string) {
  writeStore(readStore().filter((v) => v.id !== id))
}

export function exportToAnki(entries: VocabEntry[]) {
  const tsv = entries
    .map((e) => {
      const back = e.context
        ? `${e.explanation}\n\nContext: ${e.context}`
        : e.explanation
      const tag = e.documentTitle ?? "deep-paper-reader"
      return `${e.word}\t${back.replace(/\t/g, " ").replace(/\n/g, "<br>")}\t${tag}`
    })
    .join("\n")

  const blob = new Blob([tsv], { type: "text/tab-separated-values" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `vocabulary-${new Date().toISOString().slice(0, 10)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
