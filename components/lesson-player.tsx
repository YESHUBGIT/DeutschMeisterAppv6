"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import {
  X, ChevronRight, BookOpen, MessageSquare, Dumbbell,
  Check, RotateCcw, Lightbulb, Volume2, ArrowLeft, Sparkles, Play
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IgelMascot } from "@/components/igel/igel-mascot"
import { playSound } from "@/lib/sound"
import { cn } from "@/lib/utils"
import type { LessonContent, Exercise, ExerciseKind, DialogueLine } from "@/lib/lesson-content"

/* ── TTS helper ── */
const FEMALE_NAMES = ["anna", "frau", "maria", "sarah", "lisa", "julia", "katharina", "emma", "lena"]
const CONFETTI_COLORS = ["#0EA5E9", "#84CC16", "#F59E0B", "#A78BFA", "#F43F5E"]
const CONFETTI_PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 300,
  y: -(Math.random() * 200 + 100),
  r: Math.random() * 360,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: Math.random() * 8 + 4,
  delay: Math.random() * 0.15,
}))

function speakGerman(text: string, speakerName?: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = "de-DE"
  utter.rate = 0.85
  utter.pitch = 1.0
  // Try to pick a voice matching gender
  const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith("de"))
  if (speakerName) {
    const isFemale = FEMALE_NAMES.some(n => speakerName.toLowerCase().includes(n))
    const genderVoice = voices.find(v =>
      isFemale ? v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("anna")
        : v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("hans")
    )
    if (genderVoice) utter.voice = genderVoice
    else if (voices.length > 0) {
      // fallback: first voice for even speakers, second for odd
      utter.voice = isFemale ? voices[0] : (voices[1] || voices[0])
    }
    if (isFemale) { utter.pitch = 1.15 } else { utter.pitch = 0.85 }
  } else if (voices.length > 0) {
    utter.voice = voices[0]
  }
  window.speechSynthesis.speak(utter)
}

// Pre-load voices on mount
function useVoicePreload() {
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.getVoices()
    const handler = () => window.speechSynthesis.getVoices()
    window.speechSynthesis.addEventListener("voiceschanged", handler)
    return () => window.speechSynthesis.removeEventListener("voiceschanged", handler)
  }, [])
}

/* ── Confetti particles ── */
function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null
  const particles = CONFETTI_PARTICLES
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, rotate: p.r, opacity: 0, scale: 0.3 }}
          transition={{ duration: 1.2, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

/* ── Speaker button ── */
function SpeakButton({ text, speaker, size = "sm" }: { text: string; speaker?: string; size?: "sm" | "md" }) {
  const [playing, setPlaying] = useState(false)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        setPlaying(true)
        speakGerman(text, speaker)
        setTimeout(() => setPlaying(false), 1500)
      }}
      className={cn(
        "shrink-0 rounded-full flex items-center justify-center transition-all",
        size === "sm" ? "w-7 h-7" : "w-9 h-9",
        playing ? "bg-primary text-primary-foreground scale-110" : "bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10"
      )}
      aria-label={`Play pronunciation${speaker ? ` for ${speaker}` : ""}`}
    >
      <Volume2 className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
    </button>
  )
}

/* ── Step types ── */
type LessonStep =
  | { kind: "intro" }
  | { kind: "grammar"; index: number }
  | { kind: "vocab" }
  | { kind: "dialogue" }
  | { kind: "exercise"; index: number }
  | { kind: "summary" }

interface LessonPlayerProps {
  content: LessonContent
  onComplete: (lessonId: string, score: number, total: number) => void
  onExit: () => void
  nextLessonId?: string | null
  onContinueNext?: (nextLessonId: string) => void
  debugContext?: {
    purpose?: string | null
    timeBudget?: string | null
    prioritySkill?: string | null
  }
}

