"use client"

import { motion } from "framer-motion"
import { Flame, BookOpen } from "lucide-react"

interface TopBarProps {
  completedCount: number
  totalLessons: number
  overallProgress: number
  currentModule: string
  activeDays: number
}

export function TopBar({ completedCount, totalLessons, overallProgress, currentModule, activeDays }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 glass-card pt-safe">
      <div className="flex items-center gap-3 px-4 py-2.5 max-w-lg mx-auto">
        {/* Brand mark */}
        <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>

        {/* Progress bar + module label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-foreground truncate">{currentModule}</span>
            <span className="text-[10px] font-medium text-muted-foreground tabular-nums shrink-0 ml-2">
              {completedCount}/{totalLessons}
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(2, overallProgress * 100)}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 18 }}
            />
          </div>
        </div>

        {/* Streak counter */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10">
            <Flame className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-bold text-accent tabular-nums">{activeDays}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
