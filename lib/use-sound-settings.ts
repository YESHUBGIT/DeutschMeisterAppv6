"use client"

import { useEffect, useState } from "react"
import { playSound, type SoundType } from "@/lib/sound"

const STORAGE_KEY = "soundEnabled"
const EVENT_NAME = "sound-settings"

export const useSoundSettings = () => {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return true
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      return stored === "true"
    }
    return true
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail
      if (typeof detail === "boolean") {
        setEnabled(detail)
      }
    }
    window.addEventListener(EVENT_NAME, handler as EventListener)
    return () => window.removeEventListener(EVENT_NAME, handler as EventListener)
  }, [])

  const toggle = () => {
    const next = !enabled
    setEnabled(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(next))
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }))
    }
  }

  const play = async (type: SoundType) => {
    if (!enabled) return
    await playSound(type)
  }

  return { enabled, toggle, play }
}
