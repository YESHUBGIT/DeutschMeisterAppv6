import NextAuth from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/auth"

/*
 * When AUTH_DISABLED=true we return mock JSON for ALL NextAuth endpoints
 * so the client-side SessionProvider gets valid data without ever importing
 * Prisma or the real NextAuth handler.
 *
 * Turbopack evaluates ALL top-level imports at bundle time, so we cannot
 * import auth.ts or next-auth here -- we must conditionally require them.
 */

const AUTH_DISABLED = process.env.AUTH_DISABLED === "true"

const MOCK_SESSION = {
  user: { name: "Local User", email: "local@deutschmeister.app" },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
}

function mockResponse(req: Request) {
  const url = new URL(req.url)
  const slug = url.pathname.split("/api/auth/").pop() ?? ""

  if (slug.startsWith("session")) {
    return NextResponse.json(MOCK_SESSION)
  }
  if (slug.startsWith("csrf")) {
    return NextResponse.json({ csrfToken: "mock-csrf-token" })
  }
  if (slug.startsWith("providers")) {
    return NextResponse.json({})
  }
  // For all other auth endpoints (signin, signout, callback, etc.)
  return NextResponse.json({ ok: true })
}

const handler = NextAuth(authOptions)

export function GET(req: Request, ctx: unknown) {
  if (AUTH_DISABLED) return mockResponse(req)
  return (handler as (req: Request, ctx: unknown) => unknown)(req, ctx)
}

export function POST(req: Request, ctx: unknown) {
  if (AUTH_DISABLED) return mockResponse(req)
  return (handler as (req: Request, ctx: unknown) => unknown)(req, ctx)
}
