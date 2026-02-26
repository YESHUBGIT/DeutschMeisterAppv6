"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen, Zap, Table, Clock, CalendarDays, Target,
  ArrowLeft, Volume2, VolumeX, ChevronRight, RotateCcw,
} from "lucide-react"
import { IgelMascot } from "@/components/igel/igel-mascot"
import { CoreTab } from "@/components/tabs/core-tab"
import { CheatTab } from "@/components/tabs/cheat-tab"
import { VerbConjugationsTab } from "@/components/tabs/verb-conjugations-tab"
import { useSoundSettings } from "@/lib/use-sound-settings"
import type { LearnerProfile } from "@/lib/use-learner-profile"
import { cn } from "@/lib/utils"

interface ProfileScreenProps {
  completedCount: number
  totalLessons: number
  activeDays: number
  minutesStudied: number
  currentPhase: { label: string; phase: 1 | 2 | 3 }
  currentModule: string
  profile: LearnerProfile
  onResetProfile?: () => void
}

type SubPage = null | "grammar" | "cheatsheets" | "verbs"

const PURPOSE_LABEL: Record<string, string> = {
  work: "Work", travel: "Travel", study: "Study", relocation: "Relocation",
  exams: "Exams", daily: "Daily Life", other: "General",
}

export function ProfileScreen({
  completedCount, totalLessons, activeDays, minutesStudied,
  currentPhase, currentModule, profile, onResetProfile,
}: ProfileScreenProps) {
  const [subPage, setSubPage] = useState<SubPage>(null)
  const { enabled, toggle } = useSoundSettings()

  const stats = [
    { icon: Target, label: "Phase", value: `${currentPhase.phase} - ${currentPhase.label}`, color: "text-primary", bg: "bg-primary/10", span: true },
    { icon: BookOpen, label: "Lessons Done", value: `${completedCount} / ${totalLessons}`, color: "text-primary", bg: "bg-primary/10" },
    { icon: CalendarDays, label: "Active Days", value: activeDays, color: "text-accent", bg: "bg-accent/10" },
    { icon: Clock, label: "Time Studied", value: `${minutesStudied} min`, color: "text-success", bg: "bg-success/10" },
  ]

  const links = [
    { id: "grammar" as const, icon: BookOpen, label: "Grammar Reference", desc: "Core German grammar rules" },
    { id: "cheatsheets" as const, icon: Zap, label: "Cheat Sheets", desc: "Quick lookup tables" },
    { id: "verbs" as const, icon: Table, label: "Verb Conjugations", desc: "All verb tenses & forms" },
  ]

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <AnimatePresence mode="wait">
        {subPage ? (
          <motion.div
            key={subPage}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <button
              onClick={() => setSubPage(null)}
              className="flex items-center gap-2 text-primary font-bold text-sm mb-4 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </button>
            <div className="pb-8">
              {subPage === "grammar" && <CoreTab />}
              {subPage === "cheatsheets" && <CheatTab />}
              {subPage === "verbs" && <VerbConjugationsTab />}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ x: "-30%", opacity: 0 }}
          >
            {/* Header */}
            <div className="flex flex-col items-center pt-4 pb-5">
              <IgelMascot
                mood={completedCount >= totalLessons * 0.5 ? "cheering" : completedCount > 0 ? "happy" : "idle"}
                size={64}
                breathing
              />
              <h2 className="mt-3 text-lg font-bold text-foreground">Your Progress</h2>
              {profile.purpose && (
                <p className="text-sm text-muted-foreground">
                  {PURPOSE_LABEL[profile.purpose] ?? "General"} path
                  <span className="mx-1.5 text-border">|</span>
                  {profile.level?.toUpperCase() ?? "New"}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground mt-0.5">{currentModule}</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl bg-card border border-border",
                    stat.span && "col-span-2"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", stat.bg)}>
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-sm font-bold text-foreground truncate">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Reference links */}
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Reference</p>
            <div className="flex flex-col gap-2 mb-5">
              {links.map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                  onClick={() => setSubPage(link.id)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border text-left hover:border-primary/30 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <link.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{link.label}</p>
                    <p className="text-[10px] text-muted-foreground">{link.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </motion.button>
              ))}
            </div>

            {/* Settings */}
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Settings</p>
            <div className="flex flex-col gap-2 mb-6">
              <button
                onClick={toggle}
                className="flex items-center gap-3 w-full p-3 rounded-xl bg-card border border-border"
              >
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  {enabled ? <Volume2 className="w-4 h-4 text-foreground" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
                </div>
                <p className="flex-1 text-left text-sm font-semibold text-foreground">Sound Effects</p>
                <div className={cn(
                  "w-10 h-[22px] rounded-full transition-colors relative",
                  enabled ? "bg-primary" : "bg-secondary"
                )}>
                  <div className={cn(
                    "absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform",
                    enabled ? "translate-x-[20px]" : "translate-x-[2px]"
                  )} />
                </div>
              </button>

              {onResetProfile && (
                <button
                  onClick={onResetProfile}
                  className="flex items-center gap-3 w-full p-3 rounded-xl bg-card border border-border hover:border-destructive/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-foreground">Restart Onboarding</p>
                    <p className="text-[10px] text-muted-foreground">Change your learning preferences</p>
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
