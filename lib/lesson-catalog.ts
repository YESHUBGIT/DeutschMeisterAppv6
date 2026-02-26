import type { Purpose } from "./use-learner-profile"

/* ═══════════════════════════════════════════════════
   DeutschMeister — Ability-Based Lesson Catalog

   DESIGN RULES:
   1. Titles describe what you CAN DO, not grammar names.
      Bad:  "The Dative Case"
      Good: "Describe responsibilities using indirect objects"
   2. Grammar is taught inside the ability context.
   3. Each lesson has explicit prerequisiteIds (strict DAG).
   4. Contexts link to purpose tracks for personalization.
   5. S-curve: Quick Wins -> Structured Growth -> Mastery.
   ═══════════════════════════════════════════════════ */

export type CEFRLevel = "a1" | "a2" | "b1" | "b2" | "c1"
export type Phase = 1 | 2 | 3

export interface LessonCatalogItem {
  id: string
  /** Ability-based title: what you can DO after this lesson */
  title: string
  /** Grammar being taught inside this ability */
  grammarTag: string
  group: string
  cefr: CEFRLevel
  phase: Phase
  prerequisiteIds: string[]
  contexts: "all" | Purpose[]
  grammarFocus: string
  vocabHint: string
}

export const lessonCatalog: LessonCatalogItem[] = [
  /* ══════════ PHASE 1: Quick Wins (A1) ══════════ */
  {
    id: "greetings-intro",
    title: "Introduce yourself and greet people",
    grammarTag: "sein / heißen",
    group: "Quick Wins",
    cefr: "a1", phase: 1,
    prerequisiteIds: [],
    contexts: "all",
    grammarFocus: "Sein/heißen present, basic word order",
    vocabHint: "Hallo, Guten Tag, ich heiße, woher kommen Sie",
  },
  {
    id: "numbers-time",
    title: "Handle numbers, time, and appointments",
    grammarTag: "Numbers & time",
    group: "Quick Wins",
    cefr: "a1", phase: 1,
    prerequisiteIds: ["greetings-intro"],
    contexts: "all",
    grammarFocus: "Cardinal/ordinal numbers, time expressions",
    vocabHint: "eins-hundert, Uhr, Montag-Sonntag",
  },
  {
    id: "personal-pronouns",
    title: "Address people with the right level of formality",
    grammarTag: "Pronouns & register",
    group: "Quick Wins",
    cefr: "a1", phase: 1,
    prerequisiteIds: ["greetings-intro"],
    contexts: "all",
    grammarFocus: "ich/du/er/sie/es/wir/ihr/Sie, formal vs informal",
    vocabHint: "Sie vs du register",
  },
  {
    id: "articles-gender",
    title: "Name things around you with correct articles",
    grammarTag: "der / die / das",
    group: "Quick Wins",
    cefr: "a1", phase: 1,
    prerequisiteIds: ["personal-pronouns"],
    contexts: "all",
    grammarFocus: "der/die/das, ein/eine, gender patterns",
    vocabHint: "Common nouns with articles",
  },
  {
    id: "present-tense",
    title: "Describe daily actions and routines",
    grammarTag: "Present tense verbs",
    group: "Quick Wins",
    cefr: "a1", phase: 1,
    prerequisiteIds: ["personal-pronouns"],
    contexts: "all",
    grammarFocus: "Regular verb conjugation, haben/sein",
    vocabHint: "machen, arbeiten, wohnen, sprechen, gehen",
  },
  {
    id: "everyday-phrases",
    title: "Survive basic real-world interactions",
    grammarTag: "Fixed expressions",
    group: "Quick Wins",
    cefr: "a1", phase: 1,
    prerequisiteIds: ["numbers-time"],
    contexts: "all",
    grammarFocus: "Fixed expressions, polite requests",
    vocabHint: "Entschuldigung, bitte, danke, Wie viel kostet...",
  },
  {
    id: "negation",
    title: "Express what you don't have or don't do",
    grammarTag: "nicht / kein",
    group: "Quick Wins",
    cefr: "a1", phase: 1,
    prerequisiteIds: ["articles-gender", "present-tense"],
    contexts: "all",
    grammarFocus: "nicht vs kein placement rules",
    vocabHint: "Das ist nicht..., Ich habe kein...",
  },
  {
    id: "question-words",
    title: "Ask questions to get information you need",
    grammarTag: "W-Fragen",
    group: "Quick Wins",
    cefr: "a1", phase: 1,
    prerequisiteIds: ["present-tense"],
    contexts: "all",
    grammarFocus: "Wer/Was/Wo/Wann/Warum/Wie, V2 word order",
    vocabHint: "W-question sentence building",
  },

  /* ══════════ PHASE 2: Structured Growth (A2-B1) ══════════ */
  {
    id: "modal-verbs",
    title: "Express ability, obligation, and permission",
    grammarTag: "Modal verbs",
    group: "Building Blocks",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["present-tense", "negation"],
    contexts: "all",
    grammarFocus: "können/müssen/wollen/dürfen/sollen, bracket structure",
    vocabHint: "Ability, obligation, permission expressions",
  },
  {
    id: "accusative-case",
    title: "Talk about things you see, buy, and need",
    grammarTag: "Accusative case",
    group: "Building Blocks",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["articles-gender", "negation"],
    contexts: "all",
    grammarFocus: "den/einen, accusative pronouns, direct objects",
    vocabHint: "Ich sehe den Mann, Er kauft einen Kaffee",
  },
  {
    id: "dative-case",
    title: "Describe who you give, show, or explain things to",
    grammarTag: "Dative case",
    group: "Building Blocks",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["accusative-case"],
    contexts: "all",
    grammarFocus: "dem/einem, dative pronouns, indirect objects",
    vocabHint: "Ich gebe dem Mann, mit/von/zu + dative",
  },
  {
    id: "separable-verbs",
    title: "Talk about your daily routine step by step",
    grammarTag: "Separable verbs",
    group: "Building Blocks",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["modal-verbs"],
    contexts: "all",
    grammarFocus: "anfangen/aufhören/mitbringen, prefix placement",
    vocabHint: "aufstehen, einkaufen, anrufen",
  },
  {
    id: "prepositions-by-case",
    title: "Describe where things are and where you're going",
    grammarTag: "Prepositions + case",
    group: "Building Blocks",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["dative-case"],
    contexts: "all",
    grammarFocus: "Accusative/dative/two-way prepositions",
    vocabHint: "in, an, auf, unter, neben + Wechselpräpositionen",
  },
  {
    id: "past-perfekt",
    title: "Tell people what you did earlier today or this week",
    grammarTag: "Perfekt past tense",
    group: "Expressing the Past",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["separable-verbs", "accusative-case"],
    contexts: "all",
    grammarFocus: "haben/sein + Partizip II, regular & irregular",
    vocabHint: "Ich habe gemacht, Er ist gegangen",
  },
  {
    id: "connectors-weil-dass",
    title: "Explain reasons and share what you think",
    grammarTag: "weil / dass / wenn",
    group: "Complex Sentences",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["past-perfekt"],
    contexts: "all",
    grammarFocus: "Subordinate clause word order, verb-final",
    vocabHint: "weil ich arbeite, dass er kommt, wenn es regnet",
  },
  {
    id: "reflexive-verbs",
    title: "Describe personal care and emotional reactions",
    grammarTag: "Reflexive verbs",
    group: "Complex Sentences",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["dative-case"],
    contexts: "all",
    grammarFocus: "sich + accusative/dative reflexive pronouns",
    vocabHint: "sich waschen, sich freuen, sich vorstellen",
  },
  {
    id: "possessive-articles",
    title: "Talk about belongings and relationships",
    grammarTag: "Possessive articles",
    group: "Complex Sentences",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["dative-case"],
    contexts: "all",
    grammarFocus: "mein/dein/sein/ihr/unser in all cases",
    vocabHint: "Family, belongings, workplace ownership",
  },
  {
    id: "comparatives-superlatives",
    title: "Compare options and express preferences",
    grammarTag: "Comparatives",
    group: "Complex Sentences",
    cefr: "b1", phase: 2,
    prerequisiteIds: ["connectors-weil-dass"],
    contexts: "all",
    grammarFocus: "größer als, am größten, irregular forms",
    vocabHint: "gut/besser/am besten, gern/lieber/am liebsten",
  },
  {
    id: "relative-clauses",
    title: "Describe people and things with extra detail",
    grammarTag: "Relative clauses",
    group: "Complex Sentences",
    cefr: "b1", phase: 2,
    prerequisiteIds: ["connectors-weil-dass", "dative-case"],
    contexts: "all",
    grammarFocus: "der/die/das as relative pronouns, clause structure",
    vocabHint: "Der Mann, der hier arbeitet...",
  },

  /* ── Context-specific lessons ── */
  {
    id: "work-office-comm",
    title: "Write emails and communicate with colleagues",
    grammarTag: "Formal register",
    group: "Your Context",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["modal-verbs", "everyday-phrases"],
    contexts: ["work"],
    grammarFocus: "Formal Sie register, email structure, polite requests",
    vocabHint: "Termin, Besprechung, Kollege, Projekt, Anhang",
  },
  {
    id: "work-meetings",
    title: "Contribute to meetings and present ideas",
    grammarTag: "Argumentation",
    group: "Your Context",
    cefr: "b1", phase: 2,
    prerequisiteIds: ["work-office-comm", "connectors-weil-dass"],
    contexts: ["work"],
    grammarFocus: "Structuring arguments, giving opinions, agreeing/disagreeing",
    vocabHint: "Ich schlage vor, Meiner Meinung nach, zusammenfassend",
  },
  {
    id: "travel-navigation",
    title: "Get around a city using public transport",
    grammarTag: "Direction prepositions",
    group: "Your Context",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["question-words", "everyday-phrases"],
    contexts: ["travel"],
    grammarFocus: "Direction prepositions, imperative basics",
    vocabHint: "Bahnhof, Fahrkarte, links, rechts, umsteigen",
  },
  {
    id: "travel-dining",
    title: "Order food, ask for the bill, and tip correctly",
    grammarTag: "Ordering patterns",
    group: "Your Context",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["travel-navigation", "accusative-case"],
    contexts: ["travel"],
    grammarFocus: "Ordering patterns, Ich hätte gern, Die Rechnung bitte",
    vocabHint: "Speisekarte, Vorspeise, Getränk, Trinkgeld",
  },
  {
    id: "relocation-registration",
    title: "Register your address and navigate Bürgeramt",
    grammarTag: "Form vocabulary",
    group: "Your Context",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["everyday-phrases", "numbers-time"],
    contexts: ["relocation"],
    grammarFocus: "Form-filling vocabulary, formal requests",
    vocabHint: "Anmeldung, Bürgeramt, Ausweis, Formular, Termin",
  },
  {
    id: "relocation-housing",
    title: "Understand rental contracts and deal with landlords",
    grammarTag: "Contract language",
    group: "Your Context",
    cefr: "b1", phase: 2,
    prerequisiteIds: ["relocation-registration", "dative-case"],
    contexts: ["relocation"],
    grammarFocus: "Reading contracts, condition descriptions, complaints",
    vocabHint: "Mietvertrag, Kaution, Nebenkosten, Kündigung",
  },
  {
    id: "study-university",
    title: "Navigate university life and email professors",
    grammarTag: "Academic register",
    group: "Your Context",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["modal-verbs", "question-words"],
    contexts: ["study"],
    grammarFocus: "Academic register, email to professors, course admin",
    vocabHint: "Vorlesung, Seminar, Hausarbeit, Prüfung, Sprechstunde",
  },
  {
    id: "study-presentations",
    title: "Present arguments and discuss topics academically",
    grammarTag: "Structured discussion",
    group: "Your Context",
    cefr: "b1", phase: 2,
    prerequisiteIds: ["study-university", "relative-clauses"],
    contexts: ["study"],
    grammarFocus: "Presenting arguments, citing, structured discussion",
    vocabHint: "Erstens, darüber hinaus, im Gegensatz zu",
  },
  {
    id: "daily-shopping",
    title: "Shop for groceries and handle everyday errands",
    grammarTag: "Quantities & prices",
    group: "Your Context",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["numbers-time", "accusative-case"],
    contexts: ["daily"],
    grammarFocus: "Quantities, prices, polite requests, comparisons",
    vocabHint: "Supermarkt, Bäcker, Wie viel, Größe, Angebot",
  },
  {
    id: "daily-health",
    title: "Describe symptoms and visit a doctor",
    grammarTag: "Body & health",
    group: "Your Context",
    cefr: "a2", phase: 2,
    prerequisiteIds: ["daily-shopping", "reflexive-verbs"],
    contexts: ["daily", "relocation"],
    grammarFocus: "Body parts, symptoms, appointments",
    vocabHint: "Arzt, Kopfschmerzen, Rezept, Versicherung",
  },
  {
    id: "exams-writing",
    title: "Write formal letters and emails for exams",
    grammarTag: "Letter structure",
    group: "Your Context",
    cefr: "b1", phase: 2,
    prerequisiteIds: ["connectors-weil-dass", "past-perfekt"],
    contexts: ["exams"],
    grammarFocus: "Formal/informal letter structure, Goethe/TELC format",
    vocabHint: "Sehr geehrte, Mit freundlichen Grüßen, Betreff",
  },
  {
    id: "exams-speaking",
    title: "Handle speaking roleplays under exam conditions",
    grammarTag: "Roleplay patterns",
    group: "Your Context",
    cefr: "b1", phase: 2,
    prerequisiteIds: ["exams-writing", "modal-verbs"],
    contexts: ["exams"],
    grammarFocus: "Roleplay structures, agreeing/disagreeing, proposing",
    vocabHint: "Ich würde vorschlagen, Könnten wir, Einverstanden",
  },

  /* ══════════ PHASE 3: Mastery (B2-C1) ══════════ */
  {
    id: "prateritum",
    title: "Tell stories and narrate past events naturally",
    grammarTag: "Präteritum",
    group: "Precision",
    cefr: "b1", phase: 3,
    prerequisiteIds: ["past-perfekt", "relative-clauses"],
    contexts: "all",
    grammarFocus: "Simple past for common verbs, written narrative",
    vocabHint: "war, hatte, ging, kam",
  },
  {
    id: "passive-voice",
    title: "Describe processes and what was done",
    grammarTag: "Passive voice",
    group: "Precision",
    cefr: "b2", phase: 3,
    prerequisiteIds: ["prateritum"],
    contexts: "all",
    grammarFocus: "werden + Partizip II, Vorgangs- vs Zustandspassiv",
    vocabHint: "Das Buch wird gelesen, Es wurde gebaut",
  },
  {
    id: "konjunktiv-2",
    title: "Make polite requests and talk about hypotheticals",
    grammarTag: "Konjunktiv II",
    group: "Precision",
    cefr: "b2", phase: 3,
    prerequisiteIds: ["passive-voice"],
    contexts: "all",
    grammarFocus: "Polite requests, hypotheticals, würde + Infinitiv",
    vocabHint: "Ich würde gern, Wenn ich könnte, hätte ich",
  },
  {
    id: "genitiv-case",
    title: "Express ownership and use formal prepositions",
    grammarTag: "Genitive case",
    group: "Precision",
    cefr: "b2", phase: 3,
    prerequisiteIds: ["prateritum"],
    contexts: "all",
    grammarFocus: "des/eines, genitive prepositions, n-declension",
    vocabHint: "trotz, während, wegen, statt + Genitiv",
  },
  {
    id: "advanced-connectors",
    title: "Build complex arguments with nuance",
    grammarTag: "Advanced connectors",
    group: "Fluency",
    cefr: "b2", phase: 3,
    prerequisiteIds: ["konjunktiv-2", "relative-clauses"],
    contexts: "all",
    grammarFocus: "obwohl, trotzdem, indem, anstatt zu, um...zu",
    vocabHint: "Concession, purpose, manner clauses",
  },
  {
    id: "werden-forms",
    title: "Master every use of 'werden'",
    grammarTag: "werden overview",
    group: "Fluency",
    cefr: "b2", phase: 3,
    prerequisiteIds: ["passive-voice", "konjunktiv-2"],
    contexts: "all",
    grammarFocus: "Future, passive, Konjunktiv II — werden overview",
    vocabHint: "Ich werde machen, Es wird gemacht",
  },
  {
    id: "verbs-with-prep",
    title: "Use verb-preposition combos like a native",
    grammarTag: "Verbs + prepositions",
    group: "Fluency",
    cefr: "b2", phase: 3,
    prerequisiteIds: ["advanced-connectors"],
    contexts: "all",
    grammarFocus: "Fixed verb-preposition combos, da-/wo- compounds",
    vocabHint: "sich freuen auf, warten auf, denken an",
  },
  {
    id: "konjunktiv-1",
    title: "Report what others said in formal register",
    grammarTag: "Konjunktiv I",
    group: "Mastery",
    cefr: "c1", phase: 3,
    prerequisiteIds: ["konjunktiv-2", "advanced-connectors"],
    contexts: ["work", "study", "exams"],
    grammarFocus: "Indirect speech in formal/academic register",
    vocabHint: "Er sagte, er habe... Die Zeitung berichtet, dass...",
  },
  {
    id: "nominalization",
    title: "Write in professional and academic style",
    grammarTag: "Nominalization",
    group: "Mastery",
    cefr: "c1", phase: 3,
    prerequisiteIds: ["konjunktiv-1", "genitiv-case"],
    contexts: ["work", "study", "exams"],
    grammarFocus: "Verb -> noun transformations, formal writing style",
    vocabHint: "die Besprechung, die Durchführung, zur Verfügung stellen",
  },
]

/* ── Build personalized pathway ── */
export function buildPersonalizedCatalog(purpose: Purpose | null): LessonCatalogItem[] {
  const purposeKey = purpose ?? "daily"
  return lessonCatalog.filter((lesson) => {
    if (lesson.contexts === "all") return true
    return lesson.contexts.includes(purposeKey)
  })
}

export function isLessonUnlocked(lesson: LessonCatalogItem, completed: Set<string>): boolean {
  return lesson.prerequisiteIds.every((pid) => completed.has(pid))
}

export function getCurrentLesson(
  catalog: LessonCatalogItem[],
  completed: Set<string>
): LessonCatalogItem | null {
  return catalog.find((l) => !completed.has(l.id) && isLessonUnlocked(l, completed)) ?? null
}
