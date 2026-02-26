import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"
import { withAuth } from "next-auth/middleware"

const authMiddleware = withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (process.env.AUTH_DISABLED === "true") {
    return NextResponse.next()
  }

  return authMiddleware(req as never, event)
}

export const config = {
  matcher: ["/((?!api/auth|api/tutor/config|_next/static|_next/image|favicon.ico|icon.*|apple-icon|igel|auth/signin).*)"],
}
