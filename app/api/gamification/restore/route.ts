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

export async function POST() {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const progress =
    process.env.AUTH_DISABLED === "true"
      ? mockProgressStore.mockUserProgress ?? null
      : await prisma.userProgress.findUnique({ where: { userId } })
  if (!progress || !progress.streakBrokenDate || progress.treats < 1 || progress.streakBackup < 1) {
    return NextResponse.json({ error: "Cannot restore" }, { status: 400 })
  }

  if (process.env.AUTH_DISABLED === "true") {
    const updated = {
      ...progress,
      streakCount: progress.streakBackup,
      streakBackup: 0,
      streakBrokenDate: null,
      treats: progress.treats - 1,
    }
    mockProgressStore.mockUserProgress = updated
    return NextResponse.json({ progress: updated })
  }

  const updated = await prisma.userProgress.update({
    where: { userId },
    data: {
      streakCount: progress.streakBackup,
      streakBackup: 0,
      streakBrokenDate: null,
      treats: progress.treats - 1,
    },
  })

  return NextResponse.json({ progress: updated })
}
