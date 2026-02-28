"use client"

import type { LearningStyle, Purpose, TimeCommitment } from "@/lib/use-learner-profile"
import { lessonCatalog } from "@/lib/lesson-catalog"

export type ExerciseKind =
  | "multiple-choice"
  | "fill-blank"
  | "reorder"
  | "translation"
  | "match-pair"
  | "production"

export interface Exercise {
  kind: ExerciseKind
  prompt: string
  /** For multiple-choice / fill-blank */
  options?: string[]
  /** The single correct answer string (not required for production) */
  answer: string
  /** Shown after answering */
  explanation?: string
  /** For reorder: the words to arrange */
  words?: string[]
  /** For match-pair: pairs to match */
  pairs?: { left: string; right: string }[]
  /** For production: suggested answer */
  sampleAnswer?: string
  /** For production: speaking or writing */
  mode?: "speaking" | "writing"
}

export interface DialogueLine {
  speaker: string
  german: string
  english: string
}

export interface VocabItem {
  german: string
  english: string
  example?: string
}

export interface GrammarPoint {
  rule: string
  table?: { headers: string[]; rows: string[][] }
}

export type CEFRLabel = "A1" | "A2" | "B1" | "B2" | "C1"
type PurposeTrack = Exclude<Purpose, "other"> | "daily"

export interface LessonContent {
  lessonId: string
  title: string
  level: CEFRLabel
  purposeTrack: PurposeTrack
  prerequisites: string[]
  abilityObjective: string
  grammarFocus: string
  grammarPoints: GrammarPoint[]
  vocabulary: VocabItem[]
  dialogue: DialogueLine[]
  exercises: Exercise[]
  skillUnlock: string
  reviewSuggestion: string
  /** Kept for LessonPlayer UI */
  goal: string
  reviewHint: string
}

export interface LessonOptions {
  purpose?: Purpose | null
  timeCommitment?: TimeCommitment | null
  learningStyle?: LearningStyle | null
}

interface LessonContext {
  title: string
  abilityObjective: string
  vocabulary: VocabItem[]
  dialogue: DialogueLine[]
  production: { prompt: string; sampleAnswer: string }
  skillUnlock: string
  reviewSuggestion: string
}

const LESSON_IDS = [
  "greetings-intro",
  "numbers-time",
  "personal-pronouns",
  "articles-gender",
  "present-tense",
  "everyday-phrases",
  "negation",
  "question-words",
]

const PURPOSE_TRACKS: PurposeTrack[] = ["work", "travel", "study", "relocation", "exams", "daily"]

const PURPOSE_TEMPLATES = {
  work: {
    speakerA: "Anna",
    speakerB: "Herr Weber",
    place: { de: "im Büro", en: "in the office" },
    item: { de: "der Bericht", en: "the report" },
    task: { de: "das Projekt", en: "the project" },
    document: { de: "die E-Mail", en: "the email" },
    service: { de: "die Besprechung", en: "the meeting" },
  },
  travel: {
    speakerA: "Reisender",
    speakerB: "Info",
    place: { de: "am Bahnhof", en: "at the station" },
    item: { de: "die Fahrkarte", en: "the ticket" },
    task: { de: "die Reservierung", en: "the reservation" },
    document: { de: "der Pass", en: "the passport" },
    service: { de: "das Hotel", en: "the hotel" },
  },
  study: {
    speakerA: "Student",
    speakerB: "Professor",
    place: { de: "im Seminar", en: "in the seminar" },
    item: { de: "die Aufgabe", en: "the assignment" },
    task: { de: "die Präsentation", en: "the presentation" },
    document: { de: "die E-Mail", en: "the email" },
    service: { de: "die Sprechstunde", en: "the office hours" },
  },
  relocation: {
    speakerA: "Kunde",
    speakerB: "Sachbearbeiter",
    place: { de: "im Bürgeramt", en: "at the citizens' office" },
    item: { de: "das Formular", en: "the form" },
    task: { de: "die Anmeldung", en: "the registration" },
    document: { de: "der Vertrag", en: "the contract" },
    service: { de: "der Termin", en: "the appointment" },
  },
  exams: {
    speakerA: "Kandidat",
    speakerB: "Prüfer",
    place: { de: "im Prüfungsraum", en: "in the exam room" },
    item: { de: "die Aufgabe", en: "the task" },
    task: { de: "die Prüfung", en: "the exam" },
    document: { de: "die Antwort", en: "the answer" },
    service: { de: "der Teil", en: "the section" },
  },
  daily: {
    speakerA: "Lena",
    speakerB: "Tom",
    place: { de: "im Alltag", en: "in daily life" },
    item: { de: "der Einkauf", en: "the shopping" },
    task: { de: "der Plan", en: "the plan" },
    document: { de: "die Nachricht", en: "the message" },
    service: { de: "der Termin", en: "the appointment" },
  },
} as const

const PURPOSE_LABELS: Record<PurposeTrack, string> = {
  work: "at work",
  travel: "while traveling",
  study: "at university",
  relocation: "during relocation",
  exams: "in exams",
  daily: "in daily life",
}

function buildPurposeMap(makeContext: (purpose: PurposeTrack) => LessonContext) {
  return PURPOSE_TRACKS.reduce((acc, purpose) => {
    acc[purpose] = makeContext(purpose)
    return acc
  }, {} as Record<PurposeTrack, LessonContext>)
}

const lessonMeta = new Map(lessonCatalog.map(item => [item.id, item]))

function normalizePurpose(purpose?: Purpose | null): PurposeTrack {
  if (!purpose || purpose === "other") return "daily"
  return purpose
}

function toLevelLabel(cefr: string): CEFRLabel {
  const upper = cefr.toUpperCase()
  if (upper === "A1" || upper === "A2" || upper === "B1" || upper === "B2" || upper === "C1") {
    return upper
  }
  return "A1"
}

function isShortSession(timeCommitment?: TimeCommitment | null): boolean {
  return timeCommitment === "5" || timeCommitment === "10"
}

function limitVocabulary(vocabulary: VocabItem[], level: CEFRLabel, short: boolean): VocabItem[] {
  if (short) return vocabulary.slice(0, 6)
  const max = level === "A1" || level === "A2" ? 12 : 15
  return vocabulary.slice(0, max)
}

function applyGrammarClarity(points: GrammarPoint[], learningStyle?: LearningStyle | null, summary?: GrammarPoint): GrammarPoint[] {
  if (learningStyle !== "grammar" || !summary) return points
  return [...points, summary]
}

function buildLessonShell(
  lessonId: string,
  purposeTrack: PurposeTrack
): Omit<LessonContent, "title" | "abilityObjective" | "grammarPoints" | "vocabulary" | "dialogue" | "exercises" | "skillUnlock" | "reviewSuggestion"> {
  const meta = lessonMeta.get(lessonId)
  const level = toLevelLabel(meta?.cefr ?? "A1")
  return {
    lessonId,
    level,
    purposeTrack,
    prerequisites: meta?.prerequisiteIds ?? [],
    grammarFocus: meta?.grammarFocus ?? "",
    goal: "",
    reviewHint: "",
  }
}

function buildLessonFromContext(
  lessonId: string,
  options: LessonOptions,
  contextByPurpose: Record<PurposeTrack, LessonContext>,
  grammarPoints: GrammarPoint[],
  grammarSummary: GrammarPoint,
  exercises: Exercise[]
): LessonContent {
  const purposeTrack = normalizePurpose(options.purpose)
  const short = isShortSession(options.timeCommitment)
  const speakingPriority = options.learningStyle === "speaking"
  const shell = buildLessonShell(lessonId, purposeTrack)
  const context = contextByPurpose[purposeTrack]

  const content: LessonContent = {
    ...shell,
    title: context.title,
    abilityObjective: context.abilityObjective,
    grammarPoints: applyGrammarClarity(grammarPoints, options.learningStyle, grammarSummary),
    vocabulary: context.vocabulary,
    dialogue: context.dialogue,
    exercises,
    skillUnlock: context.skillUnlock,
    reviewSuggestion: context.reviewSuggestion,
    goal: context.abilityObjective,
    reviewHint: context.reviewSuggestion,
  }

  return applyBudget(content, short, speakingPriority)
}

function applyBudget(
  content: LessonContent,
  short: boolean,
  speakingPriority: boolean
): LessonContent {
  const dialogue = short ? content.dialogue.slice(0, 2) : content.dialogue
  let exercises = content.exercises

  if (short) {
    if (speakingPriority) {
      exercises = content.exercises.filter(ex => ex.kind !== "reorder").slice(0, 3)
    } else {
      exercises = content.exercises.filter(ex => ex.kind !== "production").slice(0, 3)
    }
  }

  return {
    ...content,
    dialogue,
    exercises,
    vocabulary: limitVocabulary(content.vocabulary, content.level, short),
  }
}

function ensureExamTiming(content: LessonContent): LessonContent {
  if (content.purposeTrack !== "exams") return content
  const hasTimed = content.exercises.some(ex => ex.prompt.toLowerCase().includes("timed"))
  if (hasTimed || content.exercises.length === 0) return content

  const exercises = content.exercises.map((ex, index) =>
    index === 0 ? { ...ex, prompt: `Timed (45s): ${ex.prompt}` } : ex
  )

  return { ...content, exercises }
}

function buildGreetingsIntro(options: LessonOptions): LessonContent {
  const purposeTrack = normalizePurpose(options.purpose)
  const short = isShortSession(options.timeCommitment)
  const speakingPriority = options.learningStyle === "speaking"
  const shell = buildLessonShell("greetings-intro", purposeTrack)

  const context = {
    work: {
      title: "Introduce yourself in a meeting",
      abilityObjective: "Introduce yourself formally and state your role in a meeting.",
      vocabulary: [
        { german: "Guten Tag", english: "Good day" },
        { german: "Ich heiße...", english: "My name is..." },
        { german: "Ich bin...", english: "I am..." },
        { german: "die Firma", english: "the company" },
        { german: "das Team", english: "the team" },
        { german: "die Abteilung", english: "the department" },
        { german: "der Kollege", english: "the colleague" },
        { german: "das Projekt", english: "the project" },
        { german: "die Rolle", english: "the role" },
        { german: "Freut mich", english: "Nice to meet you" },
      ],
      dialogue: [
        { speaker: "Alex", german: "Guten Tag. Ich heiße Alex. Ich bin neu im Team.", english: "Good day. My name is Alex. I'm new on the team." },
        { speaker: "Frau Schmidt", german: "Guten Tag. Ich heiße Frau Schmidt. Ich arbeite in der Abteilung Marketing.", english: "Good day. My name is Ms. Schmidt. I work in the marketing department." },
        { speaker: "Alex", german: "Freut mich. Ich bin im Projekt Orion.", english: "Nice to meet you. I'm on the Orion project." },
      ],
      production: {
        prompt: "Roleplay: Introduce yourself to a new colleague and say your role in one or two sentences.",
        sampleAnswer: "Guten Tag, ich heiße Alex. Ich bin im Marketing-Team.",
      },
      skillUnlock: "You can introduce yourself and your role in a formal work setting.",
      reviewSuggestion: "Repeat your introduction aloud before your next meeting.",
    },
    travel: {
      title: "Introduce yourself at hotel check-in",
      abilityObjective: "Introduce yourself politely and confirm a hotel reservation.",
      vocabulary: [
        { german: "Guten Tag", english: "Good day" },
        { german: "Ich heiße...", english: "My name is..." },
        { german: "die Reservierung", english: "the reservation" },
        { german: "das Zimmer", english: "the room" },
        { german: "der Ausweis", english: "the ID" },
        { german: "der Pass", english: "the passport" },
        { german: "die Nacht", english: "the night" },
        { german: "die Buchung", english: "the booking" },
        { german: "Danke", english: "Thank you" },
      ],
      dialogue: [
        { speaker: "Gast", german: "Guten Tag. Ich heiße Maria Keller. Ich habe eine Reservierung.", english: "Good day. My name is Maria Keller. I have a reservation." },
        { speaker: "Rezeption", german: "Guten Tag. Ihr Ausweis, bitte.", english: "Good day. Your ID, please." },
        { speaker: "Gast", german: "Hier, bitte. Danke.", english: "Here you go. Thank you." },
      ],
      production: {
        prompt: "Roleplay: Check in at a hotel and state your name and reservation.",
        sampleAnswer: "Guten Tag, ich heiße Amir. Ich habe eine Reservierung für zwei Nächte.",
      },
      skillUnlock: "You can check in at a hotel with a simple, polite introduction.",
      reviewSuggestion: "Practice your check-in introduction with a timer (30 seconds).",
    },
    study: {
      title: "Introduce yourself in class",
      abilityObjective: "Introduce yourself and say you are in the course.",
      vocabulary: [
        { german: "Hallo", english: "Hi" },
        { german: "Ich heiße...", english: "My name is..." },
        { german: "der Kurs", english: "the course" },
        { german: "die Universität", english: "the university" },
        { german: "der Student", english: "the student" },
        { german: "das Seminar", english: "the seminar" },
        { german: "die Gruppe", english: "the group" },
        { german: "Freut mich", english: "Nice to meet you" },
      ],
      dialogue: [
        { speaker: "Amir", german: "Hallo, ich heiße Amir. Ich bin Student.", english: "Hi, my name is Amir. I'm a student." },
        { speaker: "Lea", german: "Hi, ich bin Lea. Bist du auch im Kurs?", english: "Hi, I'm Lea. Are you also in the course?" },
        { speaker: "Amir", german: "Ja, ich bin im Seminar. Freut mich.", english: "Yes, I'm in the seminar. Nice to meet you." },
      ],
      production: {
        prompt: "Roleplay: Introduce yourself to a classmate and say your course.",
        sampleAnswer: "Hallo, ich heiße Sara. Ich bin im Deutschkurs.",
      },
      skillUnlock: "You can introduce yourself to classmates in a simple way.",
      reviewSuggestion: "Write your introduction and say it twice before class.",
    },
    relocation: {
      title: "Introduce yourself at the Bürgeramt",
      abilityObjective: "Introduce yourself and state the reason for your appointment.",
      vocabulary: [
        { german: "Guten Tag", english: "Good day" },
        { german: "Ich heiße...", english: "My name is..." },
        { german: "der Termin", english: "the appointment" },
        { german: "die Anmeldung", english: "the registration" },
        { german: "das Formular", english: "the form" },
        { german: "die Adresse", english: "the address" },
        { german: "der Ausweis", english: "the ID" },
        { german: "das Bürgeramt", english: "the city office" },
      ],
      dialogue: [
        { speaker: "Kunde", german: "Guten Tag. Ich heiße Jana. Ich habe einen Termin.", english: "Good day. My name is Jana. I have an appointment." },
        { speaker: "Schalter", german: "Guten Tag. Wofür ist der Termin?", english: "Good day. What is the appointment for?" },
        { speaker: "Kunde", german: "Für die Anmeldung. Hier ist mein Ausweis.", english: "For the registration. Here is my ID." },
      ],
      production: {
        prompt: "Roleplay: Introduce yourself at the Bürgeramt and say you are here for Anmeldung.",
        sampleAnswer: "Guten Tag, ich heiße Omar. Ich habe einen Termin für die Anmeldung.",
      },
      skillUnlock: "You can start a formal appointment with a clear introduction.",
      reviewSuggestion: "Practice your Bürgeramt intro once a day this week.",
    },
    exams: {
      title: "Introduce yourself in a speaking exam",
      abilityObjective: "Introduce yourself clearly at the start of an exam speaking task.",
      vocabulary: [
        { german: "Guten Tag", english: "Good day" },
        { german: "die Prüfung", english: "the exam" },
        { german: "der Prüfer", english: "the examiner" },
        { german: "Ich heiße...", english: "My name is..." },
        { german: "Ich komme aus...", english: "I come from..." },
        { german: "die Nummer", english: "the number" },
        { german: "beginnen", english: "to begin" },
      ],
      dialogue: [
        { speaker: "Prüfer", german: "Guten Tag. Wie heißen Sie?", english: "Good day. What is your name?" },
        { speaker: "Kandidat", german: "Ich heiße Omar Hassan.", english: "My name is Omar Hassan." },
        { speaker: "Prüfer", german: "Woher kommen Sie?", english: "Where are you from?" },
        { speaker: "Kandidat", german: "Ich komme aus Jordanien.", english: "I come from Jordan." },
      ],
      production: {
        prompt: "Timed (45s): Introduce yourself to the examiner and say your name and country.",
        sampleAnswer: "Guten Tag, ich heiße Lina. Ich komme aus Mexiko.",
      },
      skillUnlock: "You can handle the opening of a speaking exam.",
      reviewSuggestion: "Record your 30-second exam intro and listen back.",
    },
    daily: {
      title: "Introduce yourself to a neighbor",
      abilityObjective: "Introduce yourself and say where you live.",
      vocabulary: [
        { german: "Guten Tag", english: "Good day" },
        { german: "Ich heiße...", english: "My name is..." },
        { german: "Ich wohne...", english: "I live..." },
        { german: "der Nachbar", english: "the neighbor" },
        { german: "die Nachbarin", english: "the neighbor (f)" },
        { german: "die Wohnung", english: "the apartment" },
        { german: "das Haus", english: "the house" },
        { german: "Freut mich", english: "Nice to meet you" },
      ],
      dialogue: [
        { speaker: "Nina", german: "Guten Tag, ich heiße Nina. Ich wohne hier.", english: "Good day, my name is Nina. I live here." },
        { speaker: "Tom", german: "Hallo, ich bin Tom. Willkommen im Haus.", english: "Hi, I'm Tom. Welcome to the house." },
        { speaker: "Nina", german: "Freut mich.", english: "Nice to meet you." },
      ],
      production: {
        prompt: "Roleplay: Say hello to a neighbor and introduce yourself.",
        sampleAnswer: "Hallo, ich heiße Sam. Ich wohne in Wohnung 4.",
      },
      skillUnlock: "You can introduce yourself politely in everyday situations.",
      reviewSuggestion: "Say your introduction while walking to the mailbox.",
    },
  }[purposeTrack]

  const grammarPoints: GrammarPoint[] = [
    {
      rule: "Use 'sein' and 'heißen' to introduce yourself. The verb goes in position 2.",
      table: {
        headers: ["Person", "sein", "heißen"],
        rows: [
          ["ich", "bin", "heiße"],
          ["du", "bist", "heißt"],
          ["er/sie/es", "ist", "heißt"],
          ["Sie", "sind", "heißen"],
        ],
      },
    },
    { rule: "Use Sie for formal situations and du for friends or classmates." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Verb in position 2. 'Ich bin...' for roles, 'Ich heiße...' for names. Formal = Sie.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "You meet someone formally. What do you say?",
      options: ["Guten Tag, ich heiße Alex.", "Hallo, ich bin cool.", "Tschüss, ich heiße Alex.", "Ich heißen Alex."],
      answer: "Guten Tag, ich heiße Alex.",
      explanation: "Use Guten Tag + Ich heiße... in formal settings.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Ich ___ neu im Team.'",
      options: ["bin", "bist", "ist", "sind"],
      answer: "bin",
      explanation: "'ich' takes 'bin'.",
    },
    {
      kind: "reorder",
      prompt: "Put the words in order: 'Nice to meet you.'",
      words: ["Freut", "mich", "."],
      answer: "Freut mich.",
      explanation: "Short greeting: Freut mich.",
    },
    {
      kind: "production",
      prompt: context.production.prompt,
      answer: "",
      sampleAnswer: context.production.sampleAnswer,
      mode: speakingPriority ? "speaking" : "writing",
      explanation: "Keep it short and clear.",
    },
  ]

  const content: LessonContent = {
    ...shell,
    title: context.title,
    abilityObjective: context.abilityObjective,
    grammarPoints: applyGrammarClarity(grammarPoints, options.learningStyle, grammarSummary),
    vocabulary: context.vocabulary,
    dialogue: context.dialogue,
    exercises,
    skillUnlock: context.skillUnlock,
    reviewSuggestion: context.reviewSuggestion,
    goal: context.abilityObjective,
    reviewHint: context.reviewSuggestion,
  }

  return applyBudget(content, short, speakingPriority)
}

