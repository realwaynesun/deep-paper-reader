"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { type AISettings, DEFAULT_SETTINGS } from "./types"

const STORAGE_KEY = "deep-paper-reader:ai-settings"

interface SettingsContextValue {
  settings: AISettings
  updateSettings: (next: AISettings) => void
  isConfigured: boolean
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  isConfigured: false,
})

function loadSettings(): AISettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const updateSettings = useCallback((next: AISettings) => {
    setSettings(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }, [])

  const isConfigured = settings.apiKey.length > 0

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isConfigured }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
