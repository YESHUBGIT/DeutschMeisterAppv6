"use client"

import { useMemo, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Check, X, RotateCcw, Trophy, ChevronRight, ChevronLeft,
  Brain, Target, Zap, BookOpen, Shuffle, Volume2, Flame, ListFilter,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllPracticeExercises, getLessonNames, type LessonOptions, type PracticeExercise } from "@/lib/lesson-content"
import { playSound } from "@/lib/sound"

/* ═══════════════════════════════════════
   Practice Tab
   ═══════════════════════════════════════ */

type ExerciseCategory = "all" | "multiple-choice" | "fill-blank" | "reorder" | "translation"
type PracticeMode = "browse" | "session" | "complete"

const CATEGORIES: { id: ExerciseCategory; label: string; icon: typeof Brain; color: string }[] = [
  { id: "all",             label: "All Types",   icon: Shuffle,  color: "text-primary" },
  { id: "multiple-choice", label: "Quiz",        icon: Zap,      color: "text-amber-400" },
  { id: "fill-blank",      label: "Fill Blank",  icon: Target,   color: "text-emerald-400" },
  { id: "reorder",         label: "Word Order",  icon: BookOpen,  color: "text-cyan-400" },
  { id: "translation",     label: "Translate",   icon: Brain,    color: "text-purple-400" },
]

/* ── Helpers ── */
function speakDE(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = "de-DE"; u.rate = 0.85
  const de = window.speechSynthesis.getVoices().find(v => v.lang.startsWith("de"))
  if (de) u.voice = de
  window.speechSynthesis.speak(u)
}

