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
      words: ["mich", "Freut", "."],
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
    default:
      return null
  }
}

export function getLessonContent(lessonId: string, options: LessonOptions = {}): LessonContent | null {
  return buildLessonContent(lessonId, options)
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
