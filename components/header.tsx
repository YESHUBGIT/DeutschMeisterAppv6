"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { BookOpen, Brain, BookText, Layers, Target, Zap, Table, MessageCircle, Volume2, VolumeX } from "lucide-react"
import type { TabType } from "@/app/page"
import { Button } from "@/components/ui/button"
import { IgelMascot } from "@/components/igel/igel-mascot"
import { useSoundSettings } from "@/lib/use-sound-settings"
import { cn } from "@/lib/utils"

interface HeaderProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs = [
  { id: "lessons" as const, label: "Lessons", icon: BookOpen },
  { id: "train" as const, label: "Train", icon: Brain },
  { id: "vocab" as const, label: "Vocab", icon: BookText },
  { id: "conjugations" as const, label: "Conjugations", icon: Table },
  { id: "tutor" as const, label: "Tutor", icon: MessageCircle },
  { id: "cards" as const, label: "Cards", icon: Layers },
  { id: "core" as const, label: "Core", icon: Target },
  { id: "cheat" as const, label: "Cheat", icon: Zap },
]

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { status, data: session } = useSession()
  const isAuthed = status === "authenticated"
  const { enabled, toggle } = useSoundSettings()

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <IgelMascot size={44} />
              </div>
            <div>
              <h1 className="font-bold text-lg sm:text-xl text-foreground">DeutschMeister</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Master German</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 min-w-0 flex-1">
            {/* Navigation */}
            <nav className="flex items-center gap-1 min-w-0 flex-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle sound">
                {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              {isAuthed ? (
                <>
                  <span className="text-xs text-muted-foreground max-w-[180px] truncate">
                    {session?.user?.name ?? session?.user?.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
                    Sign out
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href="/auth/signin">Sign in</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2 pb-3">
          <nav className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="shrink-0" onClick={toggle} aria-label="Toggle sound">
              {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            {isAuthed ? (
              <Button variant="outline" size="sm" className="shrink-0" onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
                Sign out
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link href="/auth/signin">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
