import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

const getDateKey = (date: Date, timeZone: string) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

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

export async function GET() {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (process.env.AUTH_DISABLED === "true") {
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
    return NextResponse.json({ progress: mockProgressStore.mockUserProgress })
  }
  const progress = await prisma.userProgress.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })
  return NextResponse.json({ progress })
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const xp = Math.max(0, Number(body.xp ?? 0))
  const activityType = String(body.activityType ?? "LESSON")
  const lessonId = body.lessonId ? String(body.lessonId) : null
  const timeZone = String(body.timezone ?? "UTC")

  const todayKey = getDateKey(new Date(), timeZone)
  const yesterdayKey = getDateKey(new Date(Date.now() - 86400000), timeZone)

  let progress =
    process.env.AUTH_DISABLED === "true"
      ? (mockProgressStore.mockUserProgress ?? {
          totalXp: 0,
          dailyXp: 0,
          dailyGoal: 50,
          streakCount: 0,
          streakBackup: 0,
          streakBrokenDate: null,
          lastActiveDate: null,
          lastStreakDate: null,
          timezone: timeZone,
          treats: 0,
          placementLevel: null,
          placementSource: null,
          placementScore: null,
          placementCompletedAt: null,
        })
      : await prisma.userProgress.upsert({
          where: { userId },
          update: { timezone: timeZone },
          create: { userId, timezone: timeZone },
        })

  let dailyXp = progress.dailyXp
  let streakCount = progress.streakCount
  let streakBackup = progress.streakBackup
  let streakBrokenDate = progress.streakBrokenDate
  let lastActiveDate = progress.lastActiveDate
  let lastStreakDate = progress.lastStreakDate

  if (lastActiveDate !== todayKey) {
    if (lastActiveDate && lastActiveDate !== yesterdayKey && progress.dailyXp < progress.dailyGoal) {
      streakBackup = progress.streakCount
      streakCount = 0
      streakBrokenDate = todayKey
    }
    dailyXp = 0
  }

  const nextDailyXp = dailyXp + xp
  const nextTotalXp = progress.totalXp + xp

  const beforeTreats = Math.floor(progress.totalXp / 200)
  const afterTreats = Math.floor(nextTotalXp / 200)
  const treatsEarned = Math.max(0, afterTreats - beforeTreats)
  const nextTreats = progress.treats + treatsEarned

  if (nextDailyXp >= progress.dailyGoal && lastStreakDate !== todayKey) {
    streakCount += 1
    lastStreakDate = todayKey
    if (streakBrokenDate === todayKey) {
      streakBrokenDate = null
      streakBackup = 0
    }
  }

  if (streakBrokenDate && nextDailyXp >= progress.dailyGoal * 2 && streakBackup > 0) {
    streakCount = streakBackup + 1
    streakBackup = 0
    streakBrokenDate = null
    lastStreakDate = todayKey
  }

  if (process.env.AUTH_DISABLED === "true") {
    const placementLevel = "placementLevel" in progress ? progress.placementLevel ?? null : null
    const placementSource = "placementSource" in progress ? progress.placementSource ?? null : null
    const placementScore = "placementScore" in progress ? progress.placementScore ?? null : null
    const placementCompletedAt = "placementCompletedAt" in progress ? progress.placementCompletedAt ?? null : null
    mockProgressStore.mockUserProgress = {
      totalXp: nextTotalXp,
      dailyXp: nextDailyXp,
      dailyGoal: progress.dailyGoal,
      streakCount,
      streakBackup,
      streakBrokenDate,
      lastActiveDate: todayKey,
      lastStreakDate,
      timezone: timeZone,
      treats: nextTreats,
      placementLevel,
      placementSource,
      placementScore,
      placementCompletedAt,
    }
    return NextResponse.json({ progress: mockProgressStore.mockUserProgress })
  }

  progress = await prisma.userProgress.update({
    where: { userId },
    data: {
      totalXp: nextTotalXp,
      dailyXp: nextDailyXp,
      streakCount,
      streakBackup,
      streakBrokenDate,
      lastActiveDate: todayKey,
      lastStreakDate,
      timezone: timeZone,
      treats: nextTreats,
    },
  })

  await prisma.activityLog.create({
    data: {
      userId,
      activityType,
      xpEarned: xp,
      lessonId,
    },
  })

  return NextResponse.json({ progress })
}
