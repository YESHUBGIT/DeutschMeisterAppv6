"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Briefcase, Plane, GraduationCap, Home, ClipboardCheck, Coffee,
  Sparkles, Clock, MessageCircle, BookOpen, Languages, Globe,
  ChevronRight, ChevronLeft, MapPin,
} from "lucide-react"
import { IgelMascot } from "@/components/igel/igel-mascot"
import type {
  Purpose, Level, TimeCommitment, LearningStyle, Region,
} from "@/lib/use-learner-profile"
import { cn } from "@/lib/utils"

interface Option<T extends string> {
  value: T
  label: string
  desc?: string
  icon: typeof Briefcase
}

const purposeOptions: Option<Purpose>[] = [
  { value: "work", label: "Work", desc: "Office, meetings, emails", icon: Briefcase },
  { value: "travel", label: "Travel", desc: "Navigate, order, explore", icon: Plane },
  { value: "study", label: "Study", desc: "University, academic", icon: GraduationCap },
  { value: "relocation", label: "Relocation", desc: "Moving to DACH region", icon: Home },
  { value: "exams", label: "Exams", desc: "Goethe / TELC prep", icon: ClipboardCheck },
  { value: "daily", label: "Daily Life", desc: "Everyday conversations", icon: Coffee },
]

const levelOptions: Option<Level>[] = [
  { value: "new", label: "Complete Beginner", desc: "Starting from zero", icon: Sparkles },
  { value: "a1", label: "A1 - Beginner", desc: "Basic phrases", icon: Languages },
  { value: "a2", label: "A2 - Elementary", desc: "Simple conversations", icon: Languages },
  { value: "b1", label: "B1 - Intermediate", desc: "Everyday topics", icon: Languages },
  { value: "b2", label: "B2 - Upper Int.", desc: "Complex discussions", icon: Languages },
  { value: "unsure", label: "Not Sure", desc: "Help me figure it out", icon: Sparkles },
]

const timeOptions: Option<TimeCommitment>[] = [
  { value: "5", label: "5 min / day", desc: "Quick daily bite", icon: Clock },
  { value: "10", label: "10 min / day", desc: "Steady progress", icon: Clock },
  { value: "20", label: "20 min / day", desc: "Focused learning", icon: Clock },
  { value: "45", label: "45+ min / day", desc: "Intensive study", icon: Clock },
]

const styleOptions: Option<LearningStyle>[] = [
  { value: "speaking", label: "More Speaking", desc: "Dialogues & pronunciation", icon: MessageCircle },
  { value: "grammar", label: "Grammar Clarity", desc: "Rules & structure", icon: BookOpen },
  { value: "vocab", label: "More Vocabulary", desc: "Words & phrases first", icon: Languages },
  { value: "balanced", label: "Balanced Mix", desc: "A bit of everything", icon: Sparkles },
]

const regionOptions: Option<Region>[] = [
  { value: "germany", label: "Germany", desc: "Hochdeutsch focus", icon: MapPin },
  { value: "austria", label: "Austria", desc: "Austrian German", icon: MapPin },
  { value: "switzerland", label: "Switzerland", desc: "Swiss German basics", icon: Globe },
  { value: "none", label: "No Preference", desc: "Standard German", icon: Globe },
]

interface OnboardingProps {
  onComplete: (answers: {
    purpose: Purpose
    level: Level
    timeCommitment: TimeCommitment
    learningStyle: LearningStyle
    region: Region
    deadline: string
  }) => void
}

