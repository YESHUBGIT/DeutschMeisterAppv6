"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BottomNav, type AppTab } from "@/components/bottom-nav"
import { TopBar } from "@/components/top-bar"
import { Pathway } from "@/components/pathway"
import { Onboarding } from "@/components/onboarding"
import { TrainTab } from "@/components/tabs/train-tab"
import { ReviewScreen } from "@/components/review-screen"
import { TutorTab } from "@/components/tabs/tutor-tab"
import { ProfileScreen } from "@/components/profile-screen"
import { useGamification } from "@/lib/use-gamification"
import { useLearnerProfile } from "@/lib/use-learner-profile"
import { useSoundSettings } from "@/lib/use-sound-settings"
import { LessonPlayer } from "@/components/lesson-player"
import { buildPersonalizedCatalog, isLessonUnlocked } from "@/lib/lesson-catalog"
import { getLessonContent } from "@/lib/lesson-content"

const TAB_ORDER: AppTab[] = ["home", "practice", "review", "tutor", "profile"]

function getDirection(from: AppTab, to: AppTab): number {
  return TAB_ORDER.indexOf(to) > TAB_ORDER.indexOf(from) ? 1 : -1
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "20%" : "-20%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-10%" : "10%", opacity: 0 }),
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<AppTab>("home")
  const [lessonFilter, setLessonFilter] = useState("all")
  const prevTabRef = useRef<AppTab>("home")
  const [direction, setDirection] = useState(0)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setMounted(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  const { profile, updateProfile, completeOnboarding, resetProfile } = useLearnerProfile()
  const progress = useGamification(profile.purpose)
  const { play } = useSoundSettings()

  const lessonOptions = useMemo(() => ({
    purpose: profile.purpose,
    timeCommitment: profile.timeCommitment,
    learningStyle: profile.learningStyle,
  }), [profile.purpose, profile.timeCommitment, profile.learningStyle])

  const handleOnboardingComplete = useCallback((answers: {
    purpose: string; level: string; timeCommitment: string;
    learningStyle: string; region: string; deadline: string
  }) => {
    updateProfile({
      purpose: answers.purpose as never,
      level: answers.level as never,
      timeCommitment: answers.timeCommitment as never,
      learningStyle: answers.learningStyle as never,
      region: answers.region as never,
      deadline: answers.deadline,
    })
    completeOnboarding()
    play("complete")
  }, [updateProfile, completeOnboarding, play])

  const handleTabChange = useCallback((tab: AppTab) => {
    setDirection(getDirection(prevTabRef.current, tab))
    prevTabRef.current = activeTab
    setActiveTab(tab)
  }, [activeTab])

  const handleStartLesson = useCallback((lessonId: string) => {
    const content = getLessonContent(lessonId, lessonOptions)
    if (content) {
      // Open interactive lesson player
      setActiveLessonId(lessonId)
    } else {
      // Fallback: go to train tab for lessons without content yet
      setLessonFilter(lessonId)
      setDirection(1)
      prevTabRef.current = "home"
      setActiveTab("practice")
      progress.completeLesson(lessonId)
      play("correct")
    }
  }, [lessonOptions, progress, play])

  const handleLessonComplete = useCallback((lessonId: string, _score: number, _total: number) => {
    progress.completeLesson(lessonId)
    play("complete")
    setActiveLessonId(null)
  }, [progress, play])

  const handleContinueNext = useCallback((lessonId: string) => {
    setActiveLessonId(lessonId)
  }, [])

  const handleLessonExit = useCallback(() => {
    setActiveLessonId(null)
  }, [])

  const handlePracticeLesson = useCallback((lessonId: string) => {
    setLessonFilter(lessonId)
    setDirection(1)
    prevTabRef.current = "home"
    setActiveTab("practice")
  }, [])

  const activeLessonContent = activeLessonId ? getLessonContent(activeLessonId, lessonOptions) : null
  const nextLessonId = useMemo(() => {
    if (!activeLessonId) return null
    const catalog = buildPersonalizedCatalog(profile.purpose)
    const completedSet = new Set([...progress.completedLessons, activeLessonId])
    return catalog.find((lesson) => !completedSet.has(lesson.id) && isLessonUnlocked(lesson, completedSet))?.id ?? null
  }, [activeLessonId, profile.purpose, progress.completedLessons])

  /* SSR/hydration guard -- must match exact root structure to avoid mismatch */
  if (!mounted) {
    return (
      <div className="min-h-dvh bg-background flex flex-col">
        <header className="sticky top-0 z-40 glass-card pt-safe">
          <div className="flex items-center gap-3 px-4 py-2.5 max-w-lg mx-auto">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center" />
            <div className="flex-1" />
          </div>
        </header>
        <main className="flex-1" />
      </div>
    )
  }

  /* Lesson player gate */
  if (activeLessonContent) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="lesson-player"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <LessonPlayer
            content={activeLessonContent}
            onComplete={handleLessonComplete}
            onExit={handleLessonExit}
            nextLessonId={nextLessonId}
            onContinueNext={handleContinueNext}
            debugContext={{
              purpose: profile.purpose,
              timeBudget: profile.timeCommitment,
              prioritySkill: profile.learningStyle,
            }}
          />
        </motion.div>
      </AnimatePresence>
    )
  }

  /* Onboarding gate */
  if (!profile.onboarded) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.25 }}
        >
          <Onboarding onComplete={handleOnboardingComplete} />
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <TopBar
        completedCount={progress.completedCount}
        totalLessons={progress.totalLessons}
        overallProgress={progress.overallProgress}
        currentModule={progress.currentModule}
        activeDays={progress.activeDays}
      />

      <main className="flex-1 overflow-y-auto pb-20 pt-3">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
            className="w-full"
          >
            {activeTab === "home" && (
              <Pathway
                completedLessons={progress.completedLessons}
                onStartLesson={handleStartLesson}
                onPracticeLesson={handlePracticeLesson}
                profile={profile}
              />
            )}
            {activeTab === "practice" && (
              <div className="max-w-lg mx-auto px-4">
                <TrainTab
                  selectedLesson={lessonFilter}
                  onLessonChange={setLessonFilter}
                  lessonOptions={lessonOptions}
                />
              </div>
            )}
            {activeTab === "review" && (
              <div className="max-w-lg mx-auto px-4">
                <ReviewScreen selectedLesson={lessonFilter} onLessonChange={setLessonFilter} />
              </div>
            )}
            {activeTab === "tutor" && (
              <div className="max-w-lg mx-auto px-4">
                <TutorTab />
              </div>
            )}
            {activeTab === "profile" && (
              <ProfileScreen
                completedCount={progress.completedCount}
                totalLessons={progress.totalLessons}
                activeDays={progress.activeDays}
                minutesStudied={progress.minutesStudied}
                currentPhase={progress.currentPhase}
                currentModule={progress.currentModule}
                profile={profile}
                onResetProfile={resetProfile}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav active={activeTab} onChange={handleTabChange} />
    </div>
  )
}
