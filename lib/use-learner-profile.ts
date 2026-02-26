"use client"

import { useState, useEffect, useCallback } from "react"

/* ── Onboarding answer types ── */
export type Purpose = "work" | "travel" | "study" | "relocation" | "exams" | "daily" | "other"
export type Level = "new" | "a1" | "a2" | "b1" | "b2" | "c1" | "unsure"
export type TimeCommitment = "5" | "10" | "20" | "45"
export type LearningStyle = "speaking" | "grammar" | "vocab" | "balanced"
export type Region = "germany" | "austria" | "switzerland" | "none"

export interface LearnerProfile {
  onboarded: boolean
  purpose: Purpose | null
  level: Level | null
  timeCommitment: TimeCommitment | null
  learningStyle: LearningStyle | null
  region: Region | null
  deadline: string | null // ISO date string or "none"
}

const STORAGE_KEY = "dm-learner-profile"
const EVENT_NAME = "learner-profile-update"

const DEFAULT_PROFILE: LearnerProfile = {
  onboarded: false,
  purpose: null,
  level: null,
  timeCommitment: null,
  learningStyle: null,
  region: null,
  deadline: null,
}

function loadProfile(): LearnerProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return DEFAULT_PROFILE
}

function persistProfile(profile: LearnerProfile) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: profile }))
}

export function useLearnerProfile() {
  const [profile, setProfile] = useState<LearnerProfile>(loadProfile)

  /* Sync across components */
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<LearnerProfile>).detail
      if (detail) setProfile(detail)
    }
    window.addEventListener(EVENT_NAME, handler)
    return () => window.removeEventListener(EVENT_NAME, handler)
  }, [])

  const updateProfile = useCallback((partial: Partial<LearnerProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial }
      persistProfile(next)
      return next
    })
  }, [])

  const completeOnboarding = useCallback(() => {
    setProfile((prev) => {
      const next = { ...prev, onboarded: true }
      persistProfile(next)
      return next
    })
  }, [])

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE)
    persistProfile(DEFAULT_PROFILE)
  }, [])

  return { profile, updateProfile, completeOnboarding, resetProfile }
}
