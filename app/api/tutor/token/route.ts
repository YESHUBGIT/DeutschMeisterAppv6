import { SignJWT } from "jose"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  const authDisabled = process.env.AUTH_DISABLED === "true"

  if (!session && !authDisabled) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const secret = process.env.TUTOR_JWT_SECRET
  if (!secret) {
    return NextResponse.json({ error: "Missing TUTOR_JWT_SECRET" }, { status: 500 })
  }

  const subject = session?.user?.email ?? session?.user?.name ?? "dev"
  const key = new TextEncoder().encode(secret)

  const token = await new SignJWT({ role: "student" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(subject)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key)

  return NextResponse.json({ token })
}
