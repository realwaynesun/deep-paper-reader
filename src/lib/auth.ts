function getPassword(): string | null {
  return process.env.READER_PASSWORD ?? null
}

export function isAuthEnabled(): boolean {
  return getPassword() !== null
}

export function isAuthenticated(req: Request): boolean {
  const password = getPassword()
  if (!password) return true

  const bearer = req.headers.get("authorization")?.replace("Bearer ", "")
  if (bearer === password) return true

  const cookie = req.headers.get("cookie") ?? ""
  const match = cookie.match(/reader-auth=([^;]+)/)
  return match?.[1] === password
}
