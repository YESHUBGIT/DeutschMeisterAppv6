import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

const mockProgressStore = globalThis as typeof globalThis & {
  mockUserProgress?: {
    totalXp: number
    dailyXp: number
    dailyGoal: number
    streakCount: number
    streakBackup: number
    streakBrokenDate: string | null
    lastActiveDate: string | null
    lastStreakDate: string | null
    timezone: string
    treats: number
    placementLevel?: string | null
    placementSource?: string | null
    placementScore?: number | null
    placementCompletedAt?: string | null
  }
}

const getUserId = async () => {
  if (process.env.AUTH_DISABLED === "true") {
    return "local"
  }
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return null
  const user = await prisma.user.findUnique({ where: { email } })
  return user?.id ?? null
}

const ensureMockProgress = () => {
  if (!mockProgressStore.mockUserProgress) {
    mockProgressStore.mockUserProgress = {
      totalXp: 0,
      dailyXp: 0,
      dailyGoal: 50,
      streakCount: 0,
      streakBackup: 0,
      streakBrokenDate: null,
      lastActiveDate: null,
      lastStreakDate: null,
      timezone: "UTC",
      treats: 0,
      placementLevel: null,
      placementSource: null,
      placementScore: null,
      placementCompletedAt: null,
    }
  }
  return mockProgressStore.mockUserProgress
}

type PlacementRecord = {
  placementLevel: string | null
  placementSource: string | null
  placementScore: number | null
  placementCompletedAt: Date | null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (process.env.AUTH_DISABLED === "true") {
    const progress = ensureMockProgress()
    return NextResponse.json({
      placementLevel: progress.placementLevel ?? null,
      placementSource: progress.placementSource ?? null,
      placementScore: progress.placementScore ?? null,
      placementCompletedAt: progress.placementCompletedAt ?? null,
    })
  }

  const progress = await prisma.userProgress.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })

  const progressWithPlacement = progress as typeof progress & PlacementRecord

  return NextResponse.json({
    placementLevel: progressWithPlacement.placementLevel ?? null,
    placementSource: progressWithPlacement.placementSource ?? null,
    placementScore: progressWithPlacement.placementScore ?? null,
    placementCompletedAt: progressWithPlacement.placementCompletedAt ?? null,
  })
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const placementLevel = body?.placementLevel ? String(body.placementLevel) : null
  const placementSource = body?.placementSource ? String(body.placementSource) : null
  const placementScore = Number.isFinite(body?.placementScore) ? Number(body.placementScore) : null
  const placementCompletedAt = new Date()

  if (!placementLevel || !placementSource) {
    return NextResponse.json({ error: "Invalid placement" }, { status: 400 })
  }

  if (process.env.AUTH_DISABLED === "true") {
    const progress = ensureMockProgress()
    progress.placementLevel = placementLevel
    progress.placementSource = placementSource
    progress.placementScore = placementScore
    progress.placementCompletedAt = placementCompletedAt.toISOString()
    return NextResponse.json({
      placementLevel: progress.placementLevel,
      placementSource: progress.placementSource,
      placementScore: progress.placementScore,
      placementCompletedAt: progress.placementCompletedAt,
    })
  }

  const updateData: any = {
    placementLevel,
    placementSource,
    placementScore,
    placementCompletedAt,
  }

  const createData: any = {
    userId,
    placementLevel,
    placementSource,
    placementScore,
    placementCompletedAt,
  }

  const progress = await prisma.userProgress.upsert({
    where: { userId },
    update: updateData,
    create: createData,
  })

  const progressWithPlacement = progress as typeof progress & PlacementRecord

  return NextResponse.json({
    placementLevel: progressWithPlacement.placementLevel ?? null,
    placementSource: progressWithPlacement.placementSource ?? null,
    placementScore: progressWithPlacement.placementScore ?? null,
    placementCompletedAt: progressWithPlacement.placementCompletedAt ?? null,
  })
}
