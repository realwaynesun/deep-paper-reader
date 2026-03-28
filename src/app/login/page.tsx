"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        window.location.href = "/"
      } else {
        setError("Wrong password")
      }
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-2xl font-bold">Deep Paper Reader</h1>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="rounded-md border border-muted-foreground/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-muted-foreground/50"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading || !password}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enter"}
        </Button>
      </form>
    </div>
  )
}
