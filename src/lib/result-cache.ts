const CACHE_KEY = "deep-paper-reader:cache"
const MAX_ENTRIES = 500

interface CacheEntry {
  result: string
  ts: number
}

type CacheStore = Record<string, CacheEntry>

function readStore(): CacheStore {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}")
  } catch {
    return {}
  }
}

function writeStore(store: CacheStore) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(store))
}

function makeKey(type: string, text: string): string {
  const normalized = text.trim().toLowerCase()
  return `${type}:${normalized}`
}

export function getCached(type: string, text: string): string | null {
  const store = readStore()
  const entry = store[makeKey(type, text)]
  return entry?.result ?? null
}

export function setCache(type: string, text: string, result: string) {
  const store = readStore()
  const key = makeKey(type, text)
  store[key] = { result, ts: Date.now() }

  const entries = Object.entries(store)
  if (entries.length > MAX_ENTRIES) {
    entries.sort((a, b) => a[1].ts - b[1].ts)
    const pruned = Object.fromEntries(entries.slice(entries.length - MAX_ENTRIES))
    writeStore(pruned)
    return
  }

  writeStore(store)
}
