"use client"

import { useRef, useEffect, useMemo, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Lock, CircleCheck, Zap } from "lucide-react"
import {
  buildPersonalizedCatalog,
  isLessonUnlocked,
  type LessonCatalogItem,
  type Phase,
} from "@/lib/lesson-catalog"
import { IgelMascot } from "@/components/igel/igel-mascot"
import type { LearnerProfile } from "@/lib/use-learner-profile"
import { cn } from "@/lib/utils"

/* ── Phase banner config ── */
const PHASE_META: Record<Phase, { label: string; sub: string; accent: string }> = {
  1: { label: "Quick Wins", sub: "Build confidence with essentials", accent: "bg-primary/10 text-primary border-primary/20" },
  2: { label: "Structured Growth", sub: "Expand grammar & vocabulary", accent: "bg-accent/10 text-accent border-accent/20" },
  3: { label: "Mastery", sub: "Nuance, fluency & precision", accent: "bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/20" },
}

/* ── Props ── */
interface PathwayProps {
  completedLessons: string[]
  onStartLesson: (lessonId: string) => void
  onPracticeLesson: (lessonId: string) => void
  profile: LearnerProfile
}

type NodeStatus = "completed" | "current" | "locked"

export function Pathway({ completedLessons, onStartLesson, onPracticeLesson, profile }: PathwayProps) {
  const catalog = useMemo(() => buildPersonalizedCatalog(profile.purpose), [profile.purpose])
  const completedSet = useMemo(() => new Set(completedLessons), [completedLessons])
  const currentNodeRef = useRef<HTMLDivElement>(null)
  const [tappedLocked, setTappedLocked] = useState<string | null>(null)

  const getStatus = useCallback((lesson: LessonCatalogItem): NodeStatus => {
    if (completedSet.has(lesson.id)) return "completed"
    if (isLessonUnlocked(lesson, completedSet)) return "current"
    return "locked"
  }, [completedSet])

  /* Find the first "current" lesson for auto-scroll */
  const firstCurrentId = useMemo(() => {
    return catalog.find((l) => getStatus(l) === "current")?.id ?? null
  }, [catalog, getStatus])

  useEffect(() => {
    const timer = setTimeout(() => {
      currentNodeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleLockedTap = useCallback((id: string) => {
    setTappedLocked(id)
    setTimeout(() => setTappedLocked(null), 1200)
  }, [])

  /* Group by phase */
  const phases = useMemo(() => {
    const map = new Map<Phase, LessonCatalogItem[]>()
    for (const lesson of catalog) {
      if (!map.has(lesson.phase)) map.set(lesson.phase, [])
      map.get(lesson.phase)!.push(lesson)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b)
  }, [catalog])

  const allDone = catalog.every((l) => completedSet.has(l.id))

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-10">
      {/* Personalized header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-lg font-bold text-foreground">Your Path</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {catalog.length} lessons tailored for{" "}
          <span className="text-primary font-semibold">
            {profile.purpose ?? "general learning"}
          </span>
        </p>
      </motion.div>

      {phases.map(([phase, lessons], phaseIdx) => {
        const meta = PHASE_META[phase]
        return (
          <div key={phase} className="mb-6">
            {/* Phase banner */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: phaseIdx * 0.1 }}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl border mb-4",
                meta.accent
              )}
            >
              <Zap className="w-4 h-4 shrink-0" />
              <div>
                <p className="text-xs font-bold">Phase {phase}: {meta.label}</p>
                <p className="text-[10px] opacity-70">{meta.sub}</p>
              </div>
            </motion.div>

            {/* Timeline */}
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />

              {lessons.map((lesson, i) => {
                const status = getStatus(lesson)
                const isCurrent = lesson.id === firstCurrentId
                const isCompleted = status === "completed"
                const isLocked = status === "locked"

                return (
                  <motion.div
                    key={lesson.id}
                    ref={isCurrent ? currentNodeRef : undefined}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: phaseIdx * 0.08 + i * 0.04 }}
                    className="relative mb-3 last:mb-0"
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute -left-8 top-3.5 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center z-10",
                      isCompleted && "bg-success border-success",
                      isCurrent && "bg-primary border-primary animate-node-pulse",
                      isLocked && "bg-secondary border-border"
                    )}>
                      {isCompleted && <CircleCheck className="w-3 h-3 text-success-foreground" />}
                      {isCurrent && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                      {isLocked && <Lock className="w-2.5 h-2.5 text-muted-foreground" />}
                    </div>

                    {/* Card */}
                    <button
                      onClick={() => {
                        if (isCompleted) onStartLesson(lesson.id)
                        else if (isCurrent) onStartLesson(lesson.id)
                        else handleLockedTap(lesson.id)
                      }}
                      className={cn(
                        "w-full text-left p-3.5 rounded-xl border transition-all",
                        isCompleted && "bg-card border-success/20 hover:border-success/40",
                        isCurrent && "bg-card border-primary/30 hover:border-primary/60 shadow-lg shadow-primary/5",
                        isLocked && "bg-secondary/40 border-border/50 opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={cn(
                              "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                              isCompleted ? "bg-success/15 text-success" :
                              isCurrent ? "bg-primary/15 text-primary" :
                              "bg-secondary text-muted-foreground"
                            )}>
                              {lesson.cefr.toUpperCase()}
                            </span>
                            {lesson.contexts !== "all" && (
                              <span className="text-[9px] font-medium text-accent">
                                {profile.purpose}
                              </span>
                            )}
                          </div>
                          <p className={cn(
                            "text-sm font-semibold leading-tight",
                            isLocked ? "text-muted-foreground" : "text-foreground"
                          )}>
                            {lesson.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                            {lesson.grammarFocus}
                          </p>
                        </div>
                        {isCurrent && (
                          <div className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                            Go
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {isCompleted && (
                          <ChevronRight className="w-4 h-4 text-success shrink-0 mt-1" />
                        )}
                      </div>
                    </button>

                    {/* Igel peeking on current */}
                    {isCurrent && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="absolute -left-[52px] top-0"
                      >
                        <IgelMascot mood="happy" size={24} breathing />
                      </motion.div>
                    )}

                    {/* Locked tooltip */}
                    <AnimatePresence>
                      {tappedLocked === lesson.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute -top-8 left-0 bg-card border border-border text-[10px] font-medium text-muted-foreground px-3 py-1.5 rounded-lg shadow-lg z-20"
                        >
                          Complete prerequisites first
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* All done */}
      {allDone && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="flex flex-col items-center gap-3 mt-8 p-6 rounded-2xl bg-card border border-success/20"
        >
          <IgelMascot mood="celebrate" size={72} breathing />
          <p className="text-lg font-bold text-foreground text-center">Path Complete</p>
          <p className="text-sm text-muted-foreground text-center">
            Keep practicing to build fluency.
          </p>
        </motion.div>
      )}
    </div>
  )
}