function buildNumbersTime(options: LessonOptions): LessonContent {
  const purposeTrack = normalizePurpose(options.purpose)
  const short = isShortSession(options.timeCommitment)
  const speakingPriority = options.learningStyle === "speaking"
  const shell = buildLessonShell("numbers-time", purposeTrack)

  const context = {
    work: {
      title: "Handle meeting times and deadlines",
      abilityObjective: "State meeting times and confirm deadlines at work.",
      vocabulary: [
        { german: "der Termin", english: "the appointment" },
        { german: "die Besprechung", english: "the meeting" },
        { german: "die Uhrzeit", english: "the time" },
        { german: "um ... Uhr", english: "at ... o'clock" },
        { german: "die Frist", english: "the deadline" },
        { german: "der Bericht", english: "the report" },
        { german: "pünktlich", english: "on time" },
        { german: "heute", english: "today" },
        { german: "morgen", english: "tomorrow" },
      ],
      dialogue: [
        { speaker: "Maria", german: "Wann ist die Besprechung?", english: "When is the meeting?" },
        { speaker: "Tom", german: "Um zehn Uhr. Bitte pünktlich.", english: "At ten o'clock. Please be on time." },
        { speaker: "Maria", german: "Die Frist ist am Freitag, oder?", english: "The deadline is on Friday, right?" },
      ],
      production: {
        prompt: "Roleplay: Schedule a meeting time and confirm a deadline in one or two sentences.",
        sampleAnswer: "Die Besprechung ist um 9 Uhr. Die Frist ist am Freitag.",
      },
      skillUnlock: "You can handle basic scheduling in a work context.",
      reviewSuggestion: "Say two meeting times out loud each morning.",
    },
    travel: {
      title: "Handle departure and arrival times",
      abilityObjective: "Ask about departure times and say when you arrive.",
      vocabulary: [
        { german: "der Zug", english: "the train" },
        { german: "die Abfahrt", english: "the departure" },
        { german: "die Ankunft", english: "the arrival" },
        { german: "das Ticket", english: "the ticket" },
        { german: "der Bahnsteig", english: "the platform" },
        { german: "um ... Uhr", english: "at ... o'clock" },
        { german: "heute", english: "today" },
        { german: "morgen", english: "tomorrow" },
      ],
      dialogue: [
        { speaker: "Reisende", german: "Wann fährt der Zug nach Berlin?", english: "When does the train to Berlin leave?" },
        { speaker: "Info", german: "Um 14 Uhr von Bahnsteig 3.", english: "At 2 pm from platform 3." },
        { speaker: "Reisende", german: "Danke. Wann kommt er an?", english: "Thanks. When does it arrive?" },
      ],
      production: {
        prompt: "Roleplay: Ask for a departure time and repeat it.",
        sampleAnswer: "Wann fährt der Zug? Um 14 Uhr.",
      },
      skillUnlock: "You can manage travel times for trains and buses.",
      reviewSuggestion: "Practice saying three times using 'um ... Uhr'.",
    },
    study: {
      title: "Handle lecture times and due dates",
      abilityObjective: "Say when a lecture starts and when work is due.",
      vocabulary: [
        { german: "die Vorlesung", english: "the lecture" },
        { german: "das Seminar", english: "the seminar" },
        { german: "die Prüfung", english: "the exam" },
        { german: "die Abgabe", english: "the submission" },
        { german: "der Raum", english: "the room" },
        { german: "um ... Uhr", english: "at ... o'clock" },
        { german: "heute", english: "today" },
        { german: "morgen", english: "tomorrow" },
      ],
      dialogue: [
        { speaker: "Student", german: "Wann beginnt die Vorlesung?", english: "When does the lecture start?" },
        { speaker: "Tutorin", german: "Um neun Uhr, Raum 2.", english: "At 9 o'clock, room 2." },
        { speaker: "Student", german: "Und die Abgabe?", english: "And the submission?" },
      ],
      production: {
        prompt: "Roleplay: Say when your lecture starts and when your homework is due.",
        sampleAnswer: "Die Vorlesung beginnt um 9 Uhr. Die Abgabe ist am Freitag.",
      },
      skillUnlock: "You can talk about class schedules and deadlines.",
      reviewSuggestion: "Say your weekly schedule in German once.",
    },
    relocation: {
      title: "Handle appointment times at offices",
      abilityObjective: "State an appointment time and confirm the day.",
      vocabulary: [
        { german: "der Termin", english: "the appointment" },
        { german: "das Bürgeramt", english: "the city office" },
        { german: "die Nummer", english: "the number" },
        { german: "die Wartezeit", english: "the waiting time" },
        { german: "um ... Uhr", english: "at ... o'clock" },
        { german: "heute", english: "today" },
        { german: "morgen", english: "tomorrow" },
      ],
      dialogue: [
        { speaker: "Kunde", german: "Mein Termin ist um elf Uhr.", english: "My appointment is at 11 o'clock." },
        { speaker: "Schalter", german: "Heute?", english: "Today?" },
        { speaker: "Kunde", german: "Ja, heute.", english: "Yes, today." },
      ],
      production: {
        prompt: "Roleplay: Confirm your appointment time at the office.",
        sampleAnswer: "Mein Termin ist um 10 Uhr. Heute.",
      },
      skillUnlock: "You can confirm appointment times at offices.",
      reviewSuggestion: "Practice saying your next real appointment time.",
    },
    exams: {
      title: "Handle exam timing and sections",
      abilityObjective: "Understand exam start times and time limits.",
      vocabulary: [
        { german: "die Prüfung", english: "the exam" },
        { german: "der Teil", english: "the section" },
        { german: "die Zeit", english: "the time" },
        { german: "die Minute", english: "the minute" },
        { german: "beginnen", english: "to begin" },
        { german: "abgeben", english: "to hand in" },
        { german: "um ... Uhr", english: "at ... o'clock" },
      ],
      dialogue: [
        { speaker: "Prüfer", german: "Die Prüfung beginnt um neun Uhr.", english: "The exam starts at 9 o'clock." },
        { speaker: "Prüfer", german: "Sie haben 30 Minuten.", english: "You have 30 minutes." },
        { speaker: "Kandidat", german: "Danke.", english: "Thank you." },
      ],
      production: {
        prompt: "Timed (60s): Write two sentences about when the exam starts and how long it lasts.",
        sampleAnswer: "Die Prüfung beginnt um neun Uhr. Sie dauert 30 Minuten.",
      },
      skillUnlock: "You can follow time instructions during an exam.",
      reviewSuggestion: "Practice saying 'beginnt um...' and 'dauert ... Minuten'.",
    },
    daily: {
      title: "Handle times for plans and errands",
      abilityObjective: "Say when you meet and when a place opens or closes.",
      vocabulary: [
        { german: "der Termin", english: "the appointment" },
        { german: "die Verabredung", english: "the plan/meet-up" },
        { german: "der Markt", english: "the market" },
        { german: "um ... Uhr", english: "at ... o'clock" },
        { german: "heute", english: "today" },
        { german: "morgen", english: "tomorrow" },
        { german: "pünktlich", english: "on time" },
      ],
      dialogue: [
        { speaker: "Nina", german: "Wann treffen wir uns?", english: "When do we meet?" },
        { speaker: "Tom", german: "Um sechs Uhr am Markt.", english: "At six o'clock at the market." },
        { speaker: "Nina", german: "Okay, ich bin pünktlich.", english: "Okay, I'll be on time." },
      ],
      production: {
        prompt: "Roleplay: Set a time to meet a friend.",
        sampleAnswer: "Wir treffen uns um 18 Uhr.",
      },
      skillUnlock: "You can plan simple meet-ups and appointments.",
      reviewSuggestion: "Say tomorrow's plans in German once.",
    },
  }[purposeTrack]

  const grammarPoints: GrammarPoint[] = [
    {
      rule: "Numbers after 20 are said 'backwards': einundzwanzig = 21.",
    },
    {
      rule: "Time: 'Es ist ... Uhr'. 'halb vier' means 3:30 (half to four).",
    },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Say time with 'um ... Uhr' and use 'halb' for :30.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "How do you say 9:30?",
      options: ["halb zehn", "halb neun", "viertel nach zehn", "neun Uhr"],
      answer: "halb zehn",
      explanation: "'Halb zehn' = 9:30 (half to ten).",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Die Besprechung ist um ___ Uhr.'",
      options: ["zehn", "zehnte", "zehnter", "zehnen"],
      answer: "zehn",
      explanation: "Use the number for the time: um zehn Uhr.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'The meeting starts at nine.'",
      words: ["Die", "Besprechung", "beginnt", "um", "neun", "Uhr", "."],
      answer: "Die Besprechung beginnt um neun Uhr.",
      explanation: "Verb in position 2: beginnt.",
    },
    {
      kind: "production",
      prompt: context.production.prompt,
      answer: "",
      sampleAnswer: context.production.sampleAnswer,
      mode: speakingPriority ? "speaking" : "writing",
      explanation: "Keep it short and clear.",
    },
  ]

  const content: LessonContent = {
    ...shell,
    title: context.title,
    abilityObjective: context.abilityObjective,
    grammarPoints: applyGrammarClarity(grammarPoints, options.learningStyle, grammarSummary),
    vocabulary: context.vocabulary,
    dialogue: context.dialogue,
    exercises,
    skillUnlock: context.skillUnlock,
    reviewSuggestion: context.reviewSuggestion,
    goal: context.abilityObjective,
    reviewHint: context.reviewSuggestion,
  }

  return applyBudget(content, short, speakingPriority)
}

function buildPersonalPronouns(options: LessonOptions): LessonContent {
  const purposeTrack = normalizePurpose(options.purpose)
  const short = isShortSession(options.timeCommitment)
  const speakingPriority = options.learningStyle === "speaking"
  const shell = buildLessonShell("personal-pronouns", purposeTrack)

  const context = {
    work: {
      title: "Address colleagues with the right formality",
      abilityObjective: "Use Sie and du correctly in a workplace introduction.",
      vocabulary: [
        { german: "Sie", english: "you (formal)" },
        { german: "du", english: "you (informal)" },
        { german: "wir", english: "we" },
        { german: "ihr", english: "you all (informal)" },
        { german: "der Kollege", english: "the colleague" },
        { german: "die Kollegin", english: "the colleague (f)" },
        { german: "das Team", english: "the team" },
        { german: "die Firma", english: "the company" },
      ],
      dialogue: [
        { speaker: "Manager", german: "Guten Tag. Wie heißen Sie?", english: "Good day. What is your name?" },
        { speaker: "Mia", german: "Ich heiße Mia. Freut mich.", english: "My name is Mia. Nice to meet you." },
        { speaker: "Manager", german: "Wir sind das Support-Team.", english: "We are the support team." },
      ],
      production: {
        prompt: "Roleplay: Greet a manager formally and respond with your name.",
        sampleAnswer: "Guten Tag. Ich heiße Mia. Freut mich.",
      },
      skillUnlock: "You can switch between Sie and du at work.",
      reviewSuggestion: "Practice two sentences with Sie and two with du.",
    },
    travel: {
      title: "Use polite address in travel situations",
      abilityObjective: "Use Sie when talking to staff and du with fellow travelers.",
      vocabulary: [
        { german: "Sie", english: "you (formal)" },
        { german: "du", english: "you (informal)" },
        { german: "der Fahrer", english: "the driver" },
        { german: "die Rezeption", english: "the reception" },
        { german: "wir", english: "we" },
        { german: "ihr", english: "you all (informal)" },
      ],
      dialogue: [
        { speaker: "Reisende", german: "Sprechen Sie Englisch?", english: "Do you speak English?" },
        { speaker: "Mitarbeiter", german: "Ein bisschen. Wie kann ich Ihnen helfen?", english: "A little. How can I help you?" },
        { speaker: "Reisende", german: "Danke. Und du, kommst du auch?", english: "Thanks. And you, are you coming too?" },
      ],
      production: {
        prompt: "Roleplay: Ask a staff member a question using Sie.",
        sampleAnswer: "Entschuldigung, sprechen Sie Englisch?",
      },
      skillUnlock: "You can be polite with staff and casual with peers.",
      reviewSuggestion: "Say one travel question with Sie and one with du.",
    },
    study: {
      title: "Use du and Sie in university life",
      abilityObjective: "Use du with classmates and Sie with professors.",
      vocabulary: [
        { german: "du", english: "you (informal)" },
        { german: "Sie", english: "you (formal)" },
        { german: "der Professor", english: "the professor" },
        { german: "die Professorin", english: "the professor (f)" },
        { german: "der Student", english: "the student" },
        { german: "wir", english: "we" },
      ],
      dialogue: [
        { speaker: "Student", german: "Bist du auch im Seminar?", english: "Are you also in the seminar?" },
        { speaker: "Lea", german: "Ja, ich bin hier. Und Sie, Herr Weber?", english: "Yes, I'm here. And you, Mr. Weber?" },
        { speaker: "Professor", german: "Ich bin Ihr Professor.", english: "I am your professor." },
      ],
      production: {
        prompt: "Roleplay: Ask a classmate a question with du.",
        sampleAnswer: "Bist du auch im Kurs?",
      },
      skillUnlock: "You can choose the right form in academic settings.",
      reviewSuggestion: "Write one sentence to a professor with Sie.",
    },
    relocation: {
      title: "Use formal address in official settings",
      abilityObjective: "Use Sie when speaking to officials.",
      vocabulary: [
        { german: "Sie", english: "you (formal)" },
        { german: "du", english: "you (informal)" },
        { german: "der Beamte", english: "the official" },
        { german: "das Bürgeramt", english: "the city office" },
        { german: "wir", english: "we" },
      ],
      dialogue: [
        { speaker: "Kunde", german: "Können Sie mir helfen?", english: "Can you help me?" },
        { speaker: "Beamter", german: "Ja, gern. Was brauchen Sie?", english: "Yes, gladly. What do you need?" },
        { speaker: "Kunde", german: "Danke.", english: "Thank you." },
      ],
      production: {
        prompt: "Roleplay: Ask for help at the Bürgeramt using Sie.",
        sampleAnswer: "Können Sie mir helfen?",
      },
      skillUnlock: "You can address officials politely and correctly.",
      reviewSuggestion: "Practice a polite request with Sie once.",
    },
    exams: {
      title: "Use Sie in exam speaking tasks",
      abilityObjective: "Use formal address with the examiner.",
      vocabulary: [
        { german: "Sie", english: "you (formal)" },
        { german: "du", english: "you (informal)" },
        { german: "der Prüfer", english: "the examiner" },
        { german: "die Prüfung", english: "the exam" },
        { german: "wir", english: "we" },
      ],
      dialogue: [
        { speaker: "Prüfer", german: "Wie heißen Sie?", english: "What is your name?" },
        { speaker: "Kandidat", german: "Ich heiße Amir.", english: "My name is Amir." },
        { speaker: "Prüfer", german: "Danke.", english: "Thank you." },
      ],
      production: {
        prompt: "Timed (30s): Answer a formal question from the examiner using Sie.",
        sampleAnswer: "Ich heiße Amir. Ich komme aus Ägypten.",
      },
      skillUnlock: "You can respond formally in exam settings.",
      reviewSuggestion: "Practice two short answers using Sie.",
    },
    daily: {
      title: "Use du and Sie in everyday life",
      abilityObjective: "Use du with friends and Sie with strangers.",
      vocabulary: [
        { german: "du", english: "you (informal)" },
        { german: "Sie", english: "you (formal)" },
        { german: "der Nachbar", english: "the neighbor" },
        { german: "die Verkäuferin", english: "the shop assistant" },
        { german: "wir", english: "we" },
      ],
      dialogue: [
        { speaker: "Freund", german: "Wie geht's dir?", english: "How are you?" },
        { speaker: "Kunde", german: "Können Sie mir helfen?", english: "Can you help me?" },
        { speaker: "Verkäuferin", german: "Ja, gern.", english: "Yes, gladly." },
      ],
      production: {
        prompt: "Roleplay: Say hello to a friend using du.",
        sampleAnswer: "Hallo! Wie geht's dir?",
      },
      skillUnlock: "You can choose the right form in daily situations.",
      reviewSuggestion: "Say one sentence with du and one with Sie each day.",
    },
  }[purposeTrack]

  const grammarPoints: GrammarPoint[] = [
    {
      rule: "German has formal and informal 'you': Sie (formal) and du (informal).",
      table: {
        headers: ["Pronoun", "English", "Use"],
        rows: [
          ["du", "you (informal)", "friends, family"],
          ["Sie", "you (formal)", "strangers, work"],
          ["ihr", "you all (informal)", "group of friends"],
        ],
      },
    },
    { rule: "Pronouns replace names: ich, du, er/sie/es, wir, ihr, sie, Sie." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Use Sie + verb plural (Sie sind). Use du + verb singular (du bist).",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Your manager asks your name. Which pronoun applies?",
      options: ["Sie", "du", "ihr", "wir"],
      answer: "Sie",
      explanation: "Use Sie in formal contexts.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: '___ sind neu hier.' (formal)",
      options: ["Sie", "du", "ihr", "wir"],
      answer: "Sie",
      explanation: "Formal you takes Sie + sind.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'We are in the team.'",
      words: ["Wir", "sind", "im", "Team", "."],
      answer: "Wir sind im Team.",
      explanation: "Verb in position 2.",
    },
    {
      kind: "production",
      prompt: context.production.prompt,
      answer: "",
      sampleAnswer: context.production.sampleAnswer,
      mode: speakingPriority ? "speaking" : "writing",
      explanation: "Use du or Sie correctly.",
    },
  ]

  const content: LessonContent = {
    ...shell,
    title: context.title,
    abilityObjective: context.abilityObjective,
    grammarPoints: applyGrammarClarity(grammarPoints, options.learningStyle, grammarSummary),
    vocabulary: context.vocabulary,
    dialogue: context.dialogue,
    exercises,
    skillUnlock: context.skillUnlock,
    reviewSuggestion: context.reviewSuggestion,
    goal: context.abilityObjective,
    reviewHint: context.reviewSuggestion,
  }

  return applyBudget(content, short, speakingPriority)
}

