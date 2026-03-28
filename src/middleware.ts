import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const password = process.env.READER_PASSWORD
  if (!password) return NextResponse.next()

  const { pathname } = req.nextUrl
  if (pathname === "/login" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next()
  }

  const bearer = req.headers.get("authorization")?.replace("Bearer ", "")
  const cookie = req.cookies.get("reader-auth")?.value
  if (bearer === password || cookie === password) return NextResponse.next()

  const isApi = pathname.startsWith("/api/")
  if (isApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.redirect(new URL("/login", req.url))
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico)$).*)"],
}
