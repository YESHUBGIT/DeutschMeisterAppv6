"use client"

import { motion } from "framer-motion"
import { Route, Dumbbell, Layers, MessageSquare, CircleUser } from "lucide-react"
import { cn } from "@/lib/utils"

export type AppTab = "home" | "practice" | "review" | "tutor" | "profile"

const tabs: { id: AppTab; label: string; icon: typeof Route }[] = [
  { id: "home", label: "Path", icon: Route },
  { id: "practice", label: "Practice", icon: Dumbbell },
  { id: "review", label: "Review", icon: Layers },
  { id: "tutor", label: "Tutor", icon: MessageSquare },
  { id: "profile", label: "Profile", icon: CircleUser },
]

interface BottomNavProps {
  active: AppTab
  onChange: (tab: AppTab) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 glass-card pb-safe"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = active === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-2.5 px-3 flex-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 h-[2px] w-10 rounded-b-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.8 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <Icon className={cn("w-5 h-5 transition-all", isActive && "stroke-[2.5px]")} />
              </motion.div>
              <span className={cn(
                "text-[10px] font-medium leading-tight",
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