function buildArticlesGender(options: LessonOptions): LessonContent {
  const purposeTrack = normalizePurpose(options.purpose)
  const short = isShortSession(options.timeCommitment)
  const speakingPriority = options.learningStyle === "speaking"
  const shell = buildLessonShell("articles-gender", purposeTrack)

  const context = {
    work: {
      title: "Name office items with correct articles",
      abilityObjective: "Name common office items with the right article.",
      vocabulary: [
        { german: "der Computer", english: "the computer" },
        { german: "das Büro", english: "the office" },
        { german: "die E-Mail", english: "the email" },
        { german: "der Bericht", english: "the report" },
        { german: "die Aufgabe", english: "the task" },
        { german: "das Meeting", english: "the meeting" },
        { german: "die Datei", english: "the file" },
        { german: "der Stuhl", english: "the chair" },
      ],
      dialogue: [
        { speaker: "Mia", german: "Ist das der Computer?", english: "Is that the computer?" },
        { speaker: "Tom", german: "Nein, das ist der Drucker.", english: "No, that is the printer." },
        { speaker: "Mia", german: "Und die Datei?", english: "And the file?" },
      ],
      production: {
        prompt: "Roleplay: Name three office items with articles.",
        sampleAnswer: "der Computer, das Büro, die E-Mail",
      },
      skillUnlock: "You can label common office items correctly.",
      reviewSuggestion: "Point at 5 items in your workspace and say the article.",
    },
    travel: {
      title: "Name travel items with correct articles",
      abilityObjective: "Name common travel items with the right article.",
      vocabulary: [
        { german: "der Koffer", english: "the suitcase" },
        { german: "das Ticket", english: "the ticket" },
        { german: "die Reservierung", english: "the reservation" },
        { german: "das Zimmer", english: "the room" },
        { german: "der Zug", english: "the train" },
        { german: "die Straße", english: "the street" },
        { german: "die Karte", english: "the map" },
      ],
      dialogue: [
        { speaker: "Gast", german: "Ist das das Zimmer 12?", english: "Is that room 12?" },
        { speaker: "Rezeption", german: "Ja, das ist das Zimmer.", english: "Yes, that is the room." },
        { speaker: "Gast", german: "Wo ist der Koffer?", english: "Where is the suitcase?" },
      ],
      production: {
        prompt: "Roleplay: Say two travel items with articles.",
        sampleAnswer: "das Ticket, der Koffer",
      },
      skillUnlock: "You can name travel items with correct articles.",
      reviewSuggestion: "Say the articles of 5 items in your luggage.",
    },
    study: {
      title: "Name study items with correct articles",
      abilityObjective: "Name common study items with the right article.",
      vocabulary: [
        { german: "das Buch", english: "the book" },
        { german: "die Universität", english: "the university" },
        { german: "der Student", english: "the student" },
        { german: "die Prüfung", english: "the exam" },
        { german: "das Heft", english: "the notebook" },
        { german: "der Stift", english: "the pen" },
        { german: "die Vorlesung", english: "the lecture" },
      ],
      dialogue: [
        { speaker: "Lea", german: "Wo ist das Buch?", english: "Where is the book?" },
        { speaker: "Amir", german: "Das Buch ist in der Tasche.", english: "The book is in the bag." },
        { speaker: "Lea", german: "Danke.", english: "Thanks." },
      ],
      production: {
        prompt: "Roleplay: Name three study items with articles.",
        sampleAnswer: "das Buch, der Stift, die Prüfung",
      },
      skillUnlock: "You can label basic study items correctly.",
      reviewSuggestion: "Label three items on your desk in German.",
    },
    relocation: {
      title: "Name housing items with correct articles",
      abilityObjective: "Name common housing items with the right article.",
      vocabulary: [
        { german: "die Wohnung", english: "the apartment" },
        { german: "das Bad", english: "the bathroom" },
        { german: "die Küche", english: "the kitchen" },
        { german: "der Vertrag", english: "the contract" },
        { german: "der Schlüssel", english: "the key" },
        { german: "das Formular", english: "the form" },
      ],
      dialogue: [
        { speaker: "Vermieter", german: "Hier ist der Schlüssel.", english: "Here is the key." },
        { speaker: "Mieter", german: "Danke. Wo ist das Bad?", english: "Thanks. Where is the bathroom?" },
        { speaker: "Vermieter", german: "Das Bad ist links.", english: "The bathroom is on the left." },
      ],
      production: {
        prompt: "Roleplay: Say two housing items with articles.",
        sampleAnswer: "die Wohnung, der Schlüssel",
      },
      skillUnlock: "You can name basic housing items with articles.",
      reviewSuggestion: "Say the articles of 5 items in your new home.",
    },
    exams: {
      title: "Name exam materials with correct articles",
      abilityObjective: "Name common exam materials with the right article.",
      vocabulary: [
        { german: "die Prüfung", english: "the exam" },
        { german: "der Teil", english: "the section" },
        { german: "das Blatt", english: "the sheet" },
        { german: "der Stift", english: "the pen" },
        { german: "die Aufgabe", english: "the task" },
        { german: "die Zeit", english: "the time" },
      ],
      dialogue: [
        { speaker: "Prüfer", german: "Hier ist das Blatt.", english: "Here is the sheet." },
        { speaker: "Kandidat", german: "Danke. Wo ist die Aufgabe 1?", english: "Thanks. Where is task 1?" },
        { speaker: "Prüfer", german: "Oben auf dem Blatt.", english: "At the top of the sheet." },
      ],
      production: {
        prompt: "Timed (30s): Name two exam items with articles.",
        sampleAnswer: "die Prüfung, der Stift",
      },
      skillUnlock: "You can identify exam items with articles.",
      reviewSuggestion: "List three exam items with articles from memory.",
    },
    daily: {
      title: "Name everyday items with correct articles",
      abilityObjective: "Name common daily items with the right article.",
      vocabulary: [
        { german: "der Tisch", english: "the table" },
        { german: "die Tasche", english: "the bag" },
        { german: "das Handy", english: "the phone" },
        { german: "die Straße", english: "the street" },
        { german: "das Brot", english: "the bread" },
        { german: "der Bus", english: "the bus" },
      ],
      dialogue: [
        { speaker: "Nina", german: "Wo ist das Handy?", english: "Where is the phone?" },
        { speaker: "Tom", german: "Das Handy ist auf dem Tisch.", english: "The phone is on the table." },
        { speaker: "Nina", german: "Danke.", english: "Thanks." },
      ],
      production: {
        prompt: "Roleplay: Name three items in your room with articles.",
        sampleAnswer: "der Tisch, die Tasche, das Handy",
      },
      skillUnlock: "You can label everyday objects correctly.",
      reviewSuggestion: "Pick five items and say their articles aloud.",
    },
  }[purposeTrack]

  const grammarPoints: GrammarPoint[] = [
    {
      rule: "Every noun has a gender: der (masculine), die (feminine), das (neuter).",
      table: {
        headers: ["Gender", "Article", "Example"],
        rows: [
          ["Masculine", "der", "der Tisch"],
          ["Feminine", "die", "die Tasche"],
          ["Neuter", "das", "das Handy"],
        ],
      },
    },
    { rule: "Learn the article with each noun. Plural is always 'die'." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: der/die/das are part of the noun. Say them together every time.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Which article fits 'Buch'?",
      options: ["das", "der", "die", "den"],
      answer: "das",
      explanation: "das Buch is neuter.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: '___ Tasche ist neu.'",
      options: ["Die", "Der", "Das", "Den"],
      answer: "Die",
      explanation: "die Tasche is feminine.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'The key is here.'",
      words: ["Der", "Schlüssel", "ist", "hier", "."],
      answer: "Der Schlüssel ist hier.",
      explanation: "Verb in position 2.",
    },
    {
      kind: "production",
      prompt: context.production.prompt,
      answer: "",
      sampleAnswer: context.production.sampleAnswer,
      mode: speakingPriority ? "speaking" : "writing",
      explanation: "Say the article with the noun.",
    },
  ]

  const content: LessonContent = {
    ...shell,
    title: context.title,
    abilityObjective: context.abilityObjective,
    grammarPoints: applyGrammarClarity(grammarPoints, options.learningStyle, grammarSummary),
    vocabulary: context.vocabulary,
    dialogue: context.dialogue,
    exercises,
    skillUnlock: context.skillUnlock,
    reviewSuggestion: context.reviewSuggestion,
    goal: context.abilityObjective,
    reviewHint: context.reviewSuggestion,
  }

  return applyBudget(content, short, speakingPriority)
}

function buildPresentTense(options: LessonOptions): LessonContent {
  const purposeTrack = normalizePurpose(options.purpose)
  const short = isShortSession(options.timeCommitment)
  const speakingPriority = options.learningStyle === "speaking"
  const shell = buildLessonShell("present-tense", purposeTrack)

  const context = {
    work: {
      title: "Describe your work routine",
      abilityObjective: "Describe simple work tasks in the present tense.",
      vocabulary: [
        { german: "arbeiten", english: "to work" },
        { german: "schreiben", english: "to write" },
        { german: "lesen", english: "to read" },
        { german: "planen", english: "to plan" },
        { german: "das Projekt", english: "the project" },
        { german: "die E-Mail", english: "the email" },
        { german: "der Bericht", english: "the report" },
      ],
      dialogue: [
        { speaker: "Mia", german: "Ich arbeite heute im Büro.", english: "I work in the office today." },
        { speaker: "Tom", german: "Ich schreibe einen Bericht.", english: "I write a report." },
        { speaker: "Mia", german: "Ich lese die E-Mails.", english: "I read the emails." },
      ],
      production: {
        prompt: "Roleplay: Say two sentences about what you do at work today.",
        sampleAnswer: "Ich arbeite im Büro. Ich schreibe E-Mails.",
      },
      skillUnlock: "You can describe your daily work tasks.",
      reviewSuggestion: "Say three work actions out loud each morning.",
    },
    travel: {
      title: "Describe your travel plans",
      abilityObjective: "Describe simple travel actions in the present tense.",
      vocabulary: [
        { german: "fahren", english: "to travel/go" },
        { german: "gehen", english: "to go" },
        { german: "bleiben", english: "to stay" },
        { german: "kaufen", english: "to buy" },
        { german: "das Ticket", english: "the ticket" },
        { german: "das Hotel", english: "the hotel" },
      ],
      dialogue: [
        { speaker: "Reisende", german: "Ich fahre nach Berlin.", english: "I travel to Berlin." },
        { speaker: "Reisende", german: "Ich kaufe ein Ticket.", english: "I buy a ticket." },
        { speaker: "Reisende", german: "Ich bleibe im Hotel.", english: "I stay in the hotel." },
      ],
      production: {
        prompt: "Roleplay: Say two sentences about your travel day.",
        sampleAnswer: "Ich fahre nach Hamburg. Ich kaufe ein Ticket.",
      },
      skillUnlock: "You can describe travel actions in simple sentences.",
      reviewSuggestion: "Say your next travel plan in German.",
    },
    study: {
      title: "Describe your study routine",
      abilityObjective: "Describe simple study actions in the present tense.",
      vocabulary: [
        { german: "lernen", english: "to learn" },
        { german: "lesen", english: "to read" },
        { german: "schreiben", english: "to write" },
        { german: "die Aufgabe", english: "the assignment" },
        { german: "das Buch", english: "the book" },
        { german: "die Prüfung", english: "the exam" },
      ],
      dialogue: [
        { speaker: "Lea", german: "Ich lerne Deutsch.", english: "I learn German." },
        { speaker: "Lea", german: "Ich lese das Buch.", english: "I read the book." },
        { speaker: "Lea", german: "Ich schreibe die Aufgabe.", english: "I write the assignment." },
      ],
      production: {
        prompt: "Roleplay: Say two sentences about how you study today.",
        sampleAnswer: "Ich lerne Deutsch. Ich lese das Buch.",
      },
      skillUnlock: "You can describe your study routine.",
      reviewSuggestion: "Write 3 present-tense study sentences.",
    },
    relocation: {
      title: "Describe relocation tasks",
      abilityObjective: "Describe simple relocation tasks in the present tense.",
      vocabulary: [
        { german: "wohnen", english: "to live" },
        { german: "suchen", english: "to look for" },
        { german: "brauchen", english: "to need" },
        { german: "das Formular", english: "the form" },
        { german: "die Adresse", english: "the address" },
        { german: "der Vertrag", english: "the contract" },
      ],
      dialogue: [
        { speaker: "Omar", german: "Ich wohne in Berlin.", english: "I live in Berlin." },
        { speaker: "Omar", german: "Ich suche eine Wohnung.", english: "I look for an apartment." },
        { speaker: "Omar", german: "Ich brauche das Formular.", english: "I need the form." },
      ],
      production: {
        prompt: "Roleplay: Say two relocation tasks you do today.",
        sampleAnswer: "Ich suche eine Wohnung. Ich brauche den Vertrag.",
      },
      skillUnlock: "You can talk about basic relocation tasks.",
      reviewSuggestion: "Say two things you need for Anmeldung.",
    },
    exams: {
      title: "Describe your exam routine",
      abilityObjective: "Describe simple exam actions in the present tense.",
      vocabulary: [
        { german: "lernen", english: "to learn" },
        { german: "schreiben", english: "to write" },
        { german: "üben", english: "to practice" },
        { german: "die Prüfung", english: "the exam" },
        { german: "die Aufgabe", english: "the task" },
      ],
      dialogue: [
        { speaker: "Kandidat", german: "Ich lerne für die Prüfung.", english: "I study for the exam." },
        { speaker: "Kandidat", german: "Ich übe jeden Tag.", english: "I practice every day." },
        { speaker: "Kandidat", german: "Ich schreibe die Aufgabe.", english: "I write the task." },
      ],
      production: {
        prompt: "Timed (45s): Say two sentences about your exam routine.",
        sampleAnswer: "Ich lerne jeden Tag. Ich übe die Aufgaben.",
      },
      skillUnlock: "You can describe exam prep in simple sentences.",
      reviewSuggestion: "Say your exam routine before study time.",
    },
    daily: {
      title: "Describe your daily routine",
      abilityObjective: "Describe simple daily actions in the present tense.",
      vocabulary: [
        { german: "gehen", english: "to go" },
        { german: "machen", english: "to do" },
        { german: "kaufen", english: "to buy" },
        { german: "essen", english: "to eat" },
        { german: "arbeiten", english: "to work" },
        { german: "die Arbeit", english: "the work" },
      ],
      dialogue: [
        { speaker: "Nina", german: "Ich gehe einkaufen.", english: "I go shopping." },
        { speaker: "Nina", german: "Ich mache Sport.", english: "I do sports." },
        { speaker: "Nina", german: "Ich esse zu Hause.", english: "I eat at home." },
      ],
      production: {
        prompt: "Roleplay: Say two sentences about your daily routine.",
        sampleAnswer: "Ich arbeite heute. Ich kaufe Brot.",
      },
      skillUnlock: "You can describe daily routines.",
      reviewSuggestion: "Say three daily actions before bed.",
    },
  }[purposeTrack]

  const grammarPoints: GrammarPoint[] = [
    {
      rule: "Present tense endings: -e, -st, -t, -en, -t, -en.",
      table: {
        headers: ["Person", "machen"],
        rows: [
          ["ich", "mache"],
          ["du", "machst"],
          ["er/sie/es", "macht"],
          ["wir", "machen"],
          ["ihr", "macht"],
          ["sie/Sie", "machen"],
        ],
      },
    },
    { rule: "Some verbs change vowels in du/er: lesen -> du liest, er liest." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Verb in position 2 and the ending matches the subject.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct form: 'ich ___ arbeite'",
      options: ["arbeite", "arbeitest", "arbeitet", "arbeiten"],
      answer: "arbeite",
      explanation: "ich + -e ending.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Er ___ eine E-Mail.' (schreiben)",
      options: ["schreibt", "schreibe", "schreiben", "schreibst"],
      answer: "schreibt",
      explanation: "er/sie/es takes -t.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I read the report.'",
      words: ["Ich", "lese", "den", "Bericht", "."],
      answer: "Ich lese den Bericht.",
      explanation: "Verb in position 2.",
    },
    {
      kind: "production",
      prompt: context.production.prompt,
      answer: "",
      sampleAnswer: context.production.sampleAnswer,
      mode: speakingPriority ? "speaking" : "writing",
      explanation: "Use present tense verbs.",
    },
  ]

  const content: LessonContent = {
    ...shell,
    title: context.title,
    abilityObjective: context.abilityObjective,
    grammarPoints: applyGrammarClarity(grammarPoints, options.learningStyle, grammarSummary),
    vocabulary: context.vocabulary,
    dialogue: context.dialogue,
    exercises,
    skillUnlock: context.skillUnlock,
    reviewSuggestion: context.reviewSuggestion,
    goal: context.abilityObjective,
    reviewHint: context.reviewSuggestion,
  }

  return applyBudget(content, short, speakingPriority)
}

