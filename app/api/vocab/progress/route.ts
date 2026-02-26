import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

type ProgressEntry = {
  wordId: number
  status: string
  starred: boolean
}

const mockVocabStore = globalThis as typeof globalThis & {
  mockVocabEntries?: ProgressEntry[]
}

const getUserId = async () => {
  if (process.env.AUTH_DISABLED === "true") return "local"
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return null
  const user = await prisma.user.findUnique({ where: { email } })
  return user?.id ?? null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (process.env.AUTH_DISABLED === "true") {
    return NextResponse.json({ entries: mockVocabStore.mockVocabEntries ?? [] })
  }
  const entries = await prisma.vocabProgress.findMany({
    where: { userId },
    select: { wordId: true, status: true, starred: true },
  })
  return NextResponse.json({ entries })
}

export async function PUT(request: Request) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await request.json()
  const entries: ProgressEntry[] = Array.isArray(body.entries) ? body.entries : []

  if (process.env.AUTH_DISABLED === "true") {
    mockVocabStore.mockVocabEntries = entries
    return NextResponse.json({ ok: true })
  }

  const wordIds = entries.map(entry => entry.wordId)
  await prisma.$transaction([
    prisma.vocabProgress.deleteMany({
      where: {
        userId,
        ...(wordIds.length ? { wordId: { notIn: wordIds } } : {}),
      },
    }),
    ...entries.map(entry =>
      prisma.vocabProgress.upsert({
        where: {
          userId_wordId: { userId, wordId: entry.wordId },
        },
        create: {
          userId,
          wordId: entry.wordId,
          status: entry.status,
          starred: entry.starred,
        },
        update: {
          status: entry.status,
          starred: entry.starred,
        },
      })
    ),
  ])
  return NextResponse.json({ ok: true })
}
