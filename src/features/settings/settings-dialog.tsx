"use client"

import { useState, useEffect } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { PROVIDERS } from "@/lib/ai-providers"
import { useSettings } from "./settings-context"

export function SettingsButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen(true)}
      >
        <Settings className="h-4 w-4" />
      </Button>
      <SettingsDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function SettingsDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { settings, updateSettings } = useSettings()
  const [draft, setDraft] = useState(settings)

  useEffect(() => {
    if (open) setDraft(settings)
  }, [open, settings])

  const currentProvider = PROVIDERS.find((p) => p.id === draft.providerId)
  const models = currentProvider?.models ?? []

  const handleProviderChange = (providerId: string) => {
    const provider = PROVIDERS.find((p) => p.id === providerId)
    const firstModel = provider?.models[0]?.id ?? ""
    setDraft({ ...draft, providerId, modelId: firstModel })
  }

  const handleSave = () => {
    updateSettings(draft)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-80 sm:max-w-80">
        <SheetHeader>
          <SheetTitle>AI Settings</SheetTitle>
          <SheetDescription>
            Choose your AI provider and enter your API key.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Provider</span>
            <select
              value={draft.providerId}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="h-9 rounded-md border bg-transparent px-3 text-sm"
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Model</span>
            <select
              value={draft.modelId}
              onChange={(e) => setDraft({ ...draft, modelId: e.target.value })}
              className="h-9 rounded-md border bg-transparent px-3 text-sm"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">API Key</span>
            <input
              type="password"
              value={draft.apiKey}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
              placeholder="sk-..."
              className="h-9 rounded-md border bg-transparent px-3 text-sm"
            />
          </label>

          <Button onClick={handleSave} className="mt-2">
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