function buildEverydayPhrases(options: LessonOptions): LessonContent {
  const purposeTrack = normalizePurpose(options.purpose)
  const short = isShortSession(options.timeCommitment)
  const speakingPriority = options.learningStyle === "speaking"
  const shell = buildLessonShell("everyday-phrases", purposeTrack)

  const context = {
    work: {
      title: "Make polite requests at work",
      abilityObjective: "Make simple polite requests and ask for help at work.",
      vocabulary: [
        { german: "Entschuldigung", english: "Excuse me" },
        { german: "bitte", english: "please" },
        { german: "danke", english: "thank you" },
        { german: "Können Sie...?", english: "Can you...? (formal)" },
        { german: "Ich brauche...", english: "I need..." },
        { german: "die Hilfe", english: "the help" },
        { german: "die E-Mail", english: "the email" },
      ],
      dialogue: [
        { speaker: "Mia", german: "Entschuldigung, können Sie mir helfen?", english: "Excuse me, can you help me?" },
        { speaker: "Tom", german: "Ja, gern.", english: "Yes, gladly." },
        { speaker: "Mia", german: "Danke!", english: "Thank you!" },
      ],
      production: {
        prompt: "Roleplay: Ask a colleague for help politely.",
        sampleAnswer: "Entschuldigung, können Sie mir helfen?",
      },
      skillUnlock: "You can make polite requests in a formal workplace.",
      reviewSuggestion: "Say your go-to polite request three times.",
    },
    travel: {
      title: "Make polite requests while traveling",
      abilityObjective: "Ask for help and order politely while traveling.",
      vocabulary: [
        { german: "Entschuldigung", english: "Excuse me" },
        { german: "bitte", english: "please" },
        { german: "danke", english: "thank you" },
        { german: "Ich hätte gern...", english: "I would like..." },
        { german: "Wo ist...?", english: "Where is...?" },
        { german: "die Rechnung", english: "the bill" },
      ],
      dialogue: [
        { speaker: "Gast", german: "Ich hätte gern ein Wasser, bitte.", english: "I would like a water, please." },
        { speaker: "Kellner", german: "Gern. Noch etwas?", english: "Sure. Anything else?" },
        { speaker: "Gast", german: "Die Rechnung, bitte.", english: "The bill, please." },
      ],
      production: {
        prompt: "Roleplay: Order a drink and ask for the bill.",
        sampleAnswer: "Ich hätte gern ein Wasser. Die Rechnung, bitte.",
      },
      skillUnlock: "You can order and ask for help politely while traveling.",
      reviewSuggestion: "Practice your order with a timer (20 seconds).",
    },
    study: {
      title: "Make polite requests in class",
      abilityObjective: "Ask for clarification and help politely in class.",
      vocabulary: [
        { german: "Entschuldigung", english: "Excuse me" },
        { german: "bitte", english: "please" },
        { german: "Können Sie...?", english: "Can you...? (formal)" },
        { german: "Ich verstehe nicht", english: "I don't understand" },
        { german: "wiederholen", english: "to repeat" },
        { german: "die Frage", english: "the question" },
      ],
      dialogue: [
        { speaker: "Student", german: "Entschuldigung, können Sie das wiederholen?", english: "Excuse me, can you repeat that?" },
        { speaker: "Lehrer", german: "Ja, natürlich.", english: "Yes, of course." },
        { speaker: "Student", german: "Danke.", english: "Thank you." },
      ],
      production: {
        prompt: "Roleplay: Ask a teacher to repeat something.",
        sampleAnswer: "Können Sie das bitte wiederholen?",
      },
      skillUnlock: "You can ask for clarification politely in class.",
      reviewSuggestion: "Practice two polite classroom questions.",
    },
    relocation: {
      title: "Make polite requests in offices",
      abilityObjective: "Ask for help politely at offices and appointments.",
      vocabulary: [
        { german: "Entschuldigung", english: "Excuse me" },
        { german: "bitte", english: "please" },
        { german: "Können Sie...?", english: "Can you...? (formal)" },
        { german: "das Formular", english: "the form" },
        { german: "die Anmeldung", english: "the registration" },
        { german: "die Hilfe", english: "the help" },
      ],
      dialogue: [
        { speaker: "Kunde", german: "Entschuldigung, können Sie mir helfen?", english: "Excuse me, can you help me?" },
        { speaker: "Beamter", german: "Ja, gern. Worum geht es?", english: "Yes, gladly. What is it about?" },
        { speaker: "Kunde", german: "Es geht um die Anmeldung.", english: "It's about the registration." },
      ],
      production: {
        prompt: "Roleplay: Ask for help with a form at the office.",
        sampleAnswer: "Können Sie mir beim Formular helfen, bitte?",
      },
      skillUnlock: "You can ask for help in formal offices.",
      reviewSuggestion: "Practice one polite office request daily.",
    },
    exams: {
      title: "Make polite requests in exam tasks",
      abilityObjective: "Ask for clarification politely during exam tasks.",
      vocabulary: [
        { german: "Entschuldigung", english: "Excuse me" },
        { german: "bitte", english: "please" },
        { german: "Können Sie...?", english: "Can you...? (formal)" },
        { german: "die Frage", english: "the question" },
        { german: "die Zeit", english: "the time" },
      ],
      dialogue: [
        { speaker: "Kandidat", german: "Entschuldigung, können Sie die Frage wiederholen?", english: "Excuse me, can you repeat the question?" },
        { speaker: "Prüfer", german: "Ja, gern.", english: "Yes, gladly." },
        { speaker: "Kandidat", german: "Danke.", english: "Thank you." },
      ],
      production: {
        prompt: "Timed (30s): Ask the examiner to repeat a question.",
        sampleAnswer: "Können Sie die Frage bitte wiederholen?",
      },
      skillUnlock: "You can ask for clarification in exam conditions.",
      reviewSuggestion: "Practice your exam request aloud twice.",
    },
    daily: {
      title: "Make polite requests in daily life",
      abilityObjective: "Ask for help and order politely in daily life.",
      vocabulary: [
        { german: "Entschuldigung", english: "Excuse me" },
        { german: "bitte", english: "please" },
        { german: "danke", english: "thank you" },
        { german: "Ich hätte gern...", english: "I would like..." },
        { german: "Wo ist...?", english: "Where is...?" },
        { german: "die Rechnung", english: "the bill" },
      ],
      dialogue: [
        { speaker: "Kunde", german: "Ich hätte gern ein Brot, bitte.", english: "I would like a bread, please." },
        { speaker: "Verkäufer", german: "Gern.", english: "Sure." },
        { speaker: "Kunde", german: "Danke.", english: "Thank you." },
      ],
      production: {
        prompt: "Roleplay: Order something politely.",
        sampleAnswer: "Ich hätte gern einen Kaffee, bitte.",
      },
      skillUnlock: "You can make polite requests in everyday situations.",
      reviewSuggestion: "Use one polite request in German today.",
    },
  }[purposeTrack]

  const grammarPoints: GrammarPoint[] = [
    { rule: "Polite requests: 'Können Sie...?' or 'Ich hätte gern...'." },
    { rule: "Add 'bitte' for extra politeness." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: 'Können Sie...?' is formal. 'Ich hätte gern...' is polite ordering.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the polite request.",
      options: ["Ich hätte gern ein Wasser, bitte.", "Gib mir Wasser!", "Ich will Wasser.", "Wasser, jetzt!"],
      answer: "Ich hätte gern ein Wasser, bitte.",
      explanation: "Use 'Ich hätte gern' + bitte.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Entschuldigung, ___ Sie mir helfen?'",
      options: ["können", "kann", "kannst", "könnt"],
      answer: "können",
      explanation: "Formal: Können Sie...",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'The bill, please.'",
      words: ["Die", "Rechnung", ",", "bitte", "."],
      answer: "Die Rechnung, bitte.",
      explanation: "Common polite request.",
    },
    {
      kind: "production",
      prompt: context.production.prompt,
      answer: "",
      sampleAnswer: context.production.sampleAnswer,
      mode: speakingPriority ? "speaking" : "writing",
      explanation: "Keep it polite and short.",
    },
  ]

  const content: LessonContent = {
    ...shell,
    title: context.title,
    abilityObjective: context.abilityObjective,
    grammarPoints: applyGrammarClarity(grammarPoints, options.learningStyle, grammarSummary),
    vocabulary: context.vocabulary,
    dialogue: context.dialogue,
    exercises,
    skillUnlock: context.skillUnlock,
    reviewSuggestion: context.reviewSuggestion,
    goal: context.abilityObjective,
    reviewHint: context.reviewSuggestion,
  }

  return applyBudget(content, short, speakingPriority)
}

function buildNegation(options: LessonOptions): LessonContent {
  const purposeTrack = normalizePurpose(options.purpose)
  const short = isShortSession(options.timeCommitment)
  const speakingPriority = options.learningStyle === "speaking"
  const shell = buildLessonShell("negation", purposeTrack)

  const context = {
    work: {
      title: "Say what you do not have at work",
      abilityObjective: "Say what you don't have or don't do at work.",
      vocabulary: [
        { german: "nicht", english: "not" },
        { german: "kein", english: "no / not a" },
        { german: "die Zeit", english: "the time" },
        { german: "der Bericht", english: "the report" },
        { german: "die Aufgabe", english: "the task" },
        { german: "heute", english: "today" },
      ],
      dialogue: [
        { speaker: "Mia", german: "Ich habe heute keine Zeit.", english: "I have no time today." },
        { speaker: "Tom", german: "Kein Problem.", english: "No problem." },
        { speaker: "Mia", german: "Ich mache den Bericht nicht heute.", english: "I don't do the report today." },
      ],
      production: {
        prompt: "Roleplay: Say one thing you don't have and one thing you don't do at work.",
        sampleAnswer: "Ich habe keine Zeit. Ich schreibe den Bericht nicht heute.",
      },
      skillUnlock: "You can express simple negatives at work.",
      reviewSuggestion: "Make two negative sentences about your tasks.",
    },
    travel: {
      title: "Say what you do not have while traveling",
      abilityObjective: "Say what you don't have or don't need while traveling.",
      vocabulary: [
        { german: "nicht", english: "not" },
        { german: "kein", english: "no / not a" },
        { german: "das Ticket", english: "the ticket" },
        { german: "die Reservierung", english: "the reservation" },
        { german: "heute", english: "today" },
      ],
      dialogue: [
        { speaker: "Reisende", german: "Ich habe kein Ticket.", english: "I have no ticket." },
        { speaker: "Mitarbeiter", german: "Kein Problem.", english: "No problem." },
        { speaker: "Reisende", german: "Ich brauche das nicht heute.", english: "I don't need that today." },
      ],
      production: {
        prompt: "Roleplay: Say what you don't have and what you don't need.",
        sampleAnswer: "Ich habe kein Ticket. Ich brauche das nicht.",
      },
      skillUnlock: "You can say what is missing during travel.",
      reviewSuggestion: "Practice 'kein' with three travel items.",
    },
    study: {
      title: "Say what you do not have for class",
      abilityObjective: "Say what you don't have or don't understand in class.",
      vocabulary: [
        { german: "nicht", english: "not" },
        { german: "kein", english: "no / not a" },
        { german: "das Buch", english: "the book" },
        { german: "die Aufgabe", english: "the assignment" },
        { german: "die Zeit", english: "the time" },
      ],
      dialogue: [
        { speaker: "Student", german: "Ich habe kein Buch.", english: "I have no book." },
        { speaker: "Lea", german: "Ich verstehe das nicht.", english: "I don't understand that." },
        { speaker: "Student", german: "Ich mache die Aufgabe nicht heute.", english: "I don't do the assignment today." },
      ],
      production: {
        prompt: "Roleplay: Say what you don't have and what you don't understand.",
        sampleAnswer: "Ich habe kein Buch. Ich verstehe das nicht.",
      },
      skillUnlock: "You can express simple negatives in class.",
      reviewSuggestion: "Write two negative class sentences.",
    },
    relocation: {
      title: "Say what you do not have for appointments",
      abilityObjective: "Say what you don't have or don't need for an appointment.",
      vocabulary: [
        { german: "nicht", english: "not" },
        { german: "kein", english: "no / not a" },
        { german: "das Formular", english: "the form" },
        { german: "der Ausweis", english: "the ID" },
        { german: "die Zeit", english: "the time" },
      ],
      dialogue: [
        { speaker: "Kunde", german: "Ich habe kein Formular.", english: "I have no form." },
        { speaker: "Beamter", german: "Kein Problem.", english: "No problem." },
        { speaker: "Kunde", german: "Ich brauche den Ausweis nicht heute.", english: "I don't need the ID today." },
      ],
      production: {
        prompt: "Roleplay: Say what you don't have for the appointment.",
        sampleAnswer: "Ich habe kein Formular.",
      },
      skillUnlock: "You can state missing documents clearly.",
      reviewSuggestion: "Practice 'kein' with two office items.",
    },
    exams: {
      title: "Say what you do not know in exams",
      abilityObjective: "Say what you don't know or don't have in an exam.",
      vocabulary: [
        { german: "nicht", english: "not" },
        { german: "kein", english: "no / not a" },
        { german: "die Antwort", english: "the answer" },
        { german: "die Zeit", english: "the time" },
        { german: "die Aufgabe", english: "the task" },
      ],
      dialogue: [
        { speaker: "Kandidat", german: "Ich habe keine Antwort.", english: "I have no answer." },
        { speaker: "Kandidat", german: "Ich verstehe das nicht.", english: "I don't understand that." },
        { speaker: "Kandidat", german: "Ich habe keine Zeit.", english: "I have no time." },
      ],
      production: {
        prompt: "Timed (30s): Say one thing you don't know and one thing you don't have.",
        sampleAnswer: "Ich habe keine Antwort. Ich habe keine Zeit.",
      },
      skillUnlock: "You can express limits during exam tasks.",
      reviewSuggestion: "Practice two negative exam sentences.",
    },
    daily: {
      title: "Say what you do not have in daily life",
      abilityObjective: "Say what you don't have or don't do in daily life.",
      vocabulary: [
        { german: "nicht", english: "not" },
        { german: "kein", english: "no / not a" },
        { german: "das Geld", english: "the money" },
        { german: "die Zeit", english: "the time" },
        { german: "die Idee", english: "the idea" },
      ],
      dialogue: [
        { speaker: "Nina", german: "Ich habe kein Geld.", english: "I have no money." },
        { speaker: "Tom", german: "Kein Problem.", english: "No problem." },
        { speaker: "Nina", german: "Ich komme nicht heute.", english: "I'm not coming today." },
      ],
      production: {
        prompt: "Roleplay: Say one thing you don't have today.",
        sampleAnswer: "Ich habe keine Zeit.",
      },
      skillUnlock: "You can express simple negatives in daily life.",
      reviewSuggestion: "Make two negative sentences about your day.",
    },
  }[purposeTrack]

  const grammarPoints: GrammarPoint[] = [
    {
      rule: "Use 'kein' to negate nouns: Ich habe kein Ticket.",
      table: {
        headers: ["Positive", "Negative"],
        rows: [
          ["Ich habe ein Buch.", "Ich habe kein Buch."],
          ["Ich trinke Kaffee.", "Ich trinke keinen Kaffee."],
        ],
      },
    },
    { rule: "Use 'nicht' to negate verbs and adjectives: Ich komme nicht." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: kein + noun, nicht + verb/adjective.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct negation: 'Ich habe ___ Zeit.'",
      options: ["keine", "nicht", "kein", "nein"],
      answer: "keine",
      explanation: "Zeit is feminine: keine Zeit.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Ich komme ___ heute.'",
      options: ["nicht", "kein", "keine", "nein"],
      answer: "nicht",
      explanation: "Negating a verb uses nicht.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I have no ticket.'",
      words: ["Ich", "habe", "kein", "Ticket", "."],
      answer: "Ich habe kein Ticket.",
      explanation: "kein before the noun.",
    },
    {
      kind: "production",
      prompt: context.production.prompt,
      answer: "",
      sampleAnswer: context.production.sampleAnswer,
      mode: speakingPriority ? "speaking" : "writing",
      explanation: "Use kein and nicht correctly.",
    },
  ]

  const content: LessonContent = {
    ...shell,
    title: context.title,
    abilityObjective: context.abilityObjective,
    grammarPoints: applyGrammarClarity(grammarPoints, options.learningStyle, grammarSummary),
    vocabulary: context.vocabulary,
    dialogue: context.dialogue,
    exercises,
    skillUnlock: context.skillUnlock,
    reviewSuggestion: context.reviewSuggestion,
    goal: context.abilityObjective,
    reviewHint: context.reviewSuggestion,
  }

  return applyBudget(content, short, speakingPriority)
}