const TOTAL_STEPS = 6

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "80%" : "-80%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-40%" : "40%", opacity: 0 }),
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [purpose, setPurpose] = useState<Purpose | null>(null)
  const [level, setLevel] = useState<Level | null>(null)
  const [time, setTime] = useState<TimeCommitment | null>(null)
  const [style, setStyle] = useState<LearningStyle | null>(null)
  const [region, setRegion] = useState<Region | null>(null)
  const [deadline, setDeadline] = useState("")

  const goNext = useCallback(() => { setDir(1); setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1)) }, [])
  const goBack = useCallback(() => { setDir(-1); setStep((s) => Math.max(s - 1, 0)) }, [])

  const canFinish = !!purpose && !!level && !!time && !!style && !!region

  const handleFinish = useCallback(() => {
    if (purpose && level && time && style && region) {
      onComplete({ purpose, level, timeCommitment: time, learningStyle: style, region, deadline: deadline || "none" })
    }
  }, [purpose, level, time, style, region, deadline, onComplete])

  const titles = [
    "Why are you learning German?",
    "What is your current level?",
    "How much time per day?",
    "How do you prefer to learn?",
    "Which region?",
    "Any target deadline?",
  ]
  const subtitles = [
    "We'll personalize your lessons to match your goal.",
    "No pressure -- you can change this later.",
    "Even 5 minutes a day makes a difference.",
    "We'll weight exercises accordingly.",
    "We'll adjust vocabulary and expressions.",
    "We'll pace your learning plan.",
  ]

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Top */}
      <div className="pt-safe px-5 pt-6 pb-3">
        <div className="flex items-center gap-3 mb-5">
          {step > 0 && (
            <button
              onClick={goBack}
              className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground"
              aria-label="Go back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            />
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground tabular-nums shrink-0">
            {step + 1}/{TOTAL_STEPS}
          </span>
        </div>
        <div className="flex justify-center mb-3">
          <IgelMascot
            mood={step === 0 ? "happy" : step === TOTAL_STEPS - 1 ? "cheering" : "thinking"}
            size={56}
            breathing
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <h1 className="text-xl font-bold text-foreground text-center mb-1 text-balance">
              {titles[step]}
            </h1>
            <p className="text-xs text-muted-foreground text-center mb-5 text-pretty">
              {subtitles[step]}
            </p>

            {step === 0 && <OptionGrid options={purposeOptions} selected={purpose} onSelect={(v) => { setPurpose(v); setTimeout(goNext, 180) }} />}
            {step === 1 && <OptionGrid options={levelOptions} selected={level} onSelect={(v) => { setLevel(v); setTimeout(goNext, 180) }} />}
            {step === 2 && <OptionGrid options={timeOptions} selected={time} onSelect={(v) => { setTime(v); setTimeout(goNext, 180) }} />}
            {step === 3 && <OptionGrid options={styleOptions} selected={style} onSelect={(v) => { setStyle(v); setTimeout(goNext, 180) }} />}
            {step === 4 && <OptionGrid options={regionOptions} selected={region} onSelect={(v) => { setRegion(v); setTimeout(goNext, 180) }} />}
            {step === 5 && (
              <div className="flex flex-col items-center gap-4">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full max-w-xs px-4 py-3 rounded-xl bg-card border border-border text-foreground font-medium text-center focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                  aria-label="Target deadline"
                />
                <button
                  onClick={() => setDeadline("")}
                  className={cn("text-sm font-medium", !deadline ? "text-primary" : "text-muted-foreground")}
                >
                  No specific deadline
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom */}
      <div className="px-5 pb-6 pb-safe">
        {step === TOTAL_STEPS - 1 ? (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={handleFinish}
            disabled={!canFinish}
            className={cn(
              "w-full py-3.5 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2",
              canFinish
                ? "bg-primary text-primary-foreground active:scale-[0.98]"
                : "bg-secondary text-muted-foreground"
            )}
          >
            Start Learning
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        ) : (
          <div className="h-14" />
        )}
      </div>
    </div>
  )
}

function OptionGrid<T extends string>({
  options, selected, onSelect,
}: {
  options: Option<T>[]
  selected: T | null
  onSelect: (value: T) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((opt, i) => {
        const isSelected = selected === opt.value
        const Icon = opt.icon
        return (
          <motion.button
            key={opt.value}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3.5 rounded-xl border transition-all text-center",
              isSelected
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
              isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            )}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className={cn("text-sm font-semibold", isSelected ? "text-primary" : "text-foreground")}>
                {opt.label}
              </p>
              {opt.desc && (
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{opt.desc}</p>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
