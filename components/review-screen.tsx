"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Layers } from "lucide-react"
import { VocabTab } from "@/components/tabs/vocab-tab"
import { CardsTab } from "@/components/tabs/cards-tab"
import { cn } from "@/lib/utils"

type ReviewMode = "vocab" | "cards"

interface ReviewScreenProps {
  selectedLesson: string
  onLessonChange: (id: string) => void
}

export function ReviewScreen({ selectedLesson, onLessonChange }: ReviewScreenProps) {
  const [mode, setMode] = useState<ReviewMode>("vocab")

  return (
    <div className="w-full">
      {/* Toggle pills */}
      <div className="flex items-center justify-center gap-2 mb-4 px-4">
        {([
          { id: "vocab" as const, label: "Vocabulary", icon: BookOpen },
          { id: "cards" as const, label: "Flashcards", icon: Layers },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors",
              mode === tab.id
                ? "text-primary-foreground"
                : "text-muted-foreground bg-secondary hover:bg-secondary/80"
            )}
          >
            {mode === tab.id && (
              <motion.div
                layoutId="reviewToggle"
                className="absolute inset-0 bg-primary rounded-xl"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {mode === "vocab" ? (
        <VocabTab selectedLesson={selectedLesson} onLessonChange={onLessonChange} />
      ) : (
        <CardsTab selectedLesson={selectedLesson} onLessonChange={onLessonChange} />
      )}
    </div>
  )
}