function buildQuestionWords(options: LessonOptions): LessonContent {
  const purposeTrack = normalizePurpose(options.purpose)
  const short = isShortSession(options.timeCommitment)
  const speakingPriority = options.learningStyle === "speaking"
  const shell = buildLessonShell("question-words", purposeTrack)

  const context = {
    work: {
      title: "Ask for information at work",
      abilityObjective: "Ask simple work questions using question words.",
      vocabulary: [
        { german: "wer", english: "who" },
        { german: "was", english: "what" },
        { german: "wo", english: "where" },
        { german: "wann", english: "when" },
        { german: "warum", english: "why" },
        { german: "wie", english: "how" },
      ],
      dialogue: [
        { speaker: "Mia", german: "Wann ist die Besprechung?", english: "When is the meeting?" },
        { speaker: "Tom", german: "Um 10 Uhr.", english: "At 10 o'clock." },
        { speaker: "Mia", german: "Wo ist der Raum?", english: "Where is the room?" },
      ],
      production: {
        prompt: "Roleplay: Ask two work questions with wann/wo.",
        sampleAnswer: "Wann ist die Besprechung? Wo ist der Raum?",
      },
      skillUnlock: "You can ask for key information at work.",
      reviewSuggestion: "Ask yourself three work questions in German.",
    },
    travel: {
      title: "Ask for directions and times",
      abilityObjective: "Ask travel questions using wo/wann/wie.",
      vocabulary: [
        { german: "wo", english: "where" },
        { german: "wohin", english: "where to" },
        { german: "wann", english: "when" },
        { german: "wie", english: "how" },
        { german: "wie viel", english: "how much" },
      ],
      dialogue: [
        { speaker: "Reisende", german: "Wo ist der Bahnhof?", english: "Where is the station?" },
        { speaker: "Passant", german: "Dort links.", english: "Over there on the left." },
        { speaker: "Reisende", german: "Wie viel kostet das Ticket?", english: "How much does the ticket cost?" },
      ],
      production: {
        prompt: "Roleplay: Ask for directions and price.",
        sampleAnswer: "Wo ist der Bahnhof? Wie viel kostet das Ticket?",
      },
      skillUnlock: "You can ask basic travel questions.",
      reviewSuggestion: "Practice two travel questions aloud.",
    },
    study: {
      title: "Ask questions in class",
      abilityObjective: "Ask simple class questions using question words.",
      vocabulary: [
        { german: "wer", english: "who" },
        { german: "was", english: "what" },
        { german: "wann", english: "when" },
        { german: "wo", english: "where" },
        { german: "warum", english: "why" },
      ],
      dialogue: [
        { speaker: "Student", german: "Wann ist die Prüfung?", english: "When is the exam?" },
        { speaker: "Lehrer", german: "Am Freitag.", english: "On Friday." },
        { speaker: "Student", german: "Warum am Freitag?", english: "Why on Friday?" },
      ],
      production: {
        prompt: "Roleplay: Ask two class questions with wann/warum.",
        sampleAnswer: "Wann ist die Prüfung? Warum am Freitag?",
      },
      skillUnlock: "You can ask basic questions in class.",
      reviewSuggestion: "Write two questions for your next class.",
    },
    relocation: {
      title: "Ask questions at offices",
      abilityObjective: "Ask simple questions at offices using question words.",
      vocabulary: [
        { german: "wo", english: "where" },
        { german: "wann", english: "when" },
        { german: "was", english: "what" },
        { german: "wie", english: "how" },
        { german: "welcher", english: "which" },
      ],
      dialogue: [
        { speaker: "Kunde", german: "Wo ist das Formular?", english: "Where is the form?" },
        { speaker: "Beamter", german: "Hier.", english: "Here." },
        { speaker: "Kunde", german: "Wann ist der Termin?", english: "When is the appointment?" },
      ],
      production: {
        prompt: "Roleplay: Ask two office questions with wo/wann.",
        sampleAnswer: "Wo ist das Formular? Wann ist der Termin?",
      },
      skillUnlock: "You can ask for key information at offices.",
      reviewSuggestion: "Practice two questions for your next appointment.",
    },
    exams: {
      title: "Ask exam questions politely",
      abilityObjective: "Ask simple exam questions using question words.",
      vocabulary: [
        { german: "was", english: "what" },
        { german: "wann", english: "when" },
        { german: "wie", english: "how" },
        { german: "wie viel", english: "how much" },
      ],
      dialogue: [
        { speaker: "Kandidat", german: "Wie viel Zeit habe ich?", english: "How much time do I have?" },
        { speaker: "Prüfer", german: "30 Minuten.", english: "30 minutes." },
        { speaker: "Kandidat", german: "Was soll ich schreiben?", english: "What should I write?" },
      ],
      production: {
        prompt: "Timed (30s): Ask the examiner one question with 'wie viel' or 'wann'.",
        sampleAnswer: "Wie viel Zeit habe ich?",
      },
      skillUnlock: "You can ask short questions under exam pressure.",
      reviewSuggestion: "Say three exam questions aloud.",
    },
    daily: {
      title: "Ask everyday questions",
      abilityObjective: "Ask basic questions in everyday situations.",
      vocabulary: [
        { german: "wer", english: "who" },
        { german: "was", english: "what" },
        { german: "wo", english: "where" },
        { german: "wann", english: "when" },
        { german: "wie", english: "how" },
      ],
      dialogue: [
        { speaker: "Nina", german: "Wo ist der Bus?", english: "Where is the bus?" },
        { speaker: "Tom", german: "Dort.", english: "There." },
        { speaker: "Nina", german: "Wann kommt er?", english: "When does it come?" },
      ],
      production: {
        prompt: "Roleplay: Ask two everyday questions.",
        sampleAnswer: "Wo ist der Bus? Wann kommt er?",
      },
      skillUnlock: "You can ask basic questions in daily life.",
      reviewSuggestion: "Write three questions about your day.",
    },
  }[purposeTrack]

  const grammarPoints: GrammarPoint[] = [
    {
      rule: "W-questions: question word first, verb second, subject third.",
      table: {
        headers: ["Word", "Example"],
        rows: [
          ["Wo", "Wo ist der Bahnhof?"],
          ["Wann", "Wann beginnt die Prüfung?"],
        ],
      },
    },
    { rule: "Yes/No questions: verb in position 1: 'Kommst du?'" },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: W-word + verb (position 2) + subject.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct word: '___ ist der Bahnhof?'",
      options: ["Wo", "Was", "Wer", "Wann"],
      answer: "Wo",
      explanation: "Wo asks about location.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: '___ beginnt die Prüfung?'",
      options: ["Wann", "Wie", "Wo", "Wer"],
      answer: "Wann",
      explanation: "Wann asks about time.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'When is the meeting?'",
      words: ["Wann", "ist", "die", "Besprechung", "?"],
      answer: "Wann ist die Besprechung?",
      explanation: "W-word first, verb second.",
    },
    {
      kind: "production",
      prompt: context.production.prompt,
      answer: "",
      sampleAnswer: context.production.sampleAnswer,
      mode: speakingPriority ? "speaking" : "writing",
      explanation: "Use a question word.",
    },
  ]

  const content: LessonContent = {
    ...shell,
    title: context.title,
    abilityObjective: context.abilityObjective,
    grammarPoints: applyGrammarClarity(grammarPoints, options.learningStyle, grammarSummary),
    vocabulary: context.vocabulary,
    dialogue: context.dialogue,
    exercises,
    skillUnlock: context.skillUnlock,
    reviewSuggestion: context.reviewSuggestion,
    goal: context.abilityObjective,
    reviewHint: context.reviewSuggestion,
  }

  return applyBudget(content, short, speakingPriority)
}