function normalizeAnswer(s: string): string {
  return s.toLowerCase().replace(/\s+([?!.,;:])/g, "$1").replace(/\s+/g, " ").trim()
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

interface TrainTabProps {
  selectedLesson?: string
  onLessonChange?: (lessonId: string) => void
  lessonOptions?: LessonOptions
}

export function TrainTab({ selectedLesson, onLessonChange, lessonOptions }: TrainTabProps) {
  const [mode, setMode] = useState<PracticeMode>("browse")
  const [category, setCategory] = useState<ExerciseCategory>("all")
  const [lessonFilter, setLessonFilter] = useState(selectedLesson ?? "all")
  const [sessionExercises, setSessionExercises] = useState<PracticeExercise[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [reorderPicked, setReorderPicked] = useState<string[]>([])
  const [reorderPool, setReorderPool] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [showHint, setShowHint] = useState(false)

  const activeLessonFilter = selectedLesson ?? lessonFilter

  const allExercises = useMemo(
    () => getAllPracticeExercises(lessonOptions),
    [lessonOptions]
  )
  const lessonNames = useMemo(
    () => getLessonNames(lessonOptions),
    [lessonOptions]
  )

  /* counts by lesson */
  const lessonCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const ex of allExercises) m[ex.lessonId] = (m[ex.lessonId] ?? 0) + 1
    return m
  }, [allExercises])

  /* counts by category for active lesson filter */
  const catCounts = useMemo(() => {
    const base = activeLessonFilter === "all" ? allExercises : allExercises.filter(e => e.lessonId === activeLessonFilter)
    const c: Record<string, number> = { all: base.length }
    for (const cat of CATEGORIES) if (cat.id !== "all") c[cat.id] = base.filter(e => e.kind === cat.id).length
    return c
  }, [allExercises, activeLessonFilter])

  const currentExercise: PracticeExercise | undefined = sessionExercises[currentIdx]

  /* ── Start session ── */
  const startSession = useCallback((cat: ExerciseCategory, lesson: string) => {
    let pool = allExercises
    if (lesson !== "all") pool = pool.filter(e => e.lessonId === lesson)
    if (cat !== "all") pool = pool.filter(e => e.kind === cat)
    const shuffled = shuffleArray(pool)
    setSessionExercises(shuffled)
    setCategory(cat)
    setCurrentIdx(0)
    setScore({ correct: 0, total: 0 })
    setUserAnswer("")
    setSelectedOption(null)
    setShowResult(false)
    setShowHint(false)
    if (shuffled[0]?.kind === "reorder" && shuffled[0].words) {
      setReorderPool(shuffleArray(shuffled[0].words))
      setReorderPicked([])
    }
    setMode("session")
  }, [allExercises])

  const handleLessonPick = useCallback((id: string) => {
    setLessonFilter(id)
    if (onLessonChange) onLessonChange(id)
  }, [onLessonChange])

  const backToBrowse = useCallback(() => {
    setMode("browse")
    setSessionExercises([])
  }, [])

  /* ── Check answer ── */
  const checkAnswer = useCallback(() => {
    if (!currentExercise) return
    let correct = false
    if (currentExercise.kind === "translation") {
      correct = normalizeAnswer(userAnswer) === normalizeAnswer(currentExercise.answer)
    } else if (currentExercise.kind === "reorder") {
      correct = normalizeAnswer(reorderPicked.join(" ")) === normalizeAnswer(currentExercise.answer)
    } else {
      correct = selectedOption === currentExercise.answer
    }
    setIsCorrect(correct)
    setShowResult(true)
    setScore(p => ({ correct: correct ? p.correct + 1 : p.correct, total: p.total + 1 }))
    playSound(correct ? "correct" : "sad")
  }, [currentExercise, userAnswer, reorderPicked, selectedOption])

  /* ── Next exercise ── */
  const nextExercise = useCallback(() => {
    const next = currentIdx + 1
    if (next >= sessionExercises.length) {
      setMode("complete")
      playSound("complete")
      return
    }
    setCurrentIdx(next)
    setUserAnswer("")
    setSelectedOption(null)
    setShowResult(false)
    setShowHint(false)
    const nex = sessionExercises[next]
    if (nex?.kind === "reorder" && nex.words) {
      setReorderPool(shuffleArray(nex.words))
      setReorderPicked([])
    }
  }, [currentIdx, sessionExercises])

  /* ═══════════════ BROWSE MODE ═══════════════ */
  if (mode === "browse") {
    return (
      <div className="space-y-5 pb-6">
        {/* Header */}
        <div className="text-center space-y-1 py-3">
          <h1 className="text-2xl font-bold text-foreground">Practice</h1>
          <p className="text-sm text-muted-foreground">{allExercises.length} exercises across {lessonNames.length} lessons</p>
        </div>

        {/* Quick Mix */}
        <motion.button
          whileTap={{ scale: 0.97 }}
    onClick={() => startSession("all", activeLessonFilter)}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-base font-bold text-foreground">Quick Mix</p>
            <p className="text-xs text-muted-foreground">
              Random exercises {activeLessonFilter !== "all" ? "from this lesson" : "from all lessons"}
              {" \u2022 "}{catCounts.all ?? 0} available
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-primary shrink-0" />
        </motion.button>

        {/* Lesson Filter Dropdown */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ListFilter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filter by Lesson</span>
          </div>
          <select
            value={activeLessonFilter}
            onChange={(e) => handleLessonPick(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-sm font-medium text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
          >
            <option value="all">All Lessons ({allExercises.length})</option>
            {lessonNames.map(ln => (
              <option key={ln.id} value={ln.id}>
                {ln.title} ({lessonCounts[ln.id] ?? 0})
              </option>
            ))}
          </select>
        </div>

        {/* Category Cards */}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">By Type</p>
          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIES.filter(c => c.id !== "all").map(cat => {
              const Icon = cat.icon
              const count = catCounts[cat.id] ?? 0
              return (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => count > 0 && startSession(cat.id, activeLessonFilter)}
                  disabled={count === 0}
                  className={cn(
                    "p-3.5 rounded-xl border text-left transition-all",
                    count > 0
                      ? "bg-card border-border hover:border-primary/40 cursor-pointer"
                      : "bg-card/40 border-border/40 opacity-40 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Icon className={cn("w-4.5 h-4.5", cat.color)} />
                    <span className="text-sm font-bold text-foreground">{cat.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{count} exercises</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════ COMPLETE MODE ═══════════════ */
  if (mode === "complete") {
    const pct = sessionExercises.length > 0 ? Math.round((score.correct / sessionExercises.length) * 100) : 0
    const great = pct >= 70
    return (
      <div className="space-y-6 py-6">
        <motion.div
          className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
          initial={{ scale: 0.4, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Trophy className={cn("w-10 h-10", great ? "text-primary" : "text-accent")} />
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">Practice Complete!</h2>
          <motion.p
            className={cn("text-4xl font-black tabular-nums", great ? "text-success" : "text-accent")}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.15 }}
          >
            {pct}%
          </motion.p>
          <p className="text-sm text-muted-foreground">{score.correct} of {sessionExercises.length} correct</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" onClick={backToBrowse}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
                <Button className="flex-1 rounded-xl font-bold" onClick={() => startSession(category, activeLessonFilter)}>
            <RotateCcw className="w-4 h-4 mr-1" /> Retry
          </Button>
        </div>
      </div>
    )
  }

  /* ═══════════════ SESSION MODE ═══════════════ */
  if (!currentExercise) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-lg font-bold text-foreground">No exercises found</p>
        <p className="text-sm text-muted-foreground">Try a different filter.</p>
        <Button variant="outline" onClick={backToBrowse} className="rounded-xl">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>
    )
  }

  const progress = ((currentIdx + 1) / sessionExercises.length) * 100

  return (
    <div className="space-y-4">
      {/* Session header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={backToBrowse} className="text-muted-foreground -ml-2">
          <ChevronLeft className="w-4 h-4 mr-0.5" /> Exit
        </Button>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {currentIdx + 1} / {sessionExercises.length}
        </span>
      </div>

      {/* Progress */}
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        />
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
          {currentExercise.lessonTitle}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
          {currentExercise.kind.replace("-", " ")}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`ex-${currentIdx}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.18 }}
          className="space-y-4"
        >
          {/* Prompt card */}
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-start justify-between gap-2">
              <p className="text-base font-semibold text-foreground leading-relaxed flex-1">{currentExercise.prompt}</p>
              <button onClick={() => speakDE(currentExercise.answer)} className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            {showHint && currentExercise.explanation && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 text-xs text-muted-foreground italic border-t border-border pt-2">
                {currentExercise.explanation}
              </motion.p>
            )}
          </div>

          {/* ── Multiple Choice / Fill Blank ── */}
          {(currentExercise.kind === "multiple-choice" || currentExercise.kind === "fill-blank") && currentExercise.options && (
            <div className="grid grid-cols-1 gap-2">
              {currentExercise.options.map(opt => (
                <motion.button
                  key={opt}
                  whileTap={{ scale: 0.97 }}
                  disabled={showResult}
                  onClick={() => !showResult && setSelectedOption(opt)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                    !showResult && selectedOption === opt
                      ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                      : !showResult
                        ? "border-border bg-card text-foreground hover:border-primary/40"
                        : opt === currentExercise.answer
                          ? "border-success bg-success/10 text-success"
                          : selectedOption === opt
                            ? "border-destructive bg-destructive/10 text-destructive"
                            : "border-border bg-card text-muted-foreground"
                  )}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          )}

          {/* ── Translation ── */}
          {currentExercise.kind === "translation" && (
            <Input
              autoFocus
              placeholder="Type your translation..."
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={e => e.key === "Enter" && userAnswer.trim() && !showResult && checkAnswer()}
              disabled={showResult}
              className="rounded-xl text-base py-3 bg-card border-border"
            />
          )}

          {/* ── Reorder ── */}
          {currentExercise.kind === "reorder" && (
            <div className="space-y-3">
              <div className="min-h-[52px] p-3 rounded-xl border-2 border-dashed border-border bg-card/50 flex flex-wrap gap-2 items-center">
                {reorderPicked.length === 0 && (
                  <span className="text-xs text-muted-foreground">Tap words to build the sentence</span>
                )}
                {reorderPicked.map((w, i) => (
                  <motion.button
                    key={`p-${i}-${w}`}
                    layout
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (showResult) return
                      setReorderPicked(p => p.filter((_, idx) => idx !== i))
                      setReorderPool(p => [...p, w])
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm"
                  >
                    {w}
                  </motion.button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {reorderPool.map((w, i) => (
                  <motion.button
                    key={`r-${i}-${w}`}
                    layout
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (showResult) return
                      setReorderPool(p => p.filter((_, idx) => idx !== i))
                      setReorderPicked(p => [...p, w])
                    }}
                    className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-sm font-medium border border-border hover:border-primary/50 transition-colors"
                  >
                    {w}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* ── Feedback ── */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-3 rounded-xl flex items-start gap-3",
                isCorrect ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                isCorrect ? "bg-success text-background" : "bg-destructive text-background"
              )}>
                {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </div>
              <div className="space-y-1 min-w-0">
                <p className={cn("text-sm font-bold", isCorrect ? "text-success" : "text-destructive")}>
                  {isCorrect ? "Richtig!" : "Not quite"}
                </p>
                {!isCorrect && (
                  <p className="text-xs text-muted-foreground">
                    Correct: <strong className="text-foreground">{currentExercise.answer}</strong>
                  </p>
                )}
                {currentExercise.explanation && (
                  <p className="text-xs text-muted-foreground italic">{currentExercise.explanation}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Actions ── */}
          <div className="flex gap-2 pt-1">
            {!showResult && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setShowHint(h => !h)} className="text-xs text-muted-foreground">
                  {showHint ? "Hide hint" : "Hint"}
                </Button>
                <Button
                  onClick={checkAnswer}
                  disabled={
                    currentExercise.kind === "translation" ? !userAnswer.trim()
                    : currentExercise.kind === "reorder" ? reorderPicked.length === 0
                    : !selectedOption
                  }
                  className="flex-1 rounded-xl font-bold"
                >
                  Check
                </Button>
              </>
            )}
            {showResult && (
              <Button onClick={nextExercise} className="flex-1 rounded-xl font-bold">
                {currentIdx >= sessionExercises.length - 1 ? "See Results" : "Next"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
