import { SignJWT } from "jose"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const authDisabled = process.env.AUTH_DISABLED === "true"

  if (!session && !authDisabled) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiUrl = process.env.TUTOR_API_URL
  if (!apiUrl) {
    return NextResponse.json({ error: "Missing TUTOR_API_URL" }, { status: 500 })
  }

  const secret = process.env.TUTOR_JWT_SECRET
  if (!secret) {
    return NextResponse.json({ error: "Missing TUTOR_JWT_SECRET" }, { status: 500 })
  }

  const body = await request.json()
  const systemMessage = {
    role: "system",
    content: "Explain in English, keep German terms and example sentences in German. Be friendly, natural, and concise. Ask one short follow-up question each turn.",
  }
  const payload = {
    ...body,
    messages: [systemMessage, ...(body.messages ?? [])],
  }
  const subject = session?.user?.email ?? session?.user?.name ?? "dev"
  const key = new TextEncoder().encode(secret)
  const token = await new SignJWT({ role: "student" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(subject)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key)

  const response = await fetch(`${apiUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const detail = await response.text()
    return NextResponse.json({ error: "Tutor API error", detail }, { status: 502 })
  }

  const data = await response.json()
  return NextResponse.json({ reply: data.reply })
}