export function LessonPlayer({
  content,
  onComplete,
  onExit,
  nextLessonId,
  onContinueNext,
  debugContext,
}: LessonPlayerProps) {
  useVoicePreload()
  const shakeControls = useAnimation()

  const steps = useMemo<LessonStep[]>(() => {
    const s: LessonStep[] = [{ kind: "intro" }]
    content.grammarPoints.forEach((_, i) => s.push({ kind: "grammar", index: i }))
    s.push({ kind: "vocab" })
    if (content.dialogue.length > 0) s.push({ kind: "dialogue" })
    content.exercises.forEach((_, i) => s.push({ kind: "exercise", index: i }))
    s.push({ kind: "summary" })
    return s
  }, [content])

  const [stepIdx, setStepIdx] = useState(0)
  const [direction, setDirection] = useState(1)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [typedAnswer, setTypedAnswer] = useState("")
  const [reorderPicked, setReorderPicked] = useState<string[]>([])
  const [reorderPool, setReorderPool] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [showConfetti, setShowConfetti] = useState(false)
  const [dialoguePlaying, setDialoguePlaying] = useState(false)

  const safeStepIdx = steps.length > 0 ? Math.min(Math.max(stepIdx, 0), steps.length - 1) : 0
  const currentStep = steps[safeStepIdx]
  const progress = steps.length > 0 ? (safeStepIdx + 1) / steps.length : 0
  const debugStepLabel = currentStep?.kind
    ? `${currentStep.kind}${currentStep.kind === "exercise" ? `:${(currentStep as { index: number }).index + 1}` : ""}`
    : "missing"
  const debugExercise = currentStep?.kind === "exercise"
    ? content.exercises[(currentStep as { index: number }).index]
    : null

  const getReorderWords = useCallback((step: LessonStep) => {
    if (step.kind !== "exercise") return null
    const ex = content.exercises[step.index]
    if (ex.kind === "reorder" && ex.words) return [...ex.words]
    return null
  }, [content.exercises])

  const resetForStep = useCallback((nextIdx: number, nextDirection: number) => {
    const step = steps[nextIdx]
    setDirection(nextDirection)
    setStepIdx(nextIdx)
    setSelectedOption(null)
    setTypedAnswer("")
    setReorderPicked([])
    const words = getReorderWords(step)
    setReorderPool(words ?? [])
    setShowResult(false)
    setIsCorrect(false)
    setShowHint(false)
  }, [getReorderWords, steps])

  useEffect(() => {
    resetForStep(0, 1)
    setScore({ correct: 0, total: 0 })
    setShowConfetti(false)
    setDialoguePlaying(false)
  }, [content.lessonId, resetForStep])

  const goNext = useCallback(() => {
    if (stepIdx >= steps.length - 1) return
    resetForStep(stepIdx + 1, 1)
  }, [stepIdx, steps.length, resetForStep])

  const goBack = useCallback(() => {
    if (stepIdx <= 0) return
    resetForStep(stepIdx - 1, -1)
  }, [stepIdx, resetForStep])

  /* ── Normalize answer for comparison ── */
  const normalizeAnswer = (s: string) =>
    s.toLowerCase().trim()
      .replace(/\s+([.,!?;:])/g, "$1")   // remove space before punctuation
      .replace(/([.,!?;:])\s*/g, "$1 ")   // ensure single space after punctuation
      .replace(/\s+/g, " ")
      .trim()

  const checkExerciseAnswer = useCallback((exercise: Exercise) => {
    if (exercise.kind === "production") {
      setIsCorrect(true)
      setShowResult(true)
      setScore(prev => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
      }))
      playSound("complete")
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1200)
      return
    }
    let correct = false
    if (exercise.kind === "translation") {
      correct = normalizeAnswer(typedAnswer) === normalizeAnswer(exercise.answer)
    } else if (exercise.kind === "reorder") {
      const userAnswer = normalizeAnswer(reorderPicked.join(" "))
      const correctAnswer = normalizeAnswer(exercise.answer)
      correct = userAnswer === correctAnswer
    } else {
      correct = selectedOption === exercise.answer
    }

    setIsCorrect(correct)
    setShowResult(true)
    setScore(prev => ({
      correct: correct ? prev.correct + 1 : prev.correct,
      total: prev.total + 1,
    }))

    if (correct) {
      playSound("correct")
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1500)
    } else {
      playSound("sad")
      shakeControls.start({
        x: [0, -8, 8, -6, 6, -3, 3, 0],
        transition: { duration: 0.5 },
      })
    }
  }, [selectedOption, typedAnswer, reorderPicked, shakeControls])

  const handleReorderTap = useCallback((word: string, fromPicked: boolean) => {
    if (showResult) return
    if (fromPicked) {
      // Move from picked back to pool
      const idx = reorderPicked.indexOf(word)
      if (idx === -1) return
      setReorderPicked(prev => { const n = [...prev]; n.splice(idx, 1); return n })
      setReorderPool(prev => [...prev, word])
    } else {
      // Move from pool to picked
      const idx = reorderPool.indexOf(word)
      if (idx === -1) return
      setReorderPool(prev => { const n = [...prev]; n.splice(idx, 1); return n })
      setReorderPicked(prev => [...prev, word])
    }
  }, [showResult, reorderPicked, reorderPool])

  const playDialogueSequence = useCallback(async () => {
    if (dialoguePlaying) return
    setDialoguePlaying(true)
    for (const line of content.dialogue) {
      speakGerman(line.german, line.speaker)
      await new Promise(r => setTimeout(r, 2200))
    }
    setDialoguePlaying(false)
  }, [content.dialogue, dialoguePlaying])

  const slideVars = {
    enter: (d: number) => ({ x: d > 0 ? "30%" : "-30%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-15%" : "15%", opacity: 0 }),
  }

  /* ── Render Exercise ── */
  function renderExercise(exercise: Exercise) {
    const renderOptions = (kind: ExerciseKind) => {
      if (kind === "production") {
        return (
          <div className="space-y-3">
            <textarea
              value={typedAnswer}
              onChange={e => setTypedAnswer(e.target.value)}
              placeholder={exercise.mode === "speaking"
                ? "Speak aloud first, then jot notes (optional)..."
                : "Write your response here..."}
              className="min-h-[110px] w-full rounded-xl bg-secondary border border-border text-foreground text-sm p-3"
            />
            {exercise.mode === "speaking" && (
              <p className="text-xs text-muted-foreground text-center">
                Speak for 20-45 seconds, then press Check.
              </p>
            )}
          </div>
        )
      }
      if (kind === "translation") {
        return (
          <div className="space-y-3">
            <Input
              value={typedAnswer}
              onChange={e => setTypedAnswer(e.target.value)}
              placeholder="Type your answer in German..."
              disabled={showResult}
              className="bg-secondary border-border text-foreground text-center text-base py-3"
              onKeyDown={e => {
                if (e.key === "Enter" && typedAnswer.trim()) checkExerciseAnswer(exercise)
              }}
            />
          </div>
        )
      }

      if (kind === "reorder") {
        return (
          <div className="space-y-4">
            {/* Picked words area */}
            <div className="min-h-[52px] p-3 rounded-xl bg-secondary/50 border-2 border-dashed border-border flex flex-wrap gap-2 items-start">
              {reorderPicked.length === 0 && (
                <span className="text-muted-foreground text-sm">Tap words below to build the sentence...</span>
              )}
              {reorderPicked.map((w, i) => (
                <motion.button
                  key={`picked-${i}`}
                  initial={{ scale: 0.8, y: 8 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => handleReorderTap(w, true)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-md active:scale-95 transition-transform"
                >
                  {w}
                </motion.button>
              ))}
            </div>
            {/* Available words pool */}
            <div className="flex flex-wrap gap-2 justify-center">
              {reorderPool.map((w, i) => (
                <motion.button
                  key={`pool-${i}`}
                  layout
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleReorderTap(w, false)}
                  className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-sm font-medium hover:border-primary/50 transition-colors active:scale-95"
                >
                  {w}
                </motion.button>
              ))}
            </div>
          </div>
        )
      }

      /* multiple-choice / fill-blank */
      return (
        <div className="grid grid-cols-1 gap-2.5">
          {exercise.options?.map(opt => {
            const isSelected = selectedOption === opt
            const isAnswer = opt === exercise.answer
            let optClass = "bg-card border-border hover:border-primary/50 text-foreground"
            if (showResult && isAnswer) optClass = "bg-success/15 border-success text-success"
            else if (showResult && isSelected && !isAnswer) optClass = "bg-destructive/15 border-destructive text-destructive"
            else if (isSelected) optClass = "bg-primary/10 border-primary text-primary"

            return (
              <motion.button
                key={opt}
                whileTap={showResult ? {} : { scale: 0.97 }}
                onClick={() => !showResult && setSelectedOption(opt)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                  optClass
                )}
              >
                {opt}
              </motion.button>
            )
          })}
        </div>
      )
    }

    const promptText = exercise.prompt || "Complete the task below."

    return (
      <motion.div animate={shakeControls} className="space-y-5">
        {/* Prompt with speaker */}
        <div className="p-4 rounded-xl bg-secondary/60 border border-border flex items-center gap-3">
          <p className="text-base font-semibold text-foreground text-center leading-relaxed flex-1">
            {promptText}
          </p>
          {(exercise.kind === "translation" || exercise.kind === "reorder") && exercise.answer && (
            <SpeakButton text={exercise.answer} />
          )}
        </div>

        {renderOptions(exercise.kind)}

        {/* Hint */}
        {!showResult && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors mx-auto"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {showHint ? "Hide hint" : "Need a hint?"}
          </button>
        )}
        {showHint && !showResult && exercise.explanation && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-accent text-center px-4"
          >
            {exercise.explanation.split(".")[0]}.
          </motion.p>
        )}

        {/* Check / Feedback */}
        {!showResult ? (
            <Button
              onClick={() => checkExerciseAnswer(exercise)}
              disabled={
                (exercise.kind === "translation" && !typedAnswer.trim()) ||
                (exercise.kind === "reorder" && reorderPicked.length === 0) ||
                ((exercise.kind === "multiple-choice" || exercise.kind === "fill-blank") && !selectedOption) ||
                (exercise.kind === "production" && exercise.mode !== "speaking" && !typedAnswer.trim())
              }
              className="w-full py-3 rounded-xl font-bold"
            >
            Check Answer
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "p-4 rounded-xl border-2",
              isCorrect
                ? "bg-success/10 border-success/30"
                : "bg-destructive/10 border-destructive/30"
            )}
          >
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.1 }}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                  isCorrect ? "bg-success" : "bg-destructive"
                )}
              >
                {isCorrect
                  ? <Sparkles className="w-4 h-4 text-success-foreground" />
                  : <X className="w-4 h-4 text-destructive-foreground" />}
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-bold", isCorrect ? "text-success" : "text-destructive")}>
                  {isCorrect ? "Richtig! Great job!" : "Not quite"}
                </p>
                {!isCorrect && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Correct answer: <span className="font-semibold text-foreground">{exercise.answer}</span>
                  </p>
                )}
                {exercise.explanation && (
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{exercise.explanation}</p>
                )}
                {exercise.kind === "production" && exercise.sampleAnswer && (
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Sample response: <span className="font-semibold text-foreground">{exercise.sampleAnswer}</span>
                  </p>
                )}
              </div>
            </div>
            <Button onClick={goNext} className="w-full mt-4 py-3 rounded-xl font-bold">
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}
      </motion.div>
    )
  }

  /* ── Main render ── */
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <ConfettiBurst active={showConfetti} />

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={onExit} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full relative"
              style={{ background: "linear-gradient(90deg, #0EA5E9, #84CC16)" }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="absolute inset-0 animate-shimmer rounded-full" />
            </motion.div>
          </div>
          {debugContext && (
            <span className="text-[10px] text-muted-foreground px-2 py-1 rounded-md bg-secondary border border-border">
              {debugContext.purpose ?? "-"} · {debugContext.timeBudget ?? "-"}m · {debugContext.prioritySkill ?? "-"}
              <span className="ml-1 text-[10px] text-primary">({debugStepLabel})</span>
            </span>
          )}
          <span className="text-xs font-bold text-muted-foreground tabular-nums">
            {safeStepIdx + 1}/{steps.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">
        {debugContext && currentStep?.kind === "exercise" && (
          <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
            <div className="rounded-xl border border-border bg-secondary/90 px-3 py-2 text-[10px] text-muted-foreground backdrop-blur">
              <div className="flex items-center justify-between gap-2">
                <span>Debug exercise panel</span>
                <Button size="sm" variant="outline" onClick={goNext} className="h-7 px-2 text-[10px]">
                  Skip Step
                </Button>
              </div>
              <div className="mt-1 break-words">
                {JSON.stringify({
                  lessonId: content.lessonId,
                  step: debugStepLabel,
                  kind: debugExercise?.kind,
                  prompt: debugExercise?.prompt,
                  mode: debugExercise?.mode,
                })}
              </div>
            </div>
          </div>
        )}
        <div>
          <div
            key={safeStepIdx}
            className="space-y-6"
          >
            {debugContext && (
              <div className="mb-4 rounded-xl border border-border bg-card px-4 py-3 text-xs text-foreground">
                <div className="font-semibold">Debug step: {debugStepLabel}</div>
                <div>safeStepIdx: {safeStepIdx} / {steps.length - 1}</div>
                {debugExercise && (
                  <div className="mt-1 text-muted-foreground">
                    exercise prompt: {debugExercise.prompt || "(empty)"}
                  </div>
                )}
              </div>
            )}
            {!currentStep && (
              <div className="p-4 rounded-xl bg-secondary/60 border border-border text-center text-sm text-muted-foreground">
                Step data missing. Please continue.
                <Button onClick={goNext} className="w-full mt-4 py-3 rounded-xl font-bold">
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* ── INTRO ── */}
            {currentStep.kind === "intro" && (
              <div className="space-y-6 py-4">
                <motion.div
                  className="flex justify-center"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <IgelMascot mood="happy" size={72} breathing />
                </motion.div>
                <div className="text-center space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Lesson Goal</p>
                  <h1 className="text-xl font-bold text-foreground text-balance leading-tight">{content.goal}</h1>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: BookOpen, label: "Grammar", detail: `${content.grammarPoints.length} key rules` },
                    { icon: Volume2, label: "Vocabulary", detail: `${content.vocabulary.length} words` },
                    { icon: MessageSquare, label: "Dialogue", detail: `${content.dialogue.length} lines` },
                    { icon: Dumbbell, label: "Exercises", detail: `${content.exercises.length} challenges` },
                  ].map(({ icon: Icon, label, detail }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                    >
                      <Icon className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground flex-1">{label}</span>
                      <span className="text-xs text-muted-foreground">{detail}</span>
                    </motion.div>
                  ))}
                </div>
                <Button onClick={goNext} className="w-full py-3 rounded-xl font-bold text-base">
                  {"Let's start"} <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            )}

            {/* ── GRAMMAR ── */}
            {currentStep.kind === "grammar" && (() => {
              const gp = content.grammarPoints[(currentStep as { index: number }).index]
              return (
                <div className="space-y-5 py-2">
                  <div className="flex items-center gap-2 text-primary">
                    <BookOpen className="w-4 h-4" />
                    <p className="text-xs font-bold uppercase tracking-wider">
                      Grammar Rule {(currentStep as { index: number }).index + 1}
                    </p>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed font-medium">{gp.rule}</p>
                  {gp.table && (
                    <div className="rounded-xl border border-border overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-secondary/70">
                            {gp.table.headers.map(h => (
                              <th key={h} className="px-3 py-2 text-left font-bold text-foreground">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {gp.table.rows.map((row, ri) => (
                            <tr key={ri} className="border-t border-border">
                              {row.map((cell, ci) => (
                                <td key={ci} className={cn("px-3 py-2", ci === 0 ? "font-semibold text-foreground" : "text-muted-foreground")}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    {stepIdx > 0 && (
                      <Button variant="outline" onClick={goBack} className="rounded-xl">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                      </Button>
                    )}
                    <Button onClick={goNext} className="flex-1 py-3 rounded-xl font-bold">
                      Got it <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )
            })()}

            {/* ── VOCABULARY ── */}
            {currentStep.kind === "vocab" && (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-2 text-primary">
                  <Volume2 className="w-4 h-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Key Vocabulary</p>
                </div>
                <div className="space-y-2">
                  {content.vocabulary.map((v, i) => (
                    <motion.div
                      key={v.german}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border group"
                    >
                      <SpeakButton text={v.german} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{v.german}</p>
                        <p className="text-xs text-muted-foreground">{v.english}</p>
                      </div>
                      {v.example && (
                        <p className="text-[10px] text-accent italic shrink-0 max-w-[35%] text-right hidden sm:block">{v.example}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={goBack} className="rounded-xl">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button onClick={goNext} className="flex-1 py-3 rounded-xl font-bold">
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── DIALOGUE ── */}
            {currentStep.kind === "dialogue" && (
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <MessageSquare className="w-4 h-4" />
                    <p className="text-xs font-bold uppercase tracking-wider">Dialogue</p>
                  </div>
                  <button
                    onClick={playDialogueSequence}
                    disabled={dialoguePlaying}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all",
                      dialoguePlaying
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10"
                    )}
                  >
                    <Play className="w-3 h-3" />
                    {dialoguePlaying ? "Playing..." : "Play all"}
                  </button>
                </div>
                <div className="space-y-3">
                  {content.dialogue.map((line, i) => {
                    const isEven = i % 2 === 0
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: isEven ? -12 : 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.12 }}
                        className={cn("flex", isEven ? "justify-start" : "justify-end")}
                      >
                        <div className={cn(
                          "max-w-[85%] p-3 rounded-2xl relative group",
                          isEven
                            ? "bg-card border border-border rounded-tl-sm"
                            : "bg-primary/10 border border-primary/20 rounded-tr-sm"
                        )}>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-[10px] font-bold text-primary">{line.speaker}</p>
                            <SpeakButton text={line.german} speaker={line.speaker} />
                          </div>
                          <p className="text-sm font-semibold text-foreground">{line.german}</p>
                          <p className="text-xs text-muted-foreground mt-1 italic">{line.english}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={goBack} className="rounded-xl">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button onClick={goNext} className="flex-1 py-3 rounded-xl font-bold">
                    Start Exercises <Dumbbell className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── EXERCISE ── */}
            {currentStep.kind === "exercise" && (() => {
              const exerciseIndex = (currentStep as { index: number }).index
              const exercise = content.exercises[exerciseIndex]
              const isLastExercise = exerciseIndex === content.exercises.length - 1

              if (!exercise) {
                return (
                  <div className="py-2 space-y-4">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Dumbbell className="w-4 h-4" />
                      <p className="text-xs font-bold uppercase tracking-wider">
                        Exercise {exerciseIndex + 1} of {content.exercises.length}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/60 border border-border text-center text-sm text-muted-foreground">
                      This exercise is unavailable. Continue to the next step.
                    </div>
                    <Button onClick={goNext} className="w-full py-3 rounded-xl font-bold">
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )
              }

              const kindLabel = typeof exercise.kind === "string"
                ? exercise.kind.replace("-", " ")
                : "exercise"

              const debugInfo = debugContext
                ? JSON.stringify({
                    lessonId: content.lessonId,
                    exerciseIndex,
                    kind: exercise.kind,
                    prompt: exercise.prompt,
                    mode: exercise.mode,
                    hasOptions: Array.isArray(exercise.options),
                    hasWords: Array.isArray(exercise.words),
                    hasSample: Boolean(exercise.sampleAnswer),
                  })
                : null

              let exerciseBody: JSX.Element
              try {
                exerciseBody = renderExercise(exercise)
              } catch (error) {
                const message = error instanceof Error ? error.message : String(error)
                exerciseBody = (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-secondary/60 border border-border text-center text-sm text-muted-foreground">
                      Exercise failed to render: {message}
                    </div>
                    <Button onClick={goNext} className="w-full py-3 rounded-xl font-bold">
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )
              }

              return (
                <div className="py-2">
                  <div className="flex items-center gap-2 text-primary mb-4">
                    <Dumbbell className="w-4 h-4" />
                    <p className="text-xs font-bold uppercase tracking-wider">
                      Exercise {exerciseIndex + 1} of {content.exercises.length}
                    </p>
                    <span className="ml-auto text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
                      {kindLabel}
                    </span>
                  </div>
                  {debugInfo && (
                    <div className="mb-3 rounded-lg border border-border bg-secondary/60 px-3 py-2 text-[10px] text-muted-foreground">
                      {debugInfo}
                    </div>
                  )}
                  {exercise.kind === "production" ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-secondary/60 border border-border">
                        <p className="text-base font-semibold text-foreground text-center leading-relaxed">
                          {exercise.prompt || "Complete the task below."}
                        </p>
                      </div>
                      <textarea
                        value={typedAnswer}
                        onChange={e => setTypedAnswer(e.target.value)}
                        placeholder={exercise.mode === "speaking"
                          ? "Speak aloud first, then jot notes (optional)..."
                          : "Write your response here..."}
                        className="min-h-[110px] w-full rounded-xl bg-secondary border border-border text-foreground text-sm p-3"
                      />
                      <Button
                        onClick={() => {
                          checkExerciseAnswer(exercise)
                          if (isLastExercise) {
                            setTimeout(() => goNext(), 200)
                          }
                        }}
                        disabled={exercise.mode !== "speaking" && !typedAnswer.trim()}
                        className="w-full py-3 rounded-xl font-bold"
                      >
                        Check
                      </Button>
                      {exercise.sampleAnswer && (
                        <p className="text-xs text-muted-foreground text-center">
                          Sample response: <span className="font-semibold text-foreground">{exercise.sampleAnswer}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    exerciseBody
                  )}
                </div>
              )
            })()}

            {/* ── SUMMARY ── */}
            {currentStep.kind === "summary" && (() => {
              const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
              const great = pct >= 70
              return (
                <div className="space-y-5 py-4">
                  <motion.div
                    className="flex justify-center"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <IgelMascot mood={great ? "celebrate" : "thinking"} size={80} breathing />
                  </motion.div>
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-foreground">Lesson Complete!</h2>
                    <motion.p
                      className={cn("text-4xl font-black tabular-nums", great ? "text-success" : "text-accent")}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                    >
                      {pct}%
                    </motion.p>
                    <p className="text-sm text-muted-foreground">
                      {score.correct} of {score.total} exercises correct
                    </p>
                  </div>

                  {/* ── Recap: what you learned ── */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">What you learned</p>

                    {/* Grammar recap */}
                    <div className="p-3 rounded-xl bg-card border border-border space-y-1.5">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground">Grammar</span>
                      </div>
                      {content.grammarPoints.map((gp, i) => (
                        <p key={i} className="text-xs text-muted-foreground leading-relaxed pl-5">
                          {'\u2022'} {gp.rule.length > 80 ? gp.rule.slice(0, 80) + '...' : gp.rule}
                        </p>
                      ))}
                    </div>

                    {/* Vocab recap */}
                    <div className="p-3 rounded-xl bg-card border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground">Vocabulary ({content.vocabulary.length} words)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {content.vocabulary.slice(0, 12).map(v => (
                          <span
                            key={v.german}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-secondary text-foreground font-medium"
                          >
                            {v.german}
                            <SpeakButton text={v.german} size="sm" />
                          </span>
                        ))}
                        {content.vocabulary.length > 12 && (
                          <span className="text-[10px] text-muted-foreground self-center">+{content.vocabulary.length - 12} more</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review tip */}
                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                    <p className="text-xs font-bold text-accent mb-1">Review tip</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{content.reviewHint}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetForStep(0, -1)
                        setScore({ correct: 0, total: 0 })
                      }}
                      className="rounded-xl"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" /> Retry
                    </Button>
                    <Button
                      onClick={() => {
                        playSound("complete")
                        onComplete(content.lessonId, score.correct, score.total)
                        if (nextLessonId && onContinueNext) {
                          onContinueNext(nextLessonId)
                        }
                      }}
                      className="flex-1 py-3 rounded-xl font-bold"
                    >
                      {nextLessonId ? "Continue to Next" : "Finish"}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )
            })()}

          </div>
        </div>
      </div>
    </div>
  )
}