function buildModalVerbs(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Modal verbs (können, müssen, wollen, dürfen, sollen) go in position 2; the main verb is at the end." },
    { rule: "Conjugate the modal: ich kann, du kannst, er/sie/es kann, wir können." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Modal verb in position 2 + infinitive at the end.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct form: 'Ich ___ heute kommen.'",
      options: ["kann", "kannst", "können", "könnt"],
      answer: "kann",
      explanation: "Ich + kann.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Wir ___ die Aufgabe machen.'",
      options: ["müssen", "muss", "musst", "müsst"],
      answer: "müssen",
      explanation: "Wir + müssen.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I want to pay today.'",
      words: ["Ich", "will", "heute", "bezahlen", "."],
      answer: "Ich will heute bezahlen.",
      explanation: "Infinitive at the end: bezahlen.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Say what you can or must do today.",
      answer: "",
      sampleAnswer: "Ich kann heute später kommen, aber ich muss den Bericht schicken.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use one modal verb.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Express ability, obligation, and permission ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use modal verbs to talk about ${t.task.de} and permissions ${t.place.de}.`,
      vocabulary: [
        { german: "können", english: "can" },
        { german: "müssen", english: "must" },
        { german: "dürfen", english: "may" },
        { german: "wollen", english: "want" },
        { german: t.item.de, english: t.item.en },
        { german: t.service.de, english: t.service.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Kann ich ${t.item.de} heute schicken?`, english: `Can I send ${t.item.en} today?` },
        { speaker: t.speakerB, german: `Ja, du kannst. Du musst nur pünktlich sein.`, english: "Yes, you can. You just have to be on time." },
      ],
      production: {
        prompt: `Roleplay: Ask if you can or must do ${t.task.de}.`,
        sampleAnswer: `Kann ich ${t.task.de} morgen machen? Ich muss heute ${t.document.de} schreiben.`,
      },
      skillUnlock: "You can express ability and obligation with modal verbs.",
      reviewSuggestion: "Say two sentences with können and müssen.",
    }
  })

  return buildLessonFromContext("modal-verbs", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildAccusativeCase(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Direct objects take the accusative: der -> den, ein -> einen." },
    { rule: "Accusative pronouns: mich, dich, ihn, sie, es, uns, euch, sie/Sie." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Direct object = accusative (den/einen).",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct article: 'Ich sehe ___ Mann.'",
      options: ["den", "dem", "der", "des"],
      answer: "den",
      explanation: "Direct object masculine = den.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Wir kaufen ___ Kaffee.'",
      options: ["einen", "ein", "einem", "eines"],
      answer: "einen",
      explanation: "Accusative masculine: einen Kaffee.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I need the ticket.'",
      words: ["Ich", "brauche", "die", "Fahrkarte", "."],
      answer: "Ich brauche die Fahrkarte.",
      explanation: "Direct object in accusative.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Say what you need to buy today.",
      answer: "",
      sampleAnswer: "Ich brauche den Bericht und eine E-Mail.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use an accusative object.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Talk about what you need and use ${t.item.en} ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use accusative objects to describe ${t.item.de} and tasks ${t.place.de}.`,
      vocabulary: [
        { german: "brauchen", english: "to need" },
        { german: "sehen", english: "to see" },
        { german: "kaufen", english: "to buy" },
        { german: t.item.de, english: t.item.en },
        { german: t.document.de, english: t.document.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Ich brauche ${t.item.de}.`, english: `I need ${t.item.en}.` },
        { speaker: t.speakerB, german: `Ich kaufe ${t.item.de} gleich.`, english: `I'll buy ${t.item.en} now.` },
      ],
      production: {
        prompt: `Roleplay: Say what you need to get ${t.place.de}.`,
        sampleAnswer: `Ich brauche ${t.document.de} und ${t.item.de}.`,
      },
      skillUnlock: "You can name direct objects with the accusative case.",
      reviewSuggestion: "Name three things you need using den/die/das.",
    }
  })

  return buildLessonFromContext("accusative-case", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildDativeCase(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Indirect objects take the dative: der -> dem, ein -> einem." },
    { rule: "Dative pronouns: mir, dir, ihm, ihr, uns, euch, ihnen, Ihnen." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Indirect object = dative (dem/einem).",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct form: 'Ich gebe ___ Kollegen den Bericht.'",
      options: ["dem", "den", "der", "des"],
      answer: "dem",
      explanation: "Indirect object masculine = dem.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Wir schicken ___ Frau eine E-Mail.'",
      options: ["der", "die", "den", "dem"],
      answer: "der",
      explanation: "Dative feminine: der Frau.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I show the ticket to him.'",
      words: ["Ich", "zeige", "ihm", "die", "Fahrkarte", "."],
      answer: "Ich zeige ihm die Fahrkarte.",
      explanation: "Dative pronoun before accusative object.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Say who you give something to.",
      answer: "",
      sampleAnswer: "Ich gebe dem Kollegen den Bericht.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use a dative object.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Describe who you give or send things to ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use dative objects to describe giving ${t.document.de} ${t.place.de}.`,
      vocabulary: [
        { german: "geben", english: "to give" },
        { german: "schicken", english: "to send" },
        { german: "zeigen", english: "to show" },
        { german: t.document.de, english: t.document.en },
        { german: t.service.de, english: t.service.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Ich schicke ${t.document.de} der Kollegin.`, english: `I send ${t.document.en} to the colleague.` },
        { speaker: t.speakerB, german: `Danke, ich gebe es dem Chef.`, english: "Thanks, I'll give it to the boss." },
      ],
      production: {
        prompt: `Roleplay: Say who you send ${t.document.de} to.`,
        sampleAnswer: `Ich schicke ${t.document.de} dem ${t.speakerB}.`,
      },
      skillUnlock: "You can use the dative case for indirect objects.",
      reviewSuggestion: "Say two sentences with 'geben' or 'schicken'.",
    }
  })

  return buildLessonFromContext("dative-case", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildSeparableVerbs(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Separable verbs split: Ich rufe dich an. (prefix at the end)." },
    { rule: "In infinitive/with modals, the prefix stays attached: anrufen." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Prefix at the end in present tense statements.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct sentence.",
      options: ["Ich rufe dich an.", "Ich anrufe dich.", "Ich rufe an dich.", "Ich dich anrufe."],
      answer: "Ich rufe dich an.",
      explanation: "Prefix goes to the end.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Der Zug fährt um neun Uhr ___.'",
      options: ["ab", "auf", "an", "aus"],
      answer: "ab",
      explanation: "abfahren = to depart.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I fill out the form.'",
      words: ["Ich", "fülle", "das", "Formular", "aus", "."],
      answer: "Ich fülle das Formular aus.",
      explanation: "aus goes to the end.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Describe a short routine using a separable verb.",
      answer: "",
      sampleAnswer: "Ich stehe um sieben Uhr auf und rufe meine Kollegin an.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use one separable verb.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Talk about routines step by step ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use separable verbs to describe tasks ${t.place.de}.`,
      vocabulary: [
        { german: "aufstehen", english: "to get up" },
        { german: "anrufen", english: "to call" },
        { german: "ausfüllen", english: "to fill out" },
        { german: "abfahren", english: "to depart" },
        { german: t.item.de, english: t.item.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Ich rufe ${t.speakerB} später an.`, english: `I will call ${t.speakerB} later.` },
        { speaker: t.speakerB, german: `Gut, ich fülle ${t.item.de} jetzt aus.`, english: `Okay, I'll fill out ${t.item.en} now.` },
      ],
      production: {
        prompt: `Roleplay: Describe one task ${t.place.de} with a separable verb.`,
        sampleAnswer: `Ich fülle ${t.item.de} aus und rufe ${t.speakerB} an.`,
      },
      skillUnlock: "You can use separable verbs in daily routines.",
      reviewSuggestion: "Say three separable verbs aloud today.",
    }
  })

  return buildLessonFromContext("separable-verbs", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildPrepositionsByCase(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Two-way prepositions take accusative for movement and dative for location." },
    { rule: "in/auf/an + accusative = where to; in/auf/an + dative = where." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: movement = accusative, location = dative.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct case: 'Ich gehe ___ das Büro.'",
      options: ["in", "im", "ins", "bei"],
      answer: "ins",
      explanation: "Movement -> ins (in + das).",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Ich bin ___ Büro.'",
      options: ["im", "ins", "an", "auf"],
      answer: "im",
      explanation: "Location -> im (in + dem).",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'The ticket is on the table.'",
      words: ["Die", "Fahrkarte", "liegt", "auf", "dem", "Tisch", "."],
      answer: "Die Fahrkarte liegt auf dem Tisch.",
      explanation: "Location -> dative: auf dem Tisch.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Say where you are and where you are going.",
      answer: "",
      sampleAnswer: "Ich bin im Büro und gehe ins Meeting.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use one location and one movement.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Describe locations and destinations ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use prepositions with cases to describe movement ${t.place.de}.`,
      vocabulary: [
        { german: "in", english: "in" },
        { german: "auf", english: "on" },
        { german: "an", english: "at" },
        { german: t.place.de, english: t.place.en },
        { german: t.service.de, english: t.service.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Ich bin ${t.place.de}.`, english: `I am ${t.place.en}.` },
        { speaker: t.speakerB, german: `Ich gehe in ${t.service.de}.`, english: `I am going into ${t.service.en}.` },
      ],
      production: {
        prompt: `Roleplay: Say where ${t.item.de} is and where you go next.`,
        sampleAnswer: `Die ${t.item.de} ist auf dem Tisch. Ich gehe in ${t.service.de}.`,
      },
      skillUnlock: "You can choose the right case with prepositions.",
      reviewSuggestion: "Say two sentences with in/auf.",
    }
  })

  return buildLessonFromContext("prepositions-by-case", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildPastPerfekt(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Perfekt = haben/sein + Partizip II: Ich habe gearbeitet. Ich bin gegangen." },
    { rule: "Movement and change of state use sein." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: habe/hat + Partizip, bin/ist + movement verbs.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct auxiliary: 'Ich ___ gestern gegangen.'",
      options: ["bin", "habe", "hat", "ist"],
      answer: "bin",
      explanation: "Movement verb -> sein.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Wir haben den Bericht ___.'",
      options: ["geschrieben", "schreiben", "geschriebenen", "schreibe"],
      answer: "geschrieben",
      explanation: "Partizip II: geschrieben.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I booked the hotel.'",
      words: ["Ich", "habe", "das", "Hotel", "gebucht", "."],
      answer: "Ich habe das Hotel gebucht.",
      explanation: "Auxiliary + participle at the end.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Say two things you did yesterday.",
      answer: "",
      sampleAnswer: "Ich habe eine E-Mail geschrieben und bin nach Hause gefahren.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use Perfekt with haben/sein.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Talk about what you did earlier ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use Perfekt to describe past tasks like ${t.task.de}.`,
      vocabulary: [
        { german: "gestern", english: "yesterday" },
        { german: "heute", english: "today" },
        { german: "machen", english: "to do" },
        { german: "gehen", english: "to go" },
        { german: t.task.de, english: t.task.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Ich habe ${t.task.de} gemacht.`, english: `I did ${t.task.en}.` },
        { speaker: t.speakerB, german: `Ich bin zu ${t.service.de} gegangen.`, english: `I went to ${t.service.en}.` },
      ],
      production: {
        prompt: `Roleplay: Say what you did ${t.place.de} yesterday.`,
        sampleAnswer: `Ich habe ${t.document.de} geschrieben und bin zu ${t.service.de} gegangen.`,
      },
      skillUnlock: "You can talk about past actions with Perfekt.",
      reviewSuggestion: "Say two Perfekt sentences aloud.",
    }
  })

  return buildLessonFromContext("past-perfekt", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildConnectorsWeilDass(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "weil/dass/wenn start a subordinate clause; the verb goes to the end." },
    { rule: "Main clause stays V2: Ich komme, weil ich Zeit habe." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: connector + subject + ... + verb at the end.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct sentence.",
      options: [
        "Ich komme, weil ich Zeit habe.",
        "Ich komme, weil ich habe Zeit.",
        "Ich komme, weil habe ich Zeit.",
        "Ich komme, weil Zeit ich habe.",
      ],
      answer: "Ich komme, weil ich Zeit habe.",
      explanation: "Verb goes to the end in the weil-clause.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Ich denke, ___ wir morgen starten.'",
      options: ["dass", "weil", "wenn", "denn"],
      answer: "dass",
      explanation: "Use dass to report a statement.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I stay because I am tired.'",
      words: ["Ich", "bleibe", ",", "weil", "ich", "müde", "bin", "."],
      answer: "Ich bleibe, weil ich müde bin.",
      explanation: "Verb at the end of the clause.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Give a reason using weil.",
      answer: "",
      sampleAnswer: "Ich komme später, weil ich noch ein Meeting habe.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use weil + verb-final.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Explain reasons and share opinions ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use weil/dass to explain decisions about ${t.task.de}.`,
      vocabulary: [
        { german: "weil", english: "because" },
        { german: "dass", english: "that" },
        { german: "wenn", english: "if/when" },
        { german: "deshalb", english: "therefore" },
        { german: t.task.de, english: t.task.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Ich komme später, weil ich ${t.task.de} mache.`, english: `I'll come later because I'm doing ${t.task.en}.` },
        { speaker: t.speakerB, german: `Okay, ich denke, dass das gut ist.`, english: "Okay, I think that is good." },
      ],
      production: {
        prompt: `Roleplay: Explain a delay ${t.place.de} with weil.`,
        sampleAnswer: `Ich komme später, weil ich ${t.document.de} schreiben muss.`,
      },
      skillUnlock: "You can explain reasons with connectors.",
      reviewSuggestion: "Say two weil-sentences today.",
    }
  })

  return buildLessonFromContext("connectors-weil-dass", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildReflexiveVerbs(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Reflexive verbs use sich: ich freue mich, du meldest dich an." },
    { rule: "Reflexive pronouns: mich/dich/sich/uns/euch/sich." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Use reflexive pronouns with reflexive verbs.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct sentence.",
      options: ["Ich melde mich an.", "Ich melde an mich.", "Ich mich melde an.", "Ich melde an."],
      answer: "Ich melde mich an.",
      explanation: "Reflexive pronoun + separable verb.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Wir freuen ___ auf das Treffen.'",
      options: ["uns", "mich", "euch", "dich"],
      answer: "uns",
      explanation: "Wir + uns.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I introduce myself.'",
      words: ["Ich", "stelle", "mich", "vor", "."],
      answer: "Ich stelle mich vor.",
      explanation: "Reflexive pronoun before the verb stem.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Say a reflexive action you do today.",
      answer: "",
      sampleAnswer: "Ich melde mich beim Kurs an und freue mich darauf.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use a reflexive verb.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Describe routines and reactions ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use reflexive verbs to describe your actions ${t.place.de}.`,
      vocabulary: [
        { german: "sich anmelden", english: "to register" },
        { german: "sich freuen", english: "to be happy" },
        { german: "sich vorstellen", english: "to introduce oneself" },
        { german: t.task.de, english: t.task.en },
        { german: t.service.de, english: t.service.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Ich melde mich für ${t.task.de} an.`, english: `I'm registering for ${t.task.en}.` },
        { speaker: t.speakerB, german: `Super, ich freue mich auf ${t.service.de}.`, english: `Great, I'm looking forward to ${t.service.en}.` },
      ],
      production: {
        prompt: `Roleplay: Say how you register or prepare ${t.place.de}.`,
        sampleAnswer: `Ich melde mich an und stelle mich vor.`,
      },
      skillUnlock: "You can use common reflexive verbs.",
      reviewSuggestion: "Say two reflexive verbs aloud.",
    }
  })

  return buildLessonFromContext("reflexive-verbs", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildPossessiveArticles(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Possessive articles: mein/dein/sein/ihr/unser/euer/Ihr." },
    { rule: "They change with case and gender: mein Vater, meine Mutter, mein Kind." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Possessive articles act like ein-words.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct form: 'Das ist ___ Buch.'",
      options: ["mein", "meine", "meinen", "meinem"],
      answer: "mein",
      explanation: "Neuter: mein Buch.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Ich sehe ___ Kollegin.'",
      options: ["meine", "mein", "meinen", "meinem"],
      answer: "meine",
      explanation: "Accusative feminine: meine Kollegin.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'This is my ticket.'",
      words: ["Das", "ist", "meine", "Fahrkarte", "."],
      answer: "Das ist meine Fahrkarte.",
      explanation: "Possessive article before the noun.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Talk about your items or tasks.",
      answer: "",
      sampleAnswer: "Das ist mein Bericht. Das ist meine Aufgabe.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use mein/meine.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Talk about belongings and responsibilities ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use possessive articles to describe ${t.document.de} and ${t.task.de}.`,
      vocabulary: [
        { german: "mein", english: "my" },
        { german: "dein", english: "your" },
        { german: "sein/ihr", english: "his/her" },
        { german: t.document.de, english: t.document.en },
        { german: t.task.de, english: t.task.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Das ist mein ${t.document.de}.`, english: `That is my ${t.document.en}.` },
        { speaker: t.speakerB, german: `Und das ist deine ${t.task.de}.`, english: `And that is your ${t.task.en}.` },
      ],
      production: {
        prompt: `Roleplay: Say what is yours ${t.place.de}.`,
        sampleAnswer: `Das ist mein ${t.document.de}.`,
      },
      skillUnlock: "You can use possessive articles correctly.",
      reviewSuggestion: "Say two sentences with mein/dein.",
    }
  })

  return buildLessonFromContext("possessive-articles", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildComparativesSuperlatives(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Comparative: -er + als (schneller als)." },
    { rule: "Superlative: am + -sten (am schnellsten)." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: vergleichen = -er als / am -sten.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct form: 'Die E-Mail ist ___ als der Bericht.'",
      options: ["kürzer", "kurz", "am kürzesten", "kürzeste"],
      answer: "kürzer",
      explanation: "Comparative uses -er + als.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Das ist am ___.'",
      options: ["besten", "besser", "gut", "best"],
      answer: "besten",
      explanation: "Superlative: am besten.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'This plan is better.'",
      words: ["Dieser", "Plan", "ist", "besser", "."],
      answer: "Dieser Plan ist besser.",
      explanation: "besser is irregular comparative of gut.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Compare two options.",
      answer: "",
      sampleAnswer: "Das Hotel ist teurer, aber der Zug ist schneller.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use a comparative.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Compare options and express preferences ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use comparatives to compare ${t.task.de} and ${t.service.de}.`,
      vocabulary: [
        { german: "besser", english: "better" },
        { german: "schneller", english: "faster" },
        { german: "teurer", english: "more expensive" },
        { german: "am besten", english: "the best" },
        { german: t.service.de, english: t.service.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Der ${t.service.de} ist besser.`, english: `The ${t.service.en} is better.` },
        { speaker: t.speakerB, german: `Ja, aber er ist teurer.`, english: "Yes, but it's more expensive." },
      ],
      production: {
        prompt: `Roleplay: Compare two choices ${t.place.de}.`,
        sampleAnswer: `Das ist schneller, aber teurer.`,
      },
      skillUnlock: "You can compare choices with comparatives and superlatives.",
      reviewSuggestion: "Compare two things you use daily.",
    }
  })

  return buildLessonFromContext("comparatives-superlatives", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildRelativeClauses(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Relative clauses use der/die/das and verb-final order." },
    { rule: "The relative pronoun matches the noun gender and case." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: noun + comma + der/die/das + ... + verb at end.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct sentence.",
      options: [
        "Das ist der Kollege, der hier arbeitet.",
        "Das ist der Kollege, der arbeitet hier.",
        "Das ist der Kollege, der hier arbeitetet.",
        "Das ist der Kollege, die hier arbeitet.",
      ],
      answer: "Das ist der Kollege, der hier arbeitet.",
      explanation: "Verb at end; masculine der.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Das ist die Frau, ___ die E-Mail schreibt.'",
      options: ["die", "der", "das", "den"],
      answer: "die",
      explanation: "Feminine: die Frau -> die.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'The ticket that is here is mine.'",
      words: ["Die", "Fahrkarte", ",", "die", "hier", "ist", ",", "ist", "meine", "."],
      answer: "Die Fahrkarte, die hier ist, ist meine.",
      explanation: "Relative clause with verb-final.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Describe a person or thing with a relative clause.",
      answer: "",
      sampleAnswer: "Das ist der Kollege, der im Büro arbeitet.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use der/die/das.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Describe people and things in more detail ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use relative clauses to describe ${t.item.de} and people ${t.place.de}.`,
      vocabulary: [
        { german: "der/die/das", english: "who/which/that" },
        { german: "hier", english: "here" },
        { german: "dort", english: "there" },
        { german: t.item.de, english: t.item.en },
        { german: t.place.de, english: t.place.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Das ist ${t.item.de}, die hier liegt.`, english: `That is ${t.item.en} that is here.` },
        { speaker: t.speakerB, german: `Danke, die brauche ich.`, english: "Thanks, I need that." },
      ],
      production: {
        prompt: `Roleplay: Describe ${t.item.de} with a relative clause.`,
        sampleAnswer: `Das ist ${t.item.de}, die hier liegt.`,
      },
      skillUnlock: "You can add detail with relative clauses.",
      reviewSuggestion: "Describe one person with a relative clause.",
    }
  })

  return buildLessonFromContext("relative-clauses", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildWorkOfficeComm(options: LessonOptions): LessonContent {
  const t = PURPOSE_TEMPLATES.work
  const grammarPoints: GrammarPoint[] = [
    { rule: "Formal emails use Sie, clear structure, and polite requests." },
    { rule: "Use 'Könnten Sie...' or 'Ich hätte eine Frage'." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Formal register = Sie + polite request.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the formal opening.",
      options: ["Sehr geehrte Frau Weber,", "Hi Frau Weber,", "Hallo du!", "Yo!"],
      answer: "Sehr geehrte Frau Weber,",
      explanation: "Formal opening for emails.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Könnten ___ mir den Bericht schicken?'",
      options: ["Sie", "du", "ihr", "dich"],
      answer: "Sie",
      explanation: "Formal request uses Sie.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'Please send the file.'",
      words: ["Bitte", "schicken", "Sie", "die", "Datei", "."],
      answer: "Bitte schicken Sie die Datei.",
      explanation: "Verb in position 2.",
    },
    {
      kind: "production",
      prompt: "Write one formal request email sentence.",
      answer: "",
      sampleAnswer: "Könnten Sie mir den Bericht bis morgen schicken?",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Keep it polite and clear.",
    },
  ]

  const context: LessonContext = {
    title: "Write emails and communicate with colleagues",
    abilityObjective: "Write short, formal emails and requests using Sie.",
    vocabulary: [
      { german: "Sehr geehrte", english: "Dear (formal)" },
      { german: "Mit freundlichen Grüßen", english: "Kind regards" },
      { german: "der Anhang", english: "the attachment" },
      { german: t.document.de, english: t.document.en },
      { german: t.service.de, english: t.service.en },
    ],
    dialogue: [
      { speaker: "Mail", german: "Sehr geehrte Frau Weber, könnten Sie mir den Bericht schicken?", english: "Dear Ms. Weber, could you send me the report?" },
      { speaker: "Antwort", german: "Gern. Ich schicke ihn heute.", english: "Sure. I'll send it today." },
    ],
    production: {
      prompt: "Roleplay: Write a two-line formal email asking for an update.",
      sampleAnswer: "Sehr geehrte Frau Weber, könnten Sie mir ein Update zum Projekt schicken?",
    },
    skillUnlock: "You can write short formal requests at work.",
    reviewSuggestion: "Practice one polite email opening and closing.",
  }

  const contextByPurpose = buildPurposeMap(() => context)

  return buildLessonFromContext("work-office-comm", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildWorkMeetings(options: LessonOptions): LessonContent {
  const t = PURPOSE_TEMPLATES.work
  const grammarPoints: GrammarPoint[] = [
    { rule: "Use opinion phrases: Meiner Meinung nach..., Ich schlage vor..." },
    { rule: "Structure ideas with zuerst, dann, zum Schluss." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Use opinion + suggestion phrases in meetings.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the best meeting phrase.",
      options: ["Ich schlage vor, ...", "Ich will, ...", "Gib mir ...", "Nein."],
      answer: "Ich schlage vor, ...",
      explanation: "Polite suggestion phrase.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Meiner Meinung ___ sollten wir starten.'",
      options: ["nach", "zu", "für", "bei"],
      answer: "nach",
      explanation: "Meiner Meinung nach.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I suggest we start now.'",
      words: ["Ich", "schlage", "vor", ",", "dass", "wir", "jetzt", "starten", "."],
      answer: "Ich schlage vor, dass wir jetzt starten.",
      explanation: "dass-clause with verb at end.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Give a short suggestion in a meeting.",
      answer: "",
      sampleAnswer: "Ich schlage vor, dass wir den Bericht zuerst besprechen.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use a suggestion phrase.",
    },
  ]

  const context: LessonContext = {
    title: "Contribute to meetings and present ideas",
    abilityObjective: "Give opinions and suggestions in meetings.",
    vocabulary: [
      { german: "Ich schlage vor", english: "I suggest" },
      { german: "Meiner Meinung nach", english: "In my opinion" },
      { german: "zustimmen", english: "to agree" },
      { german: t.service.de, english: t.service.en },
      { german: t.item.de, english: t.item.en },
    ],
    dialogue: [
      { speaker: "Leitung", german: "Haben Sie einen Vorschlag?", english: "Do you have a suggestion?" },
      { speaker: "Anna", german: "Ich schlage vor, dass wir den Bericht zuerst lesen.", english: "I suggest that we read the report first." },
    ],
    production: {
      prompt: "Roleplay: Suggest one next step for the project.",
      sampleAnswer: "Ich schlage vor, dass wir das Projekt diese Woche starten.",
    },
    skillUnlock: "You can contribute politely in meetings.",
    reviewSuggestion: "Practice two opinion phrases aloud.",
  }

  const contextByPurpose = buildPurposeMap(() => context)

  return buildLessonFromContext("work-meetings", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildTravelNavigation(options: LessonOptions): LessonContent {
  const t = PURPOSE_TEMPLATES.travel
  const grammarPoints: GrammarPoint[] = [
    { rule: "Use direction phrases: links, rechts, geradeaus." },
    { rule: "Imperative for directions: Gehen Sie..., Fahren Sie..." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Direction words + polite imperative.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct direction word for 'straight'.",
      options: ["geradeaus", "links", "rechts", "zurück"],
      answer: "geradeaus",
      explanation: "geradeaus = straight ahead.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Gehen Sie ___ und dann links.'",
      options: ["geradeaus", "rechts", "zurück", "oben"],
      answer: "geradeaus",
      explanation: "Straight ahead.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'Where is the station?'",
      words: ["Wo", "ist", "der", "Bahnhof", "?"],
      answer: "Wo ist der Bahnhof?",
      explanation: "Question word first.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Ask for directions to the station.",
      answer: "",
      sampleAnswer: "Entschuldigung, wo ist der Bahnhof?",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use a polite question.",
    },
  ]

  const context: LessonContext = {
    title: "Get around a city using public transport",
    abilityObjective: "Ask for directions and understand transport guidance.",
    vocabulary: [
      { german: "der Bahnhof", english: "the station" },
      { german: "links", english: "left" },
      { german: "rechts", english: "right" },
      { german: "geradeaus", english: "straight" },
      { german: t.item.de, english: t.item.en },
    ],
    dialogue: [
      { speaker: t.speakerA, german: "Wo ist der Bahnhof?", english: "Where is the station?" },
      { speaker: t.speakerB, german: "Gehen Sie geradeaus und dann links.", english: "Go straight and then left." },
    ],
    production: {
      prompt: "Roleplay: Ask for directions and repeat them.",
      sampleAnswer: "Geradeaus und dann rechts, danke.",
    },
    skillUnlock: "You can ask for and follow directions while traveling.",
    reviewSuggestion: "Say three direction words aloud.",
  }

  const contextByPurpose = buildPurposeMap(() => context)

  return buildLessonFromContext("travel-navigation", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildTravelDining(options: LessonOptions): LessonContent {
  const t = PURPOSE_TEMPLATES.travel
  const grammarPoints: GrammarPoint[] = [
    { rule: "Polite ordering: Ich hätte gern..., Bitte die Rechnung." },
    { rule: "Use accusative for items: Ich nehme den Kaffee." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Ich hätte gern + item.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the polite order.",
      options: ["Ich hätte gern einen Tee.", "Gib mir Tee.", "Tee!", "Ich will Tee."],
      answer: "Ich hätte gern einen Tee.",
      explanation: "Ich hätte gern is polite.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Die Rechnung, ___.'",
      options: ["bitte", "danke", "jetzt", "sofort"],
      answer: "bitte",
      explanation: "Common polite request.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I take the soup.'",
      words: ["Ich", "nehme", "die", "Suppe", "."],
      answer: "Ich nehme die Suppe.",
      explanation: "Verb in position 2.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Order a drink and ask for the bill.",
      answer: "",
      sampleAnswer: "Ich hätte gern ein Wasser. Die Rechnung, bitte.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use polite phrases.",
    },
  ]

  const context: LessonContext = {
    title: "Order food, ask for the bill, and tip correctly",
    abilityObjective: "Order food politely and request the bill.",
    vocabulary: [
      { german: "Ich hätte gern", english: "I would like" },
      { german: "die Speisekarte", english: "the menu" },
      { german: "die Rechnung", english: "the bill" },
      { german: "das Trinkgeld", english: "the tip" },
      { german: t.service.de, english: t.service.en },
    ],
    dialogue: [
      { speaker: t.speakerA, german: "Ich hätte gern einen Kaffee.", english: "I would like a coffee." },
      { speaker: t.speakerB, german: "Gern. Möchten Sie noch etwas?", english: "Sure. Would you like anything else?" },
    ],
    production: {
      prompt: "Roleplay: Order a meal and ask for the bill.",
      sampleAnswer: "Ich hätte gern die Suppe. Die Rechnung, bitte.",
    },
    skillUnlock: "You can order and pay in a restaurant.",
    reviewSuggestion: "Practice ordering two items.",
  }

  const contextByPurpose = buildPurposeMap(() => context)

  return buildLessonFromContext("travel-dining", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildRelocationRegistration(options: LessonOptions): LessonContent {
  const t = PURPOSE_TEMPLATES.relocation
  const grammarPoints: GrammarPoint[] = [
    { rule: "Use formal requests at offices: Ich brauche..., Könnten Sie..." },
    { rule: "Key form vocabulary: Formular, Ausweis, Termin." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Formal requests + office vocabulary.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct phrase at the Bürgeramt.",
      options: ["Ich brauche ein Formular.", "Gib mir Formular.", "Ich will Formular.", "Formular!"],
      answer: "Ich brauche ein Formular.",
      explanation: "Polite request.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Ich habe einen ___ um 9 Uhr.'",
      options: ["Termin", "Pass", "Ausweis", "Tisch"],
      answer: "Termin",
      explanation: "Appointment = Termin.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I need an appointment.'",
      words: ["Ich", "brauche", "einen", "Termin", "."],
      answer: "Ich brauche einen Termin.",
      explanation: "Basic request.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Ask for Anmeldung at the office.",
      answer: "",
      sampleAnswer: "Guten Tag, ich brauche ein Formular für die Anmeldung.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use a polite request.",
    },
  ]

  const context: LessonContext = {
    title: "Register your address and navigate Bürgeramt",
    abilityObjective: "Ask for forms and appointments for Anmeldung.",
    vocabulary: [
      { german: "die Anmeldung", english: "the registration" },
      { german: "das Formular", english: "the form" },
      { german: "der Termin", english: "the appointment" },
      { german: "der Ausweis", english: "the ID" },
      { german: t.place.de, english: t.place.en },
    ],
    dialogue: [
      { speaker: t.speakerA, german: "Guten Tag, ich habe einen Termin.", english: "Good day, I have an appointment." },
      { speaker: t.speakerB, german: "Ihr Ausweis, bitte.", english: "Your ID, please." },
    ],
    production: {
      prompt: "Roleplay: Ask for the Anmeldung form.",
      sampleAnswer: "Ich brauche das Formular für die Anmeldung.",
    },
    skillUnlock: "You can handle basic Anmeldung requests.",
    reviewSuggestion: "Say the key office words once.",
  }

  const contextByPurpose = buildPurposeMap(() => context)

  return buildLessonFromContext("relocation-registration", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildRelocationHousing(options: LessonOptions): LessonContent {
  const t = PURPOSE_TEMPLATES.relocation
  const grammarPoints: GrammarPoint[] = [
    { rule: "Common rental terms: Miete, Kaution, Nebenkosten." },
    { rule: "Polite questions: Gibt es..., Ist ... inklusive?" },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Rental vocabulary + polite questions.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct rental word for deposit.",
      options: ["Kaution", "Miete", "Zimmer", "Küche"],
      answer: "Kaution",
      explanation: "Deposit = Kaution.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Ist ___ inklusive?'",
      options: ["Wasser", "der", "die", "das"],
      answer: "Wasser",
      explanation: "Ask if utilities are included.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'The rent is 800 euros.'",
      words: ["Die", "Miete", "ist", "800", "Euro", "."],
      answer: "Die Miete ist 800 Euro.",
      explanation: "Simple statement.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Ask about the rent and utilities.",
      answer: "",
      sampleAnswer: "Wie hoch ist die Miete? Sind die Nebenkosten inklusive?",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use rental vocabulary.",
    },
  ]

  const context: LessonContext = {
    title: "Understand rental contracts and deal with landlords",
    abilityObjective: "Ask about rent, deposit, and utilities.",
    vocabulary: [
      { german: "die Miete", english: "the rent" },
      { german: "die Kaution", english: "the deposit" },
      { german: "die Nebenkosten", english: "utilities" },
      { german: "der Vertrag", english: "the contract" },
      { german: t.document.de, english: t.document.en },
    ],
    dialogue: [
      { speaker: "Vermieter", german: "Die Miete ist 800 Euro.", english: "The rent is 800 euros." },
      { speaker: "Mieter", german: "Sind die Nebenkosten inklusive?", english: "Are utilities included?" },
    ],
    production: {
      prompt: "Roleplay: Ask two questions about the apartment.",
      sampleAnswer: "Wie hoch ist die Kaution? Ist Internet inklusive?",
    },
    skillUnlock: "You can discuss basic rental terms.",
    reviewSuggestion: "Repeat three housing words.",
  }

  const contextByPurpose = buildPurposeMap(() => context)

  return buildLessonFromContext("relocation-housing", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildStudyUniversity(options: LessonOptions): LessonContent {
  const t = PURPOSE_TEMPLATES.study
  const grammarPoints: GrammarPoint[] = [
    { rule: "Academic emails use formal greeting and clear questions." },
    { rule: "Polite requests: Könnten Sie..., Ich hätte eine Frage." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Formal email + polite request.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct email opening to a professor.",
      options: ["Sehr geehrte Frau Professorin", "Hallo", "Hey", "Du"],
      answer: "Sehr geehrte Frau Professorin",
      explanation: "Formal greeting.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Könnten ___ mir den Termin bestätigen?'",
      options: ["Sie", "du", "ihr", "dich"],
      answer: "Sie",
      explanation: "Formal request.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I have a question about the seminar.'",
      words: ["Ich", "habe", "eine", "Frage", "zum", "Seminar", "."],
      answer: "Ich habe eine Frage zum Seminar.",
      explanation: "Simple statement.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Write a short email asking about office hours.",
      answer: "",
      sampleAnswer: "Sehr geehrte Frau Professorin, ich habe eine Frage zur Sprechstunde.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Keep it formal and short.",
    },
  ]

  const context: LessonContext = {
    title: "Navigate university life and email professors",
    abilityObjective: "Write short formal emails to university staff.",
    vocabulary: [
      { german: "die Vorlesung", english: "the lecture" },
      { german: "das Seminar", english: "the seminar" },
      { german: "die Sprechstunde", english: "office hours" },
      { german: "die Aufgabe", english: "the assignment" },
      { german: t.document.de, english: t.document.en },
    ],
    dialogue: [
      { speaker: "Student", german: "Ich habe eine Frage zur Aufgabe.", english: "I have a question about the assignment." },
      { speaker: "Professor", german: "Schreiben Sie mir bitte eine E-Mail.", english: "Please write me an email." },
    ],
    production: {
      prompt: "Roleplay: Ask a professor about a deadline.",
      sampleAnswer: "Könnten Sie mir die Abgabefrist sagen?",
    },
    skillUnlock: "You can contact professors politely.",
    reviewSuggestion: "Practice a formal greeting.",
  }

  const contextByPurpose = buildPurposeMap(() => context)

  return buildLessonFromContext("study-university", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildStudyPresentations(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Use structure markers: Erstens, zweitens, außerdem, zusammenfassend." },
    { rule: "Use formal connectors in presentations." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Structure your points clearly.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose a good presentation connector.",
      options: ["Erstens", "Gestern", "Bitte", "Tschüss"],
      answer: "Erstens",
      explanation: "Connector for first point.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: '___ möchte ich die Ergebnisse zeigen.'",
      options: ["Zuerst", "Bitte", "Tschüss", "Nun"],
      answer: "Zuerst",
      explanation: "Zuerst introduces the first point.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'First, I present the topic.'",
      words: ["Erstens", "präsentiere", "ich", "das", "Thema", "."],
      answer: "Erstens präsentiere ich das Thema.",
      explanation: "Connector at the start.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Give a short presentation opening.",
      answer: "",
      sampleAnswer: "Erstens präsentiere ich das Thema, danach die Ergebnisse.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use at least one connector.",
    },
  ]

  const context: LessonContext = {
    title: "Present arguments and discuss topics academically",
    abilityObjective: "Structure a short academic presentation.",
    vocabulary: [
      { german: "Erstens", english: "first" },
      { german: "außerdem", english: "besides" },
      { german: "zusammenfassend", english: "in summary" },
      { german: "das Thema", english: "the topic" },
      { german: "die Ergebnisse", english: "the results" },
    ],
    dialogue: [
      { speaker: "Student", german: "Erstens präsentiere ich das Thema.", english: "First, I present the topic." },
      { speaker: "Professor", german: "Gut, und was sind die Ergebnisse?", english: "Good, and what are the results?" },
    ],
    production: {
      prompt: "Roleplay: Present two points with connectors.",
      sampleAnswer: "Erstens erkläre ich das Thema, zweitens die Ergebnisse.",
    },
    skillUnlock: "You can structure a presentation with connectors.",
    reviewSuggestion: "Practice three connectors aloud.",
  }

  const contextByPurpose = buildPurposeMap(() => context)

  return buildLessonFromContext("study-presentations", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildDailyShopping(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Quantities: ein Kilo, ein Stück, eine Flasche." },
    { rule: "Polite requests: Ich hätte gern..., Bitte..." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Quantity + noun; polite request.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the polite request.",
      options: ["Ich hätte gern ein Brot.", "Brot!", "Gib mir Brot.", "Ich will Brot."],
      answer: "Ich hätte gern ein Brot.",
      explanation: "Polite ordering.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Ich nehme ___ Kilo Äpfel.'",
      options: ["ein", "eine", "einen", "einem"],
      answer: "ein",
      explanation: "ein Kilo.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I need two bottles of water.'",
      words: ["Ich", "brauche", "zwei", "Flaschen", "Wasser", "."],
      answer: "Ich brauche zwei Flaschen Wasser.",
      explanation: "Quantity + noun.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Order three items at the bakery.",
      answer: "",
      sampleAnswer: "Ich hätte gern zwei Brötchen und ein Brot, bitte.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use quantities.",
    },
  ]

  const context: LessonContext = {
    title: "Shop for groceries and handle everyday errands",
    abilityObjective: "Buy groceries and ask for quantities.",
    vocabulary: [
      { german: "das Brot", english: "the bread" },
      { german: "die Milch", english: "the milk" },
      { german: "ein Kilo", english: "one kilo" },
      { german: "die Flasche", english: "the bottle" },
      { german: "die Kasse", english: "the checkout" },
    ],
    dialogue: [
      { speaker: "Kunde", german: "Ich hätte gern ein Brot, bitte.", english: "I would like a bread, please." },
      { speaker: "Verkäufer", german: "Gern. Sonst noch etwas?", english: "Sure. Anything else?" },
    ],
    production: {
      prompt: "Roleplay: Ask for two items with quantities.",
      sampleAnswer: "Ich hätte gern ein Kilo Äpfel und eine Flasche Wasser.",
    },
    skillUnlock: "You can shop and ask for quantities.",
    reviewSuggestion: "Name three items with quantities.",
  }

  const contextByPurpose = buildPurposeMap(() => context)

  return buildLessonFromContext("daily-shopping", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildDailyHealth(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Describe symptoms with haben: Ich habe Kopfschmerzen." },
    { rule: "Make appointments: Ich brauche einen Termin." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Ich habe + symptom.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct symptom sentence.",
      options: ["Ich habe Kopfschmerzen.", "Ich bin Kopfschmerzen.", "Ich habe kalt.", "Ich bin Schmerzen."],
      answer: "Ich habe Kopfschmerzen.",
      explanation: "Use haben for symptoms.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Ich brauche einen ___ beim Arzt.'",
      options: ["Termin", "Tisch", "Pass", "Zug"],
      answer: "Termin",
      explanation: "Appointment = Termin.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I need a prescription.'",
      words: ["Ich", "brauche", "ein", "Rezept", "."],
      answer: "Ich brauche ein Rezept.",
      explanation: "Basic request.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Describe two symptoms.",
      answer: "",
      sampleAnswer: "Ich habe Kopfschmerzen und Fieber.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use haben + symptom.",
    },
  ]

  const context: LessonContext = {
    title: "Describe symptoms and visit a doctor",
    abilityObjective: "Describe symptoms and ask for an appointment.",
    vocabulary: [
      { german: "der Arzt", english: "the doctor" },
      { german: "das Rezept", english: "the prescription" },
      { german: "Kopfschmerzen", english: "headache" },
      { german: "Fieber", english: "fever" },
      { german: "der Termin", english: "the appointment" },
    ],
    dialogue: [
      { speaker: "Patient", german: "Ich habe Kopfschmerzen.", english: "I have a headache." },
      { speaker: "Arzt", german: "Ich gebe Ihnen ein Rezept.", english: "I'll give you a prescription." },
    ],
    production: {
      prompt: "Roleplay: Ask for a doctor appointment.",
      sampleAnswer: "Ich brauche einen Termin, ich habe Fieber.",
    },
    skillUnlock: "You can describe symptoms and request help.",
    reviewSuggestion: "Say two symptom sentences.",
  }

  const contextByPurpose = buildPurposeMap(() => context)

  return buildLessonFromContext("daily-health", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildExamsWriting(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Exam letters use structure: greeting, reason, request, closing." },
    { rule: "Formal endings: Mit freundlichen Grüßen." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Formal letter structure.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct formal closing.",
      options: ["Mit freundlichen Grüßen", "Tschüss", "Bis später", "Ciao"],
      answer: "Mit freundlichen Grüßen",
      explanation: "Formal closing.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Sehr ___ Damen und Herren,'",
      options: ["geehrte", "gute", "guten", "geehrter"],
      answer: "geehrte",
      explanation: "Sehr geehrte Damen und Herren.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I would like to request an extension.'",
      words: ["Ich", "möchte", "eine", "Verlängerung", "beantragen", "."],
      answer: "Ich möchte eine Verlängerung beantragen.",
      explanation: "Formal request verb.",
    },
    {
      kind: "production",
      prompt: "Timed (60s): Write two formal exam sentences (request + reason).",
      answer: "",
      sampleAnswer: "Ich bitte um eine Verlängerung, weil ich krank bin.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Follow the formal exam style.",
    },
  ]

  const context: LessonContext = {
    title: "Write formal letters and emails for exams",
    abilityObjective: "Write structured exam-style letters.",
    vocabulary: [
      { german: "der Betreff", english: "the subject" },
      { german: "die Bitte", english: "the request" },
      { german: "die Begründung", english: "the reason" },
      { german: "die Verlängerung", english: "the extension" },
      { german: "Mit freundlichen Grüßen", english: "Kind regards" },
    ],
    dialogue: [
      { speaker: "Prüfer", german: "Bitte schreiben Sie formal.", english: "Please write formally." },
      { speaker: "Kandidat", german: "Ich verstehe, ich schreibe eine formelle E-Mail.", english: "I understand, I'll write a formal email." },
    ],
    production: {
      prompt: "Timed (60s): Write a short formal request for exam rescheduling.",
      sampleAnswer: "Ich bitte um einen neuen Termin, weil ich krank bin.",
    },
    skillUnlock: "You can write formal exam-style letters.",
    reviewSuggestion: "Review formal openings and closings.",
  }

  const contextByPurpose = buildPurposeMap(() => context)

  return buildLessonFromContext("exams-writing", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildExamsSpeaking(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Speaking tasks use clear structure: situation, request, response." },
    { rule: "Use polite suggestions: Ich würde vorschlagen..." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: polite suggestions + clear structure.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose a good suggestion phrase.",
      options: ["Ich würde vorschlagen...", "Nein.", "Keine Ahnung.", "Vielleicht nie."],
      answer: "Ich würde vorschlagen...",
      explanation: "Polite suggestion in exams.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Könnten ___ den Termin verschieben?'",
      options: ["wir", "uns", "ihr", "dich"],
      answer: "wir",
      explanation: "Use wir for a joint suggestion.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I suggest we meet at 10.'",
      words: ["Ich", "schlage", "vor", ",", "dass", "wir", "um", "10", "treffen", "."],
      answer: "Ich schlage vor, dass wir um 10 treffen.",
      explanation: "Suggestion with dass-clause.",
    },
    {
      kind: "production",
      prompt: "Timed (45s): Roleplay a short exam speaking task.",
      answer: "",
      sampleAnswer: "Ich würde vorschlagen, dass wir um zehn treffen. Passt das für dich?",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use a suggestion and a question.",
    },
  ]

  const context: LessonContext = {
    title: "Handle speaking roleplays under exam conditions",
    abilityObjective: "Complete short speaking tasks with polite suggestions.",
    vocabulary: [
      { german: "vorschlagen", english: "to suggest" },
      { german: "einverstanden", english: "agreed" },
      { german: "der Vorschlag", english: "the suggestion" },
      { german: "die Aufgabe", english: "the task" },
      { german: "die Prüfung", english: "the exam" },
    ],
    dialogue: [
      { speaker: "Prüfer", german: "Machen Sie einen Vorschlag.", english: "Make a suggestion." },
      { speaker: "Kandidat", german: "Ich würde vorschlagen, dass wir um zehn treffen.", english: "I would suggest we meet at ten." },
    ],
    production: {
      prompt: "Timed (45s): Answer a roleplay prompt with a suggestion.",
      sampleAnswer: "Ich würde vorschlagen, dass wir heute um 18 Uhr telefonieren.",
    },
    skillUnlock: "You can handle speaking roleplays in exams.",
    reviewSuggestion: "Practice one suggestion phrase aloud.",
  }

  const contextByPurpose = buildPurposeMap(() => context)

  return buildLessonFromContext("exams-speaking", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildPrateritum(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Präteritum is common in written stories: war, hatte, ging, kam." },
    { rule: "Use simple past for common verbs in narratives." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: war/hatte/ging are common Präteritum forms.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the Präteritum form of 'sein'.",
      options: ["war", "bin", "gewesen", "ist"],
      answer: "war",
      explanation: "Präteritum of sein = war.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Gestern ___ ich zur Arbeit.'",
      options: ["ging", "gehe", "bin gegangen", "geht"],
      answer: "ging",
      explanation: "Präteritum: ging.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I was at home.'",
      words: ["Ich", "war", "zu", "Hause", "."],
      answer: "Ich war zu Hause.",
      explanation: "Simple past of sein.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Tell a short story in the past.",
      answer: "",
      sampleAnswer: "Ich war gestern im Büro und hatte viel zu tun.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use war/hatte/ging.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Tell short stories in the past ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use Präteritum to narrate a simple past event ${t.place.de}.`,
      vocabulary: [
        { german: "war", english: "was" },
        { german: "hatte", english: "had" },
        { german: "ging", english: "went" },
        { german: t.place.de, english: t.place.en },
        { german: t.task.de, english: t.task.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Gestern war ich ${t.place.de}.`, english: `Yesterday I was ${t.place.en}.` },
        { speaker: t.speakerB, german: `Ich hatte viel zu tun.`, english: "I had a lot to do." },
      ],
      production: {
        prompt: `Roleplay: Say two past sentences about ${t.task.de}.`,
        sampleAnswer: `Ich war ${t.place.de} und hatte ${t.task.de}.`,
      },
      skillUnlock: "You can narrate past events with Präteritum.",
      reviewSuggestion: "Say three Präteritum forms.",
    }
  })

  return buildLessonFromContext("prateritum", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildPassiveVoice(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Passive voice: werden + Partizip II (Das Projekt wird geplant)." },
    { rule: "Focus on the action, not the actor." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: werden + Partizip II = passive.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct passive sentence.",
      options: [
        "Der Bericht wird geschrieben.",
        "Der Bericht schreibt.",
        "Der Bericht ist schreiben.",
        "Der Bericht wurde schreiben.",
      ],
      answer: "Der Bericht wird geschrieben.",
      explanation: "werden + Partizip II.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Das Formular ___ ausgefüllt.'",
      options: ["wird", "werden", "wurde", "ist"],
      answer: "wird",
      explanation: "Present passive uses wird.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'The ticket is checked.'",
      words: ["Die", "Fahrkarte", "wird", "kontrolliert", "."],
      answer: "Die Fahrkarte wird kontrolliert.",
      explanation: "Passive structure.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Describe a process using passive.",
      answer: "",
      sampleAnswer: "Das Formular wird ausgefüllt und abgegeben.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use passive voice.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Describe processes and what was done ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use passive voice to describe processes with ${t.document.de}.`,
      vocabulary: [
        { german: "werden", english: "to become / will be" },
        { german: "ausgefüllt", english: "filled out" },
        { german: "geprüft", english: "checked" },
        { german: t.document.de, english: t.document.en },
        { german: t.task.de, english: t.task.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Das Formular wird geprüft.`, english: "The form is checked." },
        { speaker: t.speakerB, german: `Der Bericht wird später gesendet.`, english: "The report is sent later." },
      ],
      production: {
        prompt: `Roleplay: Describe how ${t.task.de} is done.`,
        sampleAnswer: `${t.task.de} wird vorbereitet und abgeschlossen.`,
      },
      skillUnlock: "You can describe processes with passive voice.",
      reviewSuggestion: "Turn one sentence into passive.",
    }
  })

  return buildLessonFromContext("passive-voice", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildKonjunktiv2(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Konjunktiv II for polite requests: Ich hätte gern..., Könnten Sie...?" },
    { rule: "würde + infinitive is common: Ich würde gern kommen." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: würde + infinitive for polite requests.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the polite request.",
      options: ["Ich hätte gern einen Termin.", "Gib mir einen Termin.", "Termin!", "Ich will Termin."],
      answer: "Ich hätte gern einen Termin.",
      explanation: "Ich hätte gern is polite.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Ich ___ gern mehr Zeit haben.'",
      options: ["würde", "wurde", "werde", "will"],
      answer: "würde",
      explanation: "würde + infinitive.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'Could you help me?'",
      words: ["Könnten", "Sie", "mir", "helfen", "?"],
      answer: "Könnten Sie mir helfen?",
      explanation: "Polite request.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Make a polite request.",
      answer: "",
      sampleAnswer: "Könnten Sie mir den Bericht schicken?",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use Konjunktiv II.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Make polite requests and talk about hypotheticals ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use Konjunktiv II to make polite requests ${t.place.de}.`,
      vocabulary: [
        { german: "würde", english: "would" },
        { german: "hätte gern", english: "would like" },
        { german: "könnten", english: "could" },
        { german: t.document.de, english: t.document.en },
        { german: t.service.de, english: t.service.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Könnten Sie mir ${t.document.de} schicken?`, english: `Could you send me ${t.document.en}?` },
        { speaker: t.speakerB, german: `Gern, ich würde es heute senden.`, english: "Sure, I would send it today." },
      ],
      production: {
        prompt: `Roleplay: Ask politely for ${t.item.de}.`,
        sampleAnswer: `Ich hätte gern ${t.item.de}, bitte.`,
      },
      skillUnlock: "You can make polite requests with Konjunktiv II.",
      reviewSuggestion: "Say two polite requests.",
    }
  })

  return buildLessonFromContext("konjunktiv-2", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildGenitivCase(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Genitive shows possession: des Mannes, der Frau." },
    { rule: "Common genitive prepositions: trotz, während, wegen." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: des/der + noun for possession.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct genitive: 'die Farbe ___ Hauses'",
      options: ["des", "dem", "den", "der"],
      answer: "des",
      explanation: "Genitive masculine/neuter uses des.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: '___ Termins gibt es keine Zeit.'",
      options: ["Wegen", "Mit", "Ohne", "Für"],
      answer: "Wegen",
      explanation: "wegen + Genitiv.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'The report of the project.'",
      words: ["der", "Bericht", "des", "Projekts"],
      answer: "der Bericht des Projekts",
      explanation: "Genitive: des Projekts.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Describe ownership using genitive.",
      answer: "",
      sampleAnswer: "Der Bericht des Teams ist fertig.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use des/der.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Express ownership and formal relations ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use genitive to describe ${t.task.de} and formal relations.`,
      vocabulary: [
        { german: "des", english: "of the" },
        { german: "der", english: "of the" },
        { german: "wegen", english: "because of" },
        { german: t.task.de, english: t.task.en },
        { german: t.document.de, english: t.document.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Der Bericht des Teams ist fertig.`, english: "The team's report is finished." },
        { speaker: t.speakerB, german: `Wegen des Termins müssen wir warten.`, english: "Because of the appointment we must wait." },
      ],
      production: {
        prompt: `Roleplay: Say a genitive phrase about ${t.task.de}.`,
        sampleAnswer: `Die Ergebnisse des Projekts sind gut.`,
      },
      skillUnlock: "You can express possession with genitive.",
      reviewSuggestion: "Make one genitive phrase with des/der.",
    }
  })

  return buildLessonFromContext("genitiv-case", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildAdvancedConnectors(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Advanced connectors: obwohl, trotzdem, indem, während." },
    { rule: "Subordinate clauses place the verb at the end." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: obwohl/indem + verb-final clause.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct connector: '___ es regnet, gehen wir.'",
      options: ["Obwohl", "Weil", "Dass", "Und"],
      answer: "Obwohl",
      explanation: "Obwohl = although.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Er verbessert sich, ___ er jeden Tag übt.'",
      options: ["indem", "weil", "dass", "aber"],
      answer: "indem",
      explanation: "indem = by doing.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'Although the project is hard, we continue.'",
      words: ["Obwohl", "das", "Projekt", "schwer", "ist", ",", "machen", "wir", "weiter", "."],
      answer: "Obwohl das Projekt schwer ist, machen wir weiter.",
      explanation: "Verb at end in obwohl-clause.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Use obwohl or indem in a sentence.",
      answer: "",
      sampleAnswer: "Obwohl ich müde bin, arbeite ich weiter.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use one advanced connector.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Build complex arguments with nuance ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use advanced connectors to discuss ${t.task.de}.`,
      vocabulary: [
        { german: "obwohl", english: "although" },
        { german: "trotzdem", english: "nevertheless" },
        { german: "indem", english: "by doing" },
        { german: t.task.de, english: t.task.en },
        { german: t.service.de, english: t.service.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Obwohl wir wenig Zeit haben, machen wir weiter.`, english: "Although we have little time, we continue." },
        { speaker: t.speakerB, german: `Wir schaffen es, indem wir priorisieren.`, english: "We manage by prioritizing." },
      ],
      production: {
        prompt: `Roleplay: Explain a challenge ${t.place.de} with obwohl.`,
        sampleAnswer: `Obwohl ich wenig Zeit habe, beende ich ${t.task.de}.`,
      },
      skillUnlock: "You can express nuance with advanced connectors.",
      reviewSuggestion: "Use obwohl and indem in two sentences.",
    }
  })

  return buildLessonFromContext("advanced-connectors", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildWerdenForms(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "werden is used for future and passive: Ich werde gehen. Das wird gemacht." },
    { rule: "werden + infinitive for future, werden + Partizip for passive." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: werde + infinitive (future), wird + Partizip (passive).",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the future sentence.",
      options: ["Ich werde morgen kommen.", "Ich komme gestern.", "Ich wurde morgen kommen.", "Ich werde gekommen."],
      answer: "Ich werde morgen kommen.",
      explanation: "Future uses werde + infinitive.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Der Bericht ___ heute geschrieben.'",
      options: ["wird", "werden", "werde", "wurde"],
      answer: "wird",
      explanation: "Passive present: wird geschrieben.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I will send the email.'",
      words: ["Ich", "werde", "die", "E-Mail", "senden", "."],
      answer: "Ich werde die E-Mail senden.",
      explanation: "werden + infinitive.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Say one future plan and one passive process.",
      answer: "",
      sampleAnswer: "Ich werde morgen anrufen. Der Bericht wird geprüft.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use werden in two ways.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Master every use of 'werden' ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use werden for future plans and processes with ${t.task.de}.`,
      vocabulary: [
        { german: "werden", english: "to become / will" },
        { german: "morgen", english: "tomorrow" },
        { german: "geprüft", english: "checked" },
        { german: t.task.de, english: t.task.en },
        { german: t.document.de, english: t.document.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Ich werde ${t.document.de} morgen senden.`, english: `I will send ${t.document.en} tomorrow.` },
        { speaker: t.speakerB, german: `Das Formular wird heute geprüft.`, english: "The form is checked today." },
      ],
      production: {
        prompt: `Roleplay: Say one plan and one process ${t.place.de}.`,
        sampleAnswer: `Ich werde ${t.task.de} beenden. ${t.document.de} wird geprüft.`,
      },
      skillUnlock: "You can use werden for future and passive.",
      reviewSuggestion: "Make one future and one passive sentence.",
    }
  })

  return buildLessonFromContext("werden-forms", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildVerbsWithPrep(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Some verbs require fixed prepositions: warten auf, denken an, sich freuen auf." },
    { rule: "Use da-/wo- compounds: daran, darauf, woran." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: Verb + preposition are fixed pairs.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the correct preposition: 'warten ___ den Zug'",
      options: ["auf", "an", "mit", "für"],
      answer: "auf",
      explanation: "warten auf + accusative.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Ich denke ___ das Meeting.'",
      options: ["an", "auf", "mit", "zu"],
      answer: "an",
      explanation: "denken an.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'I am looking forward to the trip.'",
      words: ["Ich", "freue", "mich", "auf", "die", "Reise", "."],
      answer: "Ich freue mich auf die Reise.",
      explanation: "sich freuen auf.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Use two verb-preposition pairs.",
      answer: "",
      sampleAnswer: "Ich warte auf den Termin und denke an die Prüfung.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use fixed pairs.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Use verb-preposition combos naturally ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use fixed verb-preposition pairs with ${t.task.de}.`,
      vocabulary: [
        { german: "warten auf", english: "to wait for" },
        { german: "denken an", english: "to think about" },
        { german: "sich freuen auf", english: "to look forward to" },
        { german: t.service.de, english: t.service.en },
        { german: t.task.de, english: t.task.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Ich warte auf ${t.service.de}.`, english: `I'm waiting for ${t.service.en}.` },
        { speaker: t.speakerB, german: `Ich denke an ${t.task.de}.`, english: `I'm thinking about ${t.task.en}.` },
      ],
      production: {
        prompt: `Roleplay: Use two verb-preposition pairs ${t.place.de}.`,
        sampleAnswer: `Ich freue mich auf ${t.service.de} und warte auf ${t.item.de}.`,
      },
      skillUnlock: "You can use verb-preposition combinations correctly.",
      reviewSuggestion: "Write three verb-preposition pairs.",
    }
  })

  return buildLessonFromContext("verbs-with-prep", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildKonjunktiv1(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Konjunktiv I is used for reported speech in formal contexts." },
    { rule: "Example: Er sagt, er habe keine Zeit." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: report statements with Konjunktiv I.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the reported speech form.",
      options: ["Er sagt, er habe Zeit.", "Er sagt, er hat Zeit.", "Er sagt, er hatte Zeit.", "Er sagt, er haben Zeit."],
      answer: "Er sagt, er habe Zeit.",
      explanation: "Konjunktiv I: habe.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Sie sagt, sie ___ krank.'",
      options: ["sei", "ist", "war", "wäre"],
      answer: "sei",
      explanation: "Konjunktiv I of sein: sei.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'He says he is ready.'",
      words: ["Er", "sagt", ",", "er", "sei", "bereit", "."],
      answer: "Er sagt, er sei bereit.",
      explanation: "Reported speech structure.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Report a short statement.",
      answer: "",
      sampleAnswer: "Sie sagt, sie habe den Bericht geschickt.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use Konjunktiv I.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Report what others said formally ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use Konjunktiv I to report statements about ${t.task.de}.`,
      vocabulary: [
        { german: "sagen", english: "to say" },
        { german: "berichten", english: "to report" },
        { german: "er habe", english: "he has (reported)" },
        { german: t.task.de, english: t.task.en },
        { german: t.document.de, english: t.document.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Er sagt, er habe ${t.document.de} geschickt.`, english: `He says he has sent ${t.document.en}.` },
        { speaker: t.speakerB, german: `Gut, dann ist es erledigt.`, english: "Good, then it's done." },
      ],
      production: {
        prompt: `Roleplay: Report a statement ${t.place.de}.`,
        sampleAnswer: `Sie sagt, sie sei heute ${t.place.de}.`,
      },
      skillUnlock: "You can report statements in formal register.",
      reviewSuggestion: "Rewrite one sentence in Konjunktiv I.",
    }
  })

  return buildLessonFromContext("konjunktiv-1", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildNominalization(options: LessonOptions): LessonContent {
  const grammarPoints: GrammarPoint[] = [
    { rule: "Nominalization turns verbs into nouns: planen -> die Planung." },
    { rule: "Formal style uses nouns: zur Verfügung stellen." },
  ]

  const grammarSummary: GrammarPoint = {
    rule: "Grammar snapshot: verb -> noun for formal writing.",
  }

  const exercises: Exercise[] = [
    {
      kind: "multiple-choice",
      prompt: "Choose the nominalization of 'entscheiden'.",
      options: ["die Entscheidung", "der Entscheiden", "das Entscheiden", "die Entscheiden"],
      answer: "die Entscheidung",
      explanation: "Decision = die Entscheidung.",
    },
    {
      kind: "fill-blank",
      prompt: "Complete: 'Bitte schicken Sie die ___ (Bestätigen).'",
      options: ["Bestätigung", "Bestätigen", "Bestätigt", "Bestätige"],
      answer: "Bestätigung",
      explanation: "Nominalization: Bestätigung.",
    },
    {
      kind: "reorder",
      prompt: "Order the sentence: 'The implementation is planned.'",
      words: ["Die", "Umsetzung", "ist", "geplant", "."],
      answer: "Die Umsetzung ist geplant.",
      explanation: "Nominalized form.",
    },
    {
      kind: "production",
      prompt: "Roleplay: Write one formal sentence using a noun form.",
      answer: "",
      sampleAnswer: "Die Planung des Projekts beginnt morgen.",
      mode: options.learningStyle === "speaking" ? "speaking" : "writing",
      explanation: "Use a nominalized form.",
    },
  ]

  const contextByPurpose = buildPurposeMap((purpose) => {
    const t = PURPOSE_TEMPLATES[purpose]
    return {
      title: `Write in professional and academic style ${PURPOSE_LABELS[purpose]}`,
      abilityObjective: `Use nominalizations to describe ${t.task.de} formally.`,
      vocabulary: [
        { german: "die Planung", english: "the planning" },
        { german: "die Entscheidung", english: "the decision" },
        { german: "die Durchführung", english: "the execution" },
        { german: t.task.de, english: t.task.en },
        { german: t.document.de, english: t.document.en },
      ],
      dialogue: [
        { speaker: t.speakerA, german: `Die Planung des Projekts ist abgeschlossen.`, english: "The planning of the project is finished." },
        { speaker: t.speakerB, german: `Gut, die Durchführung beginnt morgen.`, english: "Good, the execution starts tomorrow." },
      ],
      production: {
        prompt: `Roleplay: Write one formal sentence about ${t.task.de}.`,
        sampleAnswer: `Die Durchführung von ${t.task.de} beginnt morgen.`,
      },
      skillUnlock: "You can write in a more formal style.",
      reviewSuggestion: "Convert one verb into a noun.",
    }
  })

  return buildLessonFromContext("nominalization", options, contextByPurpose, grammarPoints, grammarSummary, exercises)
}

function buildLessonContent(lessonId: string, options: LessonOptions): LessonContent | null {
  switch (lessonId) {
    case "greetings-intro":
      return buildGreetingsIntro(options)
    case "numbers-time":
      return buildNumbersTime(options)
    case "personal-pronouns":
      return buildPersonalPronouns(options)
    case "articles-gender":
      return buildArticlesGender(options)
    case "present-tense":
      return buildPresentTense(options)
    case "everyday-phrases":
      return buildEverydayPhrases(options)
    case "negation":
      return buildNegation(options)
    case "question-words":
      return buildQuestionWords(options)
    case "modal-verbs":
      return buildModalVerbs(options)
    case "accusative-case":
      return buildAccusativeCase(options)
    case "dative-case":
      return buildDativeCase(options)
    case "separable-verbs":
      return buildSeparableVerbs(options)
    case "prepositions-by-case":
      return buildPrepositionsByCase(options)
    case "past-perfekt":
      return buildPastPerfekt(options)
    case "connectors-weil-dass":
      return buildConnectorsWeilDass(options)
    case "reflexive-verbs":
      return buildReflexiveVerbs(options)
    case "possessive-articles":
      return buildPossessiveArticles(options)
    case "comparatives-superlatives":
      return buildComparativesSuperlatives(options)
    case "relative-clauses":
      return buildRelativeClauses(options)
    case "work-office-comm":
      return buildWorkOfficeComm(options)
    case "work-meetings":
      return buildWorkMeetings(options)
    case "travel-navigation":
      return buildTravelNavigation(options)
    case "travel-dining":
      return buildTravelDining(options)
    case "relocation-registration":
      return buildRelocationRegistration(options)
    case "relocation-housing":
      return buildRelocationHousing(options)
    case "study-university":
      return buildStudyUniversity(options)
    case "study-presentations":
      return buildStudyPresentations(options)
    case "daily-shopping":
      return buildDailyShopping(options)
    case "daily-health":
      return buildDailyHealth(options)
    case "exams-writing":
      return buildExamsWriting(options)
    case "exams-speaking":
      return buildExamsSpeaking(options)
    case "prateritum":
      return buildPrateritum(options)
    case "passive-voice":
      return buildPassiveVoice(options)
    case "konjunktiv-2":
      return buildKonjunktiv2(options)
    case "genitiv-case":
      return buildGenitivCase(options)
    case "advanced-connectors":
      return buildAdvancedConnectors(options)
    case "werden-forms":
      return buildWerdenForms(options)
    case "verbs-with-prep":
      return buildVerbsWithPrep(options)
    case "konjunktiv-1":
      return buildKonjunktiv1(options)
    case "nominalization":
      return buildNominalization(options)
    default:
      return null
  }
}

export function getLessonContent(lessonId: string, options: LessonOptions = {}): LessonContent | null {
  const content = buildLessonContent(lessonId, options)
  if (!content) return null
  return ensureExamTiming(content)
}

export interface PracticeExercise {
  id: string
  lessonId: string
  lessonTitle: string
  kind: ExerciseKind
  prompt: string
  answer: string
  options?: string[]
  words?: string[]
  pairs?: { left: string; right: string }[]
  explanation?: string
}

export function getAllPracticeExercises(options: LessonOptions = {}): PracticeExercise[] {
  const result: PracticeExercise[] = []
  for (const lessonId of LESSON_IDS) {
    const content = getLessonContent(lessonId, options)
    if (!content) continue
    content.exercises
      .filter(ex => ex.kind !== "production")
      .forEach((ex, i) => {
        result.push({
          id: `${content.lessonId}-ex-${i}`,
          lessonId: content.lessonId,
          lessonTitle: content.title,
          kind: ex.kind,
          prompt: ex.prompt,
          answer: ex.answer,
          options: ex.options,
          words: ex.words,
          pairs: ex.pairs,
          explanation: ex.explanation,
        })
      })
  }
  return result
}

export function getLessonNames(options: LessonOptions = {}): { id: string; title: string }[] {
  return LESSON_IDS.map(id => {
    const content = getLessonContent(id, options)
    return {
      id,
      title: content?.title ?? id,
    }
  })
}
