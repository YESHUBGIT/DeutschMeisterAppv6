export type SoundType = "success" | "correct" | "streak" | "sad" | "complete"

let audioContext: AudioContext | null = null

const getContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

const playTone = (frequency: number, duration: number, startTime: number) => {
  const context = getContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = "sine"
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

export const playSound = async (type: SoundType) => {
  if (typeof window === "undefined") return
  const context = getContext()
  if (context.state === "suspended") {
    await context.resume()
  }

  const now = context.currentTime
  switch (type) {
    case "success":
    case "correct":
      playTone(520, 0.15, now)
      playTone(660, 0.15, now + 0.16)
      break
    case "complete":
      playTone(440, 0.12, now)
      playTone(520, 0.12, now + 0.13)
      playTone(660, 0.18, now + 0.26)
      break
    case "streak":
      playTone(660, 0.12, now)
      playTone(780, 0.12, now + 0.13)
      playTone(990, 0.18, now + 0.26)
      break
    case "sad":
      playTone(360, 0.2, now)
      playTone(300, 0.2, now + 0.22)
      break
    default:
      break
  }
}
