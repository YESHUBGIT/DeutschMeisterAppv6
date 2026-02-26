"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import type { TabType } from "@/app/page"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IgelMascot, type IgelMood } from "@/components/igel/igel-mascot"
import { useSoundSettings } from "@/lib/use-sound-settings"
import { ChevronRight, ChevronDown, BookText, Layers, Target, Zap, CheckCircle2, Clock, Star, AlertCircle, Lightbulb, GitBranch, ArrowRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface LessonsTabProps {
  onNavigate: (tab: TabType) => void
  onNavigateWithLesson?: (tab: TabType, lessonId?: string) => void
}

// Tree structure for verb lessons
type LessonTable = {
  title?: string
  headers: string[]
  rows: string[][]
}

type LessonContent = {
  concept: string
  keyPoints: string[]
  table: LessonTable | LessonTable[]
  examples: Array<{ german: string; english: string }>
  tip: string
}

type PlacementLevel = "A1" | "A2" | "B1" | "B2" | "C1"

type LessonQuestion = {
  prompt: string
  choices: string[]
  answer: string
  explanation?: string
}

const placementLevels: Array<{ level: PlacementLevel; label: string; description: string }> = [
  { level: "A1", label: "A1 Starter", description: "You can greet, introduce yourself, and say simple facts." },
  { level: "A2", label: "A2 Basics", description: "You can handle daily routines, shopping, and simple past." },
  { level: "B1", label: "B1 Independent", description: "You can talk about work, travel, and give opinions." },
  { level: "B2", label: "B2 Confident", description: "You can debate topics and understand longer texts." },
  { level: "C1", label: "C1 Advanced", description: "You can express yourself fluently and precisely." },
]

const placementQuestions = [
  {
    prompt: "Pick the correct sentence for: 'I would like a coffee.'",
    choices: ["Ich hätte gern einen Kaffee.", "Ich habe gern einen Kaffee.", "Ich werde gern einen Kaffee."],
    answer: "Ich hätte gern einen Kaffee.",
  },
  {
    prompt: "Which sentence uses verb-second word order correctly?",
    choices: ["Heute ich gehe ins Büro.", "Heute gehe ich ins Büro.", "Gehe heute ich ins Büro."],
    answer: "Heute gehe ich ins Büro.",
  },
  {
    prompt: "Choose the correct case: 'Ich helfe ___.'",
    choices: ["dich", "dir", "du"],
    answer: "dir",
  },
  {
    prompt: "Pick the correct perfect tense: 'Ich ___ nach Hause gegangen.'",
    choices: ["bin", "habe", "war"],
    answer: "bin",
  },
  {
    prompt: "Choose the correct connector: 'Ich bleibe, ___ ich müde bin.'",
    choices: ["weil", "oder", "trotzdem"],
    answer: "weil",
  },
]

const welcomePrompts = [
  {
    title: "What are you in the mood for today?",
    description: "Pick a short win or dive into a focused lesson to keep your streak alive.",
  },
  {
    title: "Ready for a quick German boost?",
    description: "Choose a bite-sized mission or a deeper drill to level up.",
  },
  {
    title: "Today is a great day to practice",
    description: "We picked a couple of options to keep your momentum rolling.",
  },
  {
    title: "Let’s keep the streak warm",
    description: "Pick a focus and we will guide you into a quick challenge.",
  },
]

const verbTree = {
  id: "verbs",
  title: "VERBS (Das Verb)",
  description: "The engine of every German sentence - master verbs and you master German!",
  intro: "The verb is the engine. It tells us: What happens (action), When it happens (tense), How it happens (active/passive/mood). Everything else is just additional information.",
  rootLabel: "VERBS",
  branches: [
    {
      id: "level1",
      title: "Level 1: Verb Basics",
      color: "bg-green-100 border-green-400",
      topics: [
        {
          id: "infinitive",
          title: "1.1 What is a Verb + Infinitive",
          content: {
            concept: "The infinitive is the base form of a verb - like 'to go', 'to make' in English. In German, infinitives end in -en or -n. This is the form you find in the dictionary.",
            keyPoints: [
              "Infinitive ends with -en or -n: machen, spielen, lernen, arbeiten",
              "This is the dictionary form",
              "Conjugation = changing the verb to match the subject",
              "Regular verbs follow predictable patterns",
            ],
            table: {
              headers: ["Infinitive", "English", "Stem"],
              rows: [
                ["machen", "to make/do", "mach-"],
                ["spielen", "to play", "spiel-"],
                ["lernen", "to learn", "lern-"],
                ["arbeiten", "to work", "arbeit-"],
                ["studieren", "to study", "studier-"],
              ],
            },
            examples: [
              { german: "Ich lerne Deutsch.", english: "I learn German. (verb = lerne)" },
              { german: "Was machst du?", english: "What are you doing? (verb = machst)" },
            ],
            tip: "Verbs ending in '-ieren' are ALWAYS regular: studieren → ich studiere / habe studiert",
          }
        },
        {
          id: "conjugation",
          title: "1.2 Conjugation in Present (Präsens)",
          content: {
            concept: "Conjugation means changing the verb ending to match who is doing the action. There are 3 patterns: Regular, Irregular (vowel change), and Mixed.",
            keyPoints: [
              "Regular: remove -en, add endings (e, st, t, en, t, en)",
              "Irregular: vowel changes in du/er forms (a→ä, e→i/ie)",
              "Mixed: both vowel change AND irregular past",
              "Verbs ending in -ieren are ALWAYS regular",
            ],
            table: {
              headers: ["Person", "Regular (machen)", "Irregular (fahren)", "Irregular (lesen)"],
              rows: [
                ["ich", "mache", "fahre", "lese"],
                ["du", "machst", "fährst (a→ä)", "liest (e→ie)"],
                ["er/sie/es", "macht", "fährt (a→ä)", "liest (e→ie)"],
                ["wir", "machen", "fahren", "lesen"],
                ["ihr", "macht", "fahrt", "lest"],
                ["sie/Sie", "machen", "fahren", "lesen"],
              ],
            },
            examples: [
              { german: "Ich mache meine Hausaufgaben.", english: "I do my homework." },
              { german: "Er fährt nach Berlin.", english: "He drives to Berlin." },
              { german: "Sie liest ein Buch.", english: "She reads a book." },
            ],
            tip: "Vowel changes only happen with du and er/sie/es - never with ich, wir, ihr, sie!",
          }
        },
      ]
    },
    {
      id: "level2",
      title: "Level 2: Verb Position",
      color: "bg-blue-100 border-blue-400",
      topics: [
        {
          id: "position-main",
          title: "2.1 Verb = Position 2 in Main Sentences",
          content: {
            concept: "The core rule of German: In a main sentence, the conjugated verb is ALWAYS in position 2. It doesn't matter what comes first - the verb stays in position 2.",
            keyPoints: [
              "Verb is ALWAYS in position 2 in main clauses",
              "Subject can come before or after the verb",
              "Time/place can start the sentence - verb still position 2",
              "This is called 'verb-second' (V2) word order",
            ],
            table: {
              headers: ["Position 1", "Position 2 (VERB)", "Rest"],
              rows: [
                ["Ich", "gehe", "heute ins Büro."],
                ["Heute", "gehe", "ich ins Büro."],
                ["Ins Büro", "gehe", "ich heute."],
                ["Morgen", "arbeite", "ich nicht."],
              ],
            },
            examples: [
              { german: "Ich gehe heute ins Kino.", english: "I'm going to the cinema today." },
              { german: "Heute gehe ich ins Kino.", english: "Today I'm going to the cinema." },
              { german: "Ins Kino gehe ich heute.", english: "To the cinema I'm going today." },
            ],
            tip: "Whatever comes first (time, place, object) - the verb is ALWAYS second!",
          }
        },
        {
          id: "position-sub",
          title: "2.2 Verb at END in Subordinate Clauses",
          content: {
            concept: "With subordinating conjunctions (or just remember it as few connectors if 'subordinating conjunctions' seems too technical) (weil, dass, wenn, obwohl...), the verb moves to the END of the clause. This creates 'verb clusters' with modal verbs and perfect tense.",
            keyPoints: [
              "Subordinating conjunctions (or some connectors) push verb to END. Click here to see the complete list",
              "Common: weil (because), dass (that), wenn (if/when), obwohl (although)",
              "Creates verb clusters: ...weil ich schwimmen kann",
              "Comma separates main and subordinate clause",
            ],
            table: {
              headers: ["Connector Type", "Connectors", "Verb Position"],
              rows: [
                ["Type 0 (Coordinating)", "und, oder, aber, denn", "Normal (position 2)"],
                ["Type 1 (Subordinating)", "weil, dass, wenn, obwohl", "END of clause"],
                ["Type 2 (Adverbs)", "deshalb, trotzdem, dann", "After connector"],
              ],
            },
            examples: [
              { german: "Ich bleibe zu Hause, weil ich krank bin.", english: "I'm staying home because I'm sick." },
              { german: "Er sagt, dass er morgen kommt.", english: "He says that he's coming tomorrow." },
              { german: "Weil ich müde bin, gehe ich schlafen.", english: "Because I'm tired, I'm going to sleep." },
            ],
            tip: "When subordinate clause comes FIRST, you get verb-verb: 'Weil ich müde BIN, GEHE ich...'",
          }
        },
      ]
    },
    {
      id: "level3",
      title: "Level 3: Special Verb Types",
      color: "bg-orange-100 border-orange-400",
      topics: [
        {
          id: "separable",
          title: "3.1 Separable Verbs (Trennbare Verben)",
          content: {
            concept: "Some verbs split! The prefix goes to the end in main clauses. In Perfekt, the 'ge-' goes between prefix and verb: aufgestanden.",
            keyPoints: [
              "Prefix goes to END in present/simple past",
              "Common prefixes: an, auf, aus, ein, mit, vor, zu",
              "Perfekt: prefix + ge + stem: aufgestanden",
              "In subordinate clauses: verb stays together at end",
            ],
            table: {
              headers: ["Infinitive", "Present", "Perfekt", "Meaning"],
              rows: [
                ["aufstehen", "Ich stehe auf.", "Ich bin aufgestanden.", "to get up"],
                ["anfangen", "Es fängt an.", "Es hat angefangen.", "to begin"],
                ["mitkommen", "Kommst du mit?", "Bist du mitgekommen?", "to come along"],
                ["einkaufen", "Ich kaufe ein.", "Ich habe eingekauft.", "to shop"],
              ],
            },
            examples: [
              { german: "Ich stehe um 7 Uhr auf.", english: "I get up at 7 o'clock." },
              { german: "Der Film fängt um 8 an.", english: "The movie starts at 8." },
              { german: "...weil ich früh aufstehe.", english: "...because I get up early. (stays together)" },
            ],
            tip: "In subordinate clauses, the verb STAYS TOGETHER: '...weil ich um 7 Uhr aufstehe.'",
          }
        },
        {
          id: "reflexive",
          title: "3.2 Reflexive Verbs (Reflexive Verben)",
          content: {
            concept: "Reflexive verbs need a reflexive pronoun (mich, dich, sich...). Many German verbs are reflexive that aren't in English!",
            keyPoints: [
              "sich freuen = to be happy (not 'to happy oneself')",
              "Accusative: mich, dich, sich, uns, euch, sich",
              "Dative: mir, dir, sich, uns, euch, sich",
              "Always learn: sich + verb + preposition (if any)",
            ],
            table: {
              headers: ["Person", "Accusative", "Dative", "Example"],
              rows: [
                ["ich", "mich", "mir", "Ich wasche mich."],
                ["du", "dich", "dir", "Du freust dich."],
                ["er/sie/es", "sich", "sich", "Er rasiert sich."],
                ["wir", "uns", "uns", "Wir treffen uns."],
                ["ihr", "euch", "euch", "Ihr beeilt euch."],
                ["sie/Sie", "sich", "sich", "Sie setzen sich."],
              ],
            },
            examples: [
              { german: "Ich freue mich auf das Wochenende.", english: "I'm looking forward to the weekend." },
              { german: "Er interessiert sich für Musik.", english: "He's interested in music." },
              { german: "Wir treffen uns um 8 Uhr.", english: "We're meeting at 8." },
            ],
            tip: "Learn as chunks: sich freuen auf + Akk, sich interessieren für + Akk, sich treffen mit + Dat",
          }
        },
        {
          id: "verbs-prepositions",
          title: "3.3 Verbs with Fixed Prepositions",
          content: {
            concept: "Many verbs always go with a specific preposition. You MUST learn them as a unit: warten auf (to wait for), denken an (to think of).",
            keyPoints: [
              "Learn as phrases: verb + preposition + case",
              "The preposition determines the case",
              "These are high-frequency - memorize as chunks!",
              "Question: wo+prep for things, prep+wem/wen for people",
            ],
            table: {
              headers: ["Verb + Prep", "Case", "Meaning", "Example"],
              rows: [
                ["warten auf", "Akk", "to wait for", "Ich warte auf den Bus."],
                ["denken an", "Akk", "to think of", "Ich denke an dich."],
                ["sich freuen auf", "Akk", "to look forward to", "Ich freue mich auf..."],
                ["Angst haben vor", "Dat", "to be afraid of", "Ich habe Angst vor..."],
                ["helfen bei", "Dat", "to help with", "Ich helfe dir bei..."],
                ["sprechen mit", "Dat", "to speak with", "Ich spreche mit ihm."],
              ],
            },
            examples: [
              { german: "Worauf wartest du? - Auf den Bus.", english: "What are you waiting for? - For the bus." },
              { german: "An wen denkst du? - An meine Mutter.", english: "Who are you thinking of? - My mother." },
            ],
            tip: "For THINGS: wo+prep (worauf?). For PEOPLE: prep+wen/wem (auf wen? mit wem?)",
          }
        },
      ]
    },
        {
      id: "level4",
      title: "Level 4: Tenses (Active Voice)",
      color: "bg-yellow-100 border-yellow-400",
      topics: [
        {
          id: "praesens",
          title: "4.1 Present (Präsens)",
          content: {
            concept: "Present tense is used for current actions, habits, general truths, AND often for near future. Germans frequently use present tense where English would use future!",
            keyPoints: [
              "Used for: now, habits, general truths, near future",
              "Formula: verb stem + ending",
              "Most common tense in conversation",
              "Often replaces future: 'Ich gehe morgen' = I'll go tomorrow",
            ],
            table: {
              headers: ["Usage", "German Example", "English"],
              rows: [
                ["Now", "Ich arbeite jetzt.", "I'm working now."],
                ["Habit", "Ich trinke Kaffee.", "I drink coffee."],
                ["Future", "Morgen fliege ich.", "I'm flying tomorrow."],
                ["Truth", "Die Erde ist rund.", "The Earth is round."],
              ],
            },
            examples: [
              { german: "Ich lese ein Buch.", english: "I read / am reading a book." },
              { german: "Er arbeitet jeden Tag.", english: "He works every day." },
              { german: "Nächste Woche fahre ich nach Berlin.", english: "Next week I'm going to Berlin." },
            ],
            tip: "Germans often skip Futur I and just use Präsens + time word: 'Morgen arbeite ich.'",
          }
        },
        {
          id: "perfekt",
          title: "4.2 Perfect (Perfekt) - Spoken Past",
          content: {
            concept: "Perfekt is THE spoken past tense in German! Use haben or sein + Partizip II. Movement/change verbs use sein, most others use haben.",
            keyPoints: [
              "Formula: haben/sein + Partizip II",
              "sein for: movement (gehen, fahren) & change of state (werden, sterben)",
              "haben for: most other verbs",
              "Partizip II: ge- + stem + -t (regular) or ge- + stem + -en (irregular)",
              "-ieren verbs: no ge-! studiert, telefoniert",
            ],
            table: {
              headers: ["Type", "Infinitive", "Partizip II", "Perfect"],
              rows: [
                ["haben + regular", "machen", "gemacht", "Ich habe gemacht."],
                ["haben + irregular", "schreiben", "geschrieben", "Ich habe geschrieben."],
                ["sein + movement", "gehen", "gegangen", "Ich bin gegangen."],
                ["sein + change", "werden", "geworden", "Ich bin geworden."],
                ["-ieren (no ge-)", "studieren", "studiert", "Ich habe studiert."],
              ],
            },
            examples: [
              { german: "Ich habe gestern gearbeitet.", english: "I worked yesterday." },
              { german: "Sie ist nach Hause gegangen.", english: "She went home." },
              { german: "Wir haben einen Film gesehen.", english: "We watched a movie." },
            ],
            tip: "sein verbs: 'be-go-stay-happen-die' - verbs of motion, change of state, or staying!",
          }
        },
        {
          id: "praeteritum",
          title: "4.3 Simple Past (Präteritum) - Written Past",
          content: {
            concept: "Präteritum is mainly for written German and for sein/haben/modal verbs in speech. In conversation, Germans prefer Perfekt except for these common verbs.",
            keyPoints: [
              "Mainly for: sein, haben, werden, modal verbs",
              "Used in written narrative, news, stories",
              "Conversational for: war, hatte, konnte, musste, wollte",
              "Regular verbs: stem + -te endings",
            ],
            table: {
              headers: ["Verb", "ich", "du", "er/sie", "wir/sie"],
              rows: [
                ["sein", "war", "warst", "war", "waren"],
                ["haben", "hatte", "hattest", "hatte", "hatten"],
                ["werden", "wurde", "wurdest", "wurde", "wurden"],
                ["können", "konnte", "konntest", "konnte", "konnten"],
                ["müssen", "musste", "musstest", "musste", "mussten"],
              ],
            },
            examples: [
              { german: "Ich war gestern müde.", english: "I was tired yesterday." },
              { german: "Er hatte keine Zeit.", english: "He had no time." },
              { german: "Sie konnte nicht kommen.", english: "She couldn't come." },
            ],
            tip: "In conversation, use Präteritum for: war, hatte, wurde, wollte, konnte, musste, sollte, durfte",
          }
        },
        {
          id: "plusquamperfekt",
          title: "4.4 Past Perfect (Plusquamperfekt)",
          content: {
            concept: "Plusquamperfekt = 'had done' - something happened BEFORE another past event. Use hatte/war + Partizip II.",
            keyPoints: [
              "Formula: hatte/war + Partizip II",
              "Meaning: 'had done' - earlier past",
              "Used to show sequence of past events",
              "Same sein/haben rules as Perfekt",
            ],
            table: {
              headers: ["Type", "Formula", "Example", "English"],
              rows: [
                ["haben verbs", "hatte + Partizip II", "Ich hatte gegessen.", "I had eaten."],
                ["sein verbs", "war + Partizip II", "Ich war gegangen.", "I had gone."],
              ],
            },
            examples: [
              { german: "Ich hatte gegessen, bevor ich ging.", english: "I had eaten before I left." },
              { german: "Er war schon gegangen, als ich ankam.", english: "He had already left when I arrived." },
              { german: "Nachdem sie gearbeitet hatte, ging sie.", english: "After she had worked, she left." },
            ],
            tip: "Perfekt = have done, Plusquamperfekt = had done (one step further in the past)",
          }
        },
        {
          id: "futur1",
          title: "4.5 Future I (Futur I)",
          content: {
            concept: "Future I uses werden + Infinitive. But remember: Germans often use Präsens for future instead! Futur I emphasizes certainty or makes predictions.",
            keyPoints: [
              "Formula: werden + Infinitiv (at end)",
              "Often replaced by Präsens + time word",
              "Used for: emphasis, predictions, assumptions",
              "werden conjugates: werde, wirst, wird, werden, werdet, werden",
            ],
            table: {
              headers: ["Person", "werden", "Example", "English"],
              rows: [
                ["ich", "werde", "Ich werde arbeiten.", "I will work."],
                ["du", "wirst", "Du wirst es schaffen.", "You will make it."],
                ["er/sie", "wird", "Er wird kommen.", "He will come."],
                ["wir", "werden", "Wir werden sehen.", "We will see."],
              ],
            },
            examples: [
              { german: "Ich werde morgen arbeiten.", english: "I will work tomorrow." },
              { german: "Es wird regnen.", english: "It will rain." },
              { german: "Er wird wohl krank sein.", english: "He's probably sick. (assumption)" },
            ],
            tip: "Reality check: 'Morgen arbeite ich' and 'Morgen werde ich arbeiten' mean the same thing!",
          }
        },
        {
          id: "futur2",
          title: "4.6 Future II (Futur II)",
          content: {
            concept: "Future II = 'will have done' - something will be completed by a certain time. Formula: werden + Partizip II + haben/sein.",
            keyPoints: [
              "Formula: werden + Partizip II + haben/sein",
              "Meaning: will have done by then",
              "Also used for assumptions about the past",
              "Rare in spoken German",
            ],
            table: {
              headers: ["Type", "Formula", "Example"],
              rows: [
                ["haben verbs", "werden + P.II + haben", "Ich werde gegessen haben."],
                ["sein verbs", "werden + P.II + sein", "Er wird angekommen sein."],
              ],
            },
            examples: [
              { german: "Bis 18 Uhr werde ich gegessen haben.", english: "By 6pm I will have eaten." },
              { german: "Er wird schon angekommen sein.", english: "He will have arrived by now." },
              { german: "Sie werden es vergessen haben.", english: "They will have forgotten it." },
            ],
            tip: "Futur II is often used to express assumptions: 'Er wird wohl gegangen sein' = He probably left",
          }
        },
      ]
    },
    {
      id: "level5",
      title: "Level 5: Passive Voice",
      color: "bg-purple-100 border-purple-400",
      topics: [
        {
          id: "passive-intro",
          title: "5.1 What is Passive Voice?",
          content: {
            concept: "Active = subject DOES the action. Passive = subject RECEIVES the action. German passive uses werden + Partizip II.",
            keyPoints: [
              "Active: Der Mechaniker repariert das Auto.",
              "Passive: Das Auto wird repariert.",
              "Core formula: werden + Partizip II",
              "The object becomes the subject",
            ],
            table: {
              headers: ["Voice", "Focus", "Example", "English"],
              rows: [
                ["Active", "Who does it", "Der Koch kocht das Essen.", "The cook cooks the food."],
                ["Passive", "What is done", "Das Essen wird gekocht.", "The food is being cooked."],
              ],
            },
            examples: [
              { german: "Active: Sie baut ein Haus.", english: "She builds a house." },
              { german: "Passive: Ein Haus wird gebaut.", english: "A house is being built." },
              { german: "Active: Man spricht Deutsch.", english: "One speaks German." },
              { german: "Passive: Deutsch wird gesprochen.", english: "German is spoken." },
            ],
            tip: "Passive is useful when: you don't know who did it, or it doesn't matter who did it!",
          }
        },
        {
          id: "passive-tenses",
          title: "5.2 Passive in All Tenses",
          content: {
            concept: "Passive can be formed in all tenses. The key is knowing how werden changes and what happens to the Partizip II.",
            keyPoints: [
              "Present: wird + Partizip II",
              "Präteritum: wurde + Partizip II",
              "Perfekt: ist + Partizip II + worden (NOT geworden!)",
              "Plusquamperfekt: war + Partizip II + worden",
              "Futur I: wird + Partizip II + werden",
            ],
            table: {
              headers: ["Tense", "Formula", "Example", "English"],
              rows: [
                ["Präsens", "wird + P.II", "Das Auto wird repariert.", "The car is being repaired."],
                ["Präteritum", "wurde + P.II", "Das Auto wurde repariert.", "The car was repaired."],
                ["Perfekt", "ist + P.II + worden", "Das Auto ist repariert worden.", "The car has been repaired."],
                ["Plusquamperf.", "war + P.II + worden", "Das Auto war repariert worden.", "The car had been repaired."],
                ["Futur I", "wird + P.II + werden", "Das Auto wird repariert werden.", "The car will be repaired."],
              ],
            },
            examples: [
              { german: "Die Tür wird geöffnet.", english: "The door is being opened." },
              { german: "Die Bücher wurden gelesen.", english: "The books were read." },
              { german: "Die Tür ist geöffnet worden.", english: "The door has been opened." },
            ],
            tip: "In Perfekt passive, use 'worden' NOT 'geworden'! 'geworden' = became, 'worden' = been (passive)",
          }
        },
        {
          id: "werden-overview",
          title: "5.3 WERDEN - The Multi-Purpose Verb",
          content: {
            concept: "Werden is incredibly versatile: it can mean 'to become' (full verb), form future (auxiliary), or create passive voice (auxiliary). Master werden, master German!",
            keyPoints: [
              "Vollverb (full verb): werden = to become",
              "Hilfsverb for Future: werden + Infinitiv",
              "Hilfsverb for Passive: werden + Partizip II",
              "Konjunktiv II: würde + Infinitiv (would)",
            ],
            table: {
              headers: ["Function", "Formula", "Example", "English"],
              rows: [
                ["Full verb", "werden alone", "Er wird müde.", "He becomes tired."],
                ["Future (Active)", "werden + Infinitiv", "Ich werde lernen.", "I will learn."],
                ["Passive (Present)", "werden + P.II", "Es wird gemacht.", "It is being done."],
                ["Konjunktiv II", "würde + Infinitiv", "Ich würde gehen.", "I would go."],
              ],
            },
            examples: [
              { german: "Er wird Arzt. (full verb)", english: "He's becoming a doctor." },
              { german: "Er wird arbeiten. (future)", english: "He will work." },
              { german: "Die Arbeit wird gemacht. (passive)", english: "The work is being done." },
              { german: "Ich würde gern helfen. (Konj. II)", english: "I would like to help." },
            ],
            tip: "werden + Infinitiv = Future. werden + Partizip II = Passive. Learn to spot the difference!",
          }
        },
        {
          id: "active-passive-compare",
          title: "5.4 Active vs Passive Comparison Tables",
          content: {
            concept: "Here are comprehensive tables comparing Active and Passive voice across all tenses, for both normal verbs and modal verbs.",
            keyPoints: [
              "Normal verbs: straightforward werden + Partizip II",
              "Modal verbs: modal (Infinitiv) + werden",
              "Active: focus on who does it",
              "Passive: focus on what is done",
            ],
            table: {
              headers: ["Tense", "Active (lesen)", "Passive (lesen)"],
              rows: [
                ["Präsens", "Ich lese ein Buch.", "Das Buch wird gelesen."],
                ["Präteritum", "Ich las ein Buch.", "Das Buch wurde gelesen."],
                ["Perfekt", "Ich habe ein Buch gelesen.", "Das Buch ist gelesen worden."],
                ["Plusquamperf.", "Ich hatte ein Buch gelesen.", "Das Buch war gelesen worden."],
                ["Futur I", "Ich werde ein Buch lesen.", "Das Buch wird gelesen werden."],
                ["Konj. II Präs.", "Ich würde ein Buch lesen.", "Das Buch würde gelesen werden."],
              ],
            },
            examples: [
              { german: "Das Buch muss gelesen werden.", english: "The book must be read. (modal passive)" },
              { german: "Das Buch musste gelesen werden.", english: "The book had to be read." },
              { german: "Das Buch hat gelesen werden müssen.", english: "The book has had to be read." },
            ],
            tip: "Modal + Passive formula: Modal + Partizip II + werden → Das muss gemacht werden.",
          }
        },
      ]
    },
    {
      id: "level6",
      title: "Level 6: Verb Moods",
      color: "bg-pink-100 border-pink-400",
      topics: [
        {
          id: "modal-verbs",
          title: "6.1 Modal Verbs - Present & Konjunktiv II",
          content: {
            concept: "Modal verbs express ability, permission, obligation, desire. They're used with another verb in infinitive at the END. Konjunktiv II forms (könnte, sollte) are like 'would/could/should'.",
            keyPoints: [
              "können = can, to be able to → könnte = could",
              "müssen = must, have to → müsste = would have to",
              "dürfen = may, allowed to → dürfte = might be allowed",
              "wollen = want to → wollte = would want",
              "sollen = should → sollte = should (softer)",
              "mögen = to like → möchte = would like",
            ],
            table: {
              headers: ["English", "German Present", "Konjunktiv II", "Example (Konj. II)"],
              rows: [
                ["I can do it", "Ich kann es machen", "Ich könnte es machen", "Ich könnte morgen kommen."],
                ["I may do it", "Ich darf es machen", "Ich dürfte es machen", "Ich dürfte länger bleiben."],
                ["I must do it", "Ich muss es machen", "Ich müsste es machen", "Ich müsste mehr lernen."],
                ["I shall do it", "Ich soll es machen", "Ich sollte es machen", "Ich sollte früher gehen."],
                ["I want to do it", "Ich will es machen", "Ich wollte es machen", "Ich wollte dir helfen."],
                ["I like to do it", "Ich mag es / ich mache es gern", "Ich möchte es machen", "Ich möchte einen Kaffee."],
              ],
            },
            examples: [
              { german: "Ich kann Deutsch sprechen.", english: "I can speak German." },
              { german: "Könnten Sie mir helfen?", english: "Could you help me? (polite)" },
              { german: "Ich möchte einen Kaffee.", english: "I would like a coffee." },
              { german: "Du solltest mehr schlafen.", english: "You should sleep more." },
            ],
            tip: "Konjunktiv II is SUPER useful for politeness: 'Könnten Sie...' is more polite than 'Können Sie...'",
          }
        },
        {
          id: "past-conditional",
          title: "6.2 Past Conditional (hätte/wäre + Partizip II)",
          content: {
            concept: "Past conditional = 'would have done' - expressing what would have happened (but didn't). Use hätte/wäre + Infinitiv + Modal (Infinitiv) OR hätte/wäre + Partizip II.",
            keyPoints: [
              "hätte + Partizip II = would have (haben verbs)",
              "wäre + Partizip II = would have (sein verbs)",
              "This is for counterfactual past situations",
              "Often used with 'wenn' (if) clauses",
            ],
            table: {
              headers: ["English", "German", "Example"],
              rows: [
                ["I could have done it", "Ich hätte es machen können", "Ich hätte das machen können."],
                ["I may have been allowed", "Ich hätte es machen dürfen", "Ich hätte länger bleiben dürfen."],
                ["I would have had to", "Ich hätte es machen müssen", "Ich hätte gestern arbeiten müssen."],
                ["I should have done it", "Ich hätte es machen sollen", "Ich hätte mehr lernen sollen."],
                ["I would have wanted", "Ich hätte es machen wollen", "Ich hätte helfen wollen."],
                ["I would have liked it", "Ich hätte es gemocht", "Ich hätte das gemocht."],
              ],
            },
            examples: [
              { german: "Ich hätte früher kommen sollen.", english: "I should have come earlier." },
              { german: "Wenn ich Zeit gehabt hätte, wäre ich gekommen.", english: "If I had had time, I would have come." },
              { german: "Das hättest du mir sagen können!", english: "You could have told me that!" },
            ],
            tip: "This chapter = missed/counterfactual past. 'Ich hätte... sollen' = I should have (but didn't)!",
          }
        },
        {
          id: "modal-perfect",
          title: "6.3 Modal + Perfect Infinitive (Assumptions)",
          content: {
            concept: "Modal (often Konjunktiv II) + Partizip II + haben/sein expresses assumptions about the past: 'may/might/must have done'.",
            keyPoints: [
              "Formula: Modal + Partizip II + haben/sein",
              "können/könnte: possibility (may/might have)",
              "müssen: deduction (must have)",
              "sollen: hearsay (is said to have)",
              "wollen: self-claim (claims to have)",
            ],
            table: {
              headers: ["Meaning", "German Pattern", "Example"],
              rows: [
                ["may/might have done", "kann/könnte + P.II + haben", "Er könnte das gesagt haben."],
                ["is likely to have done", "dürfte + P.II + haben", "Er dürfte schon angekommen sein."],
                ["must have done", "muss + P.II + haben", "Er muss den Fehler gemacht haben."],
                ["is said to have done", "soll + P.II + haben", "Er soll viel verdient haben."],
                ["claims to have done", "will + P.II + haben", "Er will das allein geschafft haben."],
              ],
            },
            examples: [
              { german: "Er könnte das gesagt haben.", english: "He may/might have said that." },
              { german: "Sie muss krank gewesen sein.", english: "She must have been sick." },
              { german: "Er soll sehr reich gewesen sein.", english: "He is said to have been very rich." },
            ],
            tip: "These are epistemic modals - expressing degrees of certainty about past events!",
          }
        },
        {
          id: "konjunktiv1",
          title: "6.4 Konjunktiv I (Indirect Speech)",
          content: {
            concept: "Konjunktiv I is used in formal/news German for indirect speech - reporting what someone said. Main forms to know: sei, habe, werde.",
            keyPoints: [
              "Used in news, reports, formal writing",
              "Reports what someone said/claims",
              "Key forms: sei (is), habe (has), werde (will)",
              "If Konj. I = Indikativ, use Konj. II instead",
            ],
            table: {
              headers: ["Direct", "Indirect (Konj. I)", "English"],
              rows: [
                ["'Ich bin krank.'", "Er sagt, er sei krank.", "He says he is sick."],
                ["'Ich habe Zeit.'", "Sie sagt, sie habe Zeit.", "She says she has time."],
                ["'Ich werde kommen.'", "Er sagt, er werde kommen.", "He says he will come."],
              ],
            },
            examples: [
              { german: "Der Minister sagte, er sei nicht informiert.", english: "The minister said he wasn't informed." },
              { german: "Sie behauptet, sie habe das nicht gewusst.", english: "She claims she didn't know that." },
            ],
            tip: "In everyday speech, Germans use Indikativ or Konjunktiv II. Konj. I is mainly for formal/written German.",
          }
        },
        {
          id: "konjunktiv2",
          title: "6.5 Konjunktiv II (Wishes & Hypotheticals)",
          content: {
            concept: "Konjunktiv II is for wishes, hypotheticals, and politeness. Use würde + Infinitiv (easy) or real Konj. II forms (wäre, hätte, könnte).",
            keyPoints: [
              "Politeness: Könnten Sie mir helfen?",
              "Wishes: Ich wünschte, ich wäre reich.",
              "Hypothetical: Wenn ich Zeit hätte, würde ich reisen.",
              "würde + Infinitiv = universal polite/hypothetical form",
            ],
            table: {
              headers: ["Usage", "Example", "English"],
              rows: [
                ["Politeness", "Könnten Sie mir helfen?", "Could you help me?"],
                ["Wish", "Ich hätte gern einen Kaffee.", "I would like a coffee."],
                ["Hypothetical", "Wenn ich reich wäre...", "If I were rich..."],
                ["würde form", "Ich würde das machen.", "I would do that."],
              ],
            },
            examples: [
              { german: "Wenn ich Zeit hätte, würde ich mehr lesen.", english: "If I had time, I would read more." },
              { german: "Ich wünschte, ich könnte fliegen.", english: "I wish I could fly." },
              { german: "Hätte ich das nur gewusst!", english: "If only I had known that!" },
            ],
            tip: "Learn these real Konj. II forms: wäre, hätte, könnte, müsste, dürfte, würde - they're everywhere!",
          }
        },
        {
          id: "imperativ",
          title: "6.6 Imperativ (Commands)",
          content: {
            concept: "Imperativ is for commands and requests. There's no tense - it's always 'NOW!' Three forms: du, ihr, Sie.",
            keyPoints: [
              "du-form: verb stem (+ e for some): Komm! Arbeite!",
              "ihr-form: like present: Kommt! Arbeitet!",
              "Sie-form: Infinitiv + Sie: Kommen Sie! Arbeiten Sie!",
              "Irregular verbs may have vowel change in du-form",
            ],
            table: {
              headers: ["Infinitive", "du", "ihr", "Sie"],
              rows: [
                ["kommen", "Komm!", "Kommt!", "Kommen Sie!"],
                ["machen", "Mach!", "Macht!", "Machen Sie!"],
                ["lesen", "Lies!", "Lest!", "Lesen Sie!"],
                ["fahren", "Fahr!", "Fahrt!", "Fahren Sie!"],
                ["sein", "Sei!", "Seid!", "Seien Sie!"],
              ],
            },
            examples: [
              { german: "Komm her!", english: "Come here! (informal)" },
              { german: "Bitte setzen Sie sich.", english: "Please sit down. (formal)" },
              { german: "Seid ruhig!", english: "Be quiet! (plural informal)" },
              { german: "Lies das Buch!", english: "Read the book! (e→ie)" },
            ],
            tip: "Add 'bitte' to make commands polite: 'Kommen Sie bitte!' 'Hilf mir bitte!'",
          }
        },
      ]
    },
  ],
}

const casesTree = {
  id: "cases",
  title: "CASES (Der Fall)",
  description: "See how cases show roles and change German words.",
  intro: "Cases are simply labels for sentence roles: who does what, who receives it, where it happens, and whose it is. Think of them as a roadmap for meaning.",
  rootLabel: "CASES",
  branches: [
    {
      id: "cases-level1",
      title: "Level 1: Case Foundations",
      color: "bg-amber-100 border-amber-400",
      topics: [
        {
          id: "nominativ",
          title: "1.1 Nominativ - The Subject",
          content: {
            concept: "Nominativ is the subject of a sentence: the person or thing doing the action. Do not be scared by the word. It simply means the doer, just like the English subject.",
            keyPoints: [
              "Nominativ = who or what is doing the action",
              "It matches the subject in English",
              "Question test: Wer? (who) or Was? (what)",
              "Articles and pronouns use nominative forms",
            ],
            table: {
              headers: ["Role", "Question", "Example"],
              rows: [
                ["Subject", "Wer? / Was?", "Der Mann liest."],
                ["Subject", "Wer?", "Ich lerne Deutsch."],
                ["Subject", "Was?", "Das Buch ist neu."],
              ],
            },
            examples: [
              { german: "Die Frau kocht.", english: "The woman cooks." },
              { german: "Mein Bruder arbeitet.", english: "My brother works." },
            ],
            tip: "If you can replace the noun with 'he/she/it' or 'I', you are usually in Nominativ.",
          },
        },
        {
          id: "akkusativ",
          title: "1.2 Akkusativ - The Direct Object",
          content: {
            concept: "Akkusativ is the direct object, similar to English. It answers who/what receives the action. Sometimes English calls it an indirect object, but the key test is the question: Wen? or Was?",
            keyPoints: [
              "Akkusativ = who/what the action happens to",
              "Question test: Wen? (who) or Was? (what)",
              "Many verbs need an Akkusativ object",
              "Prepositions like durch, für, gegen, ohne, um take Akkusativ",
            ],
            table: {
              headers: ["Question", "Answer", "Example"],
              rows: [
                ["Wen siehst du?", "Meinen Freund.", "Ich sehe meinen Freund."],
                ["Was kaufst du?", "Das Brot.", "Ich kaufe das Brot."],
                ["Wen ruft sie an?", "Ihre Mutter.", "Sie ruft ihre Mutter an."],
              ],
            },
            examples: [
              { german: "Ich lese ein Buch.", english: "I read a book." },
              { german: "Er liebt seine Familie.", english: "He loves his family." },
            ],
            tip: "If the object answers Wen or Was, it is Akkusativ.",
          },
        },
        {
          id: "dativ",
          title: "1.3 Dativ - The Indirect Object",
          content: {
            concept: "Dativ is similar to the English indirect object: to whom/for whom something happens. It also shows location without movement and time expressions.",
            keyPoints: [
              "Dativ = to whom/for whom",
              "Question test: Wem? (to whom)",
              "Location without movement and time are often Dativ",
              "Common verbs: helfen, danken, geben",
            ],
            table: {
              headers: ["Use", "Question", "Example"],
              rows: [
                ["Indirect object", "Wem?", "Ich gebe dem Kind ein Buch."],
                ["Location", "Wo?", "Ich bin in der Schule."],
                ["Time", "Wann?", "Am Montag arbeite ich."],
              ],
            },
            examples: [
              { german: "Ich helfe meinem Bruder.", english: "I help my brother." },
              { german: "Wir wohnen in der Stadt.", english: "We live in the city." },
            ],
            tip: "If you can ask Wo? or Wem?, you are likely in Dativ.",
          },
        },
        {
          id: "genitiv",
          title: "1.4 Genitiv - Possession",
          content: {
            concept: "Genitiv shows possession or relationship, like English 's or 'of'. In the beginning, just see it as ownership. It has rules, but the idea is simple.",
            keyPoints: [
              "Genitiv = possession/relationship",
              "English parallel: my father's book = das Buch meines Vaters",
              "Question test: Wessen? (whose)",
              "Some prepositions also require Genitiv",
            ],
            table: {
              headers: ["Question", "Answer", "Example"],
              rows: [
                ["Wessen Buch?", "Meines Vaters.", "Das ist das Buch meines Vaters."],
                ["Wessen Auto?", "Der Lehrerin.", "Das ist das Auto der Lehrerin."],
              ],
            },
            examples: [
              { german: "Die Farbe des Hauses ist blau.", english: "The color of the house is blue." },
              { german: "Das Ende der Woche kommt bald.", english: "The end of the week is soon." },
            ],
            tip: "Start by recognizing Genitiv as possession. You can learn the endings after the idea feels clear.",
          },
        },
      ],
    },
    {
      id: "cases-level2",
      title: "Level 2: Finding the Case",
      color: "bg-blue-100 border-blue-400",
      topics: [
        {
          id: "question-test",
          title: "2.1 The Question Test",
          content: {
            concept: "The easiest way to find the case is to ask a question about the noun: Wer/Was for Nominativ, Wen/Was for Akkusativ, Wem for Dativ, Wessen for Genitiv.",
            keyPoints: [
              "Wer/Was -> Nominativ",
              "Wen/Was -> Akkusativ",
              "Wem -> Dativ",
              "Wessen -> Genitiv",
            ],
            table: {
              headers: ["Case", "Question", "Example"],
              rows: [
                ["Nominativ", "Wer? / Was?", "Wer lernt? Ich lerne."],
                ["Akkusativ", "Wen? / Was?", "Was liest du? Ein Buch."],
                ["Dativ", "Wem?", "Wem gibst du das? Meiner Schwester."],
                ["Genitiv", "Wessen?", "Wessen Fahrrad? Meines Bruders."],
              ],
            },
            examples: [
              { german: "Wen siehst du? Ich sehe den Lehrer.", english: "Who do you see? I see the teacher." },
              { german: "Wem hilfst du? Ich helfe meinem Freund.", english: "Who are you helping? I help my friend." },
            ],
            tip: "If you are unsure, ask the question out loud and see which answer fits.",
          },
        },
        {
          id: "movement-location",
          title: "2.2 Movement vs Location",
          content: {
            concept: "With two-way prepositions, movement uses Akkusativ and location uses Dativ. Think: Where are you? (Dativ) Where to? (Akkusativ).",
            keyPoints: [
              "Wo? (where) -> Dativ",
              "Wohin? (where to) -> Akkusativ",
              "Two-way prepositions: in, an, auf, über, unter, vor, hinter, neben, zwischen",
              "Same preposition, different case based on movement",
            ],
            table: {
              headers: ["Question", "Case", "Example"],
              rows: [
                ["Wo?", "Dativ", "Ich bin im Park."],
                ["Wohin?", "Akkusativ", "Ich gehe in den Park."],
                ["Wo?", "Dativ", "Das Buch liegt auf dem Tisch."],
                ["Wohin?", "Akkusativ", "Ich lege das Buch auf den Tisch."],
              ],
            },
            examples: [
              { german: "Wir sitzen an dem Fenster.", english: "We sit by the window." },
              { german: "Wir setzen uns an das Fenster.", english: "We sit down by the window." },
            ],
            tip: "Movement = change of location. No movement = Dativ.",
          },
        },
        {
          id: "double-objects",
          title: "2.3 Two Objects in One Sentence",
          content: {
            concept: "Many German verbs take two objects: one Dativ (person) and one Akkusativ (thing). The person usually gets Dativ.",
            keyPoints: [
              "Dativ = person, Akkusativ = thing",
              "Ich gebe dem Mann (Dat) das Buch (Akk)",
              "If a pronoun is involved, word order can shift",
              "Question test still works for each object",
            ],
            table: {
              headers: ["Verb", "Dativ (person)", "Akkusativ (thing)"],
              rows: [
                ["geben", "Ich gebe dem Kind", "ein Geschenk."],
                ["zeigen", "Er zeigt seiner Freundin", "die Wohnung."],
                ["schicken", "Wir schicken unserem Lehrer", "eine Email."],
              ],
            },
            examples: [
              { german: "Ich erkläre meinem Bruder die Regel.", english: "I explain the rule to my brother." },
              { german: "Sie kauft ihrer Mutter Blumen.", english: "She buys flowers for her mother." },
            ],
            tip: "Ask two questions: Wem? for the person, Was? for the thing.",
          },
        },
      ],
    },
    {
      id: "cases-level3",
      title: "Level 3: How Words Change",
      color: "bg-green-100 border-green-400",
      topics: [
        {
          id: "pronouns-reflexive",
          title: "3.1 Personal and Reflexive Pronouns",
          content: {
            concept: "Cases change personal and reflexive pronouns. Some forms look irregular, but the idea is the same as English: subject vs object. Compare 'I' to 'me' or 'he' to 'him'.",
            keyPoints: [
              "ich -> mich (Akk) -> mir (Dat)",
              "du -> dich (Akk) -> dir (Dat)",
              "er -> ihn (Akk) -> ihm (Dat)",
              "Reflexive: mich/dich/sich/uns/euch/sich",
              "Genitiv pronouns exist but are less common in modern speech",
            ],
            table: {
              headers: ["Nominativ", "Akkusativ", "Dativ", "Genitiv"],
              rows: [
                ["ich", "mich", "mir", "meiner"],
                ["du", "dich", "dir", "deiner"],
                ["er", "ihn", "ihm", "seiner"],
                ["sie", "sie", "ihr", "ihrer"],
                ["es", "es", "ihm", "seiner"],
                ["wir", "uns", "uns", "unserer"],
                ["ihr", "euch", "euch", "eurer"],
                ["sie/Sie", "sie/Sie", "ihnen/Ihnen", "ihrer/Ihrer"],
              ],
            },
            examples: [
              { german: "Ich sehe ihn.", english: "I see him." },
              { german: "Er hilft mir.", english: "He helps me." },
              { german: "Wir gedenken ihrer.", english: "We remember them." },
            ],
            tip: "If it sounds like 'me/him/her' in English, it is probably Akkusativ or Dativ in German.",
          },
        },
        {
          id: "articles",
          title: "3.2 Definite and Indefinite Articles",
          content: {
            concept: "Articles change with case. The biggest change is the masculine Akkusativ (der -> den) and the Dativ/Genitiv endings.",
            keyPoints: [
              "Definite: der/die/das change per case",
              "Indefinite: ein/eine change per case",
              "Masculine Akkusativ: der -> den",
              "Dativ plural adds -n",
            ],
            table: {
              headers: ["Case", "Masculine", "Feminine", "Neuter", "Plural"],
              rows: [
                ["Nominativ", "der", "die", "das", "die"],
                ["Akkusativ", "den", "die", "das", "die"],
                ["Dativ", "dem", "der", "dem", "den"],
                ["Genitiv", "des", "der", "des", "der"],
              ],
            },
            examples: [
              { german: "Ich sehe den Mann.", english: "I see the man." },
              { german: "Ich helfe der Frau.", english: "I help the woman." },
            ],
            tip: "Focus on the masculine changes first: der -> den -> dem -> des.",
          },
        },
        {
          id: "prepositions",
          title: "3.3 Prepositions by Case",
          content: {
            concept: "Many prepositions force a specific case. Memorize them as chunks: mit + Dativ, für + Akkusativ, während + Genitiv.",
            keyPoints: [
              "Akkusativ: durch, für, gegen, ohne, um",
              "Dativ: aus, bei, mit, nach, seit, von, zu",
              "Genitiv: während, wegen, trotz",
              "Two-way: in, an, auf, über, unter, vor, hinter, neben, zwischen",
            ],
            table: {
              headers: ["Case", "Prepositions", "Example"],
              rows: [
                ["Akkusativ", "durch, für, gegen, ohne, um", "Ich gehe ohne den Hund."],
                ["Dativ", "aus, bei, mit, nach, seit, von, zu", "Ich fahre mit dem Bus."],
                ["Genitiv", "während, wegen, trotz", "Trotz des Regens gehe ich."],
                ["Two-way", "in, an, auf, über, unter, vor, hinter, neben, zwischen", "Ich bin im Zimmer."],
              ],
            },
            examples: [
              { german: "Wir warten auf den Zug.", english: "We are waiting for the train." },
              { german: "Er spricht mit seiner Schwester.", english: "He speaks with his sister." },
            ],
            tip: "Learn prepositions with their case, not separately.",
          },
        },
        {
          id: "adjective-declension",
          title: "3.4 Adjective Declension by Case",
          content: {
            concept: "Adjectives change their endings based on case and the article before them. Cases tell you which ending to use.",
            keyPoints: [
              "Adjective endings depend on case + article",
              "Nominativ and Akkusativ often look similar",
              "Dativ adds -en in many patterns",
              "Genitiv adds -en after most articles",
            ],
            table: [
              {
                title: "With Definite Articles (der, die, das, die)",
                headers: ["Case", "Masculine", "Feminine", "Neuter", "Plural"],
                rows: [
                  ["Nominativ", "der kleine Hund", "die kleine Katze", "das kleine Kind", "die kleinen Hunde"],
                  ["Akkusativ", "den kleinen Hund", "die kleine Katze", "das kleine Kind", "die kleinen Hunde"],
                  ["Dativ", "dem kleinen Hund", "der kleinen Katze", "dem kleinen Kind", "den kleinen Hunden"],
                  ["Genitiv", "des kleinen Hundes", "der kleinen Katze", "des kleinen Kindes", "der kleinen Hunde"],
                ],
              },
              {
                title: "With Indefinite Articles (ein, eine, ein)",
                headers: ["Case", "Masculine", "Feminine", "Neuter", "Plural (no form)"],
                rows: [
                  ["Nominativ", "ein kleiner Hund", "eine kleine Katze", "ein kleines Kind", "kleine Hunde"],
                  ["Akkusativ", "einen kleinen Hund", "eine kleine Katze", "ein kleines Kind", "kleine Hunde"],
                  ["Dativ", "einem kleinen Hund", "einer kleinen Katze", "einem kleinen Kind", "kleinen Hunden"],
                  ["Genitiv", "eines kleinen Hundes", "einer kleinen Katze", "eines kleinen Kindes", "kleiner Hunde"],
                ],
              },
              {
                title: "With No Article",
                headers: ["Case", "Masculine", "Feminine", "Neuter", "Plural"],
                rows: [
                  ["Nominativ", "kleiner Hund", "kleine Katze", "kleines Kind", "kleine Hunde"],
                  ["Akkusativ", "kleinen Hund", "kleine Katze", "kleines Kind", "kleine Hunde"],
                  ["Dativ", "kleinem Hund", "kleiner Katze", "kleinem Kind", "kleinen Hunden"],
                  ["Genitiv", "kleinen Hundes", "kleiner Katze", "kleinen Kindes", "kleiner Hunde"],
                ],
              },
            ],
            examples: [
              { german: "Ich sehe den kleinen Hund.", english: "I see the small dog." },
              { german: "Wir helfen einer netten Frau.", english: "We help a nice woman." },
            ],
            tip: "If you know the article ending, the adjective ending often mirrors it.",
          },
        },
      ],
    },
  ],
}

// Regular lessons (non-verb)
const regularLessons = [
  {
    id: 100,
    lessonId: "capitalization-punctuation",
    title: "Capitalization & Punctuation",
    description: "Learn how German capitalization and commas change meaning",
    level: "Beginner",
    duration: "8 min",
    content: {
      concept: "German spelling rules are very consistent. Nouns are always capitalized, sentence starts are capitalized, and commas signal clause boundaries that change word order.",
      keyPoints: [
        "All nouns are capitalized: der Hund, die Schule, das Buch",
        "Start of a sentence is capitalized: Heute lerne ich",
        "Formal you (Sie/Ihr) is always capitalized",
        "Ich/du/er are NOT capitalized unless at sentence start",
        "Commas separate clauses: because/that/if clauses use a comma",
      ],
      table: {
        headers: ["Rule", "German", "English"],
        rows: [
          ["Noun capitalization", "Ich sehe den Hund.", "I see the dog."],
          ["Sentence start", "Heute lerne ich.", "Today I study."],
          ["Formal you", "Wie heißen Sie?", "What is your name?"],
          ["Comma + subordinate", "Ich bleibe, weil ich muede bin.", "I stay because I am tired."],
        ],
      },
      examples: [
        { german: "Der Mann liest das Buch.", english: "The man reads the book." },
        { german: "Wenn es regnet, bleibe ich zu Hause.", english: "If it rains, I stay at home." },
      ],
      tip: "If you can put 'the' in front of it in English, it is probably a noun and should be capitalized in German.",
    },
  },
  {
    id: 101,
    lessonId: "personal-pronouns",
    title: "Personal Pronouns (Personalpronomen)",
    description: "Learn the subject pronouns - your first step to building sentences",
    level: "Beginner",
    duration: "10 min",
    content: {
      concept: `Personal pronouns in German work just like "I, you, he, she" in English - they replace nouns to avoid repetition. The key difference is that German has formal and informal ways to say "you".`,
      keyPoints: [
        "ich = I (always lowercase unless starting a sentence)",
        "du = you (informal, for friends/family/children)",
        "er/sie/es = he/she/it (same as English)",
        "wir = we, ihr = you all (informal plural)",
        "sie = they, Sie = you (formal, always capitalized)",
      ],
      table: {
        headers: ["German", "English", "Usage"],
        rows: [
          ["ich", "I", "Talking about yourself"],
          ["du", "you (singular)", "Informal - friends, family, kids"],
          ["er", "he", "Masculine person/noun"],
          ["sie", "she", "Feminine person/noun"],
          ["es", "it", "Neuter noun or impersonal"],
          ["wir", "we", "You + others"],
          ["ihr", "you (plural)", "Informal - group of friends"],
          ["sie", "they", "Multiple people/things"],
          ["Sie", "you (formal)", "Strangers, professional settings"],
        ],
      },
      examples: [
        { german: "Ich bin Student.", english: "I am a student." },
        { german: "Du bist mein Freund.", english: "You are my friend." },
        { german: "Sie sind sehr nett.", english: "You are very nice. (formal)" },
      ],
      tip: "Remember: 'Sie' (formal you) is always capitalized, while 'sie' (they/she) is lowercase!",
    },
  },
  {
    id: 102,
    lessonId: "possessive-articles",
    title: "Possessive Articles (Possessivartikel)",
    description: "Express ownership - my, your, his, her, etc.",
    level: "Beginner",
    duration: "12 min",
    content: {
      concept: `Possessive articles show ownership, like "my book" or "your car". The base forms map to each pronoun.`,
      keyPoints: [
        "mein = my (from ich)",
        "dein = your (informal, from du)",
        "sein = his/its (from er/es)",
        "ihr = her/their (from sie)",
        "unser = our (from wir)",
        "euer = your plural (from ihr)",
        "Ihr = your formal (from Sie)",
      ],
      table: {
        headers: ["Pronoun", "Possessive", "Example", "Translation"],
        rows: [
          ["ich", "mein", "mein Buch", "my book"],
          ["du", "dein", "dein Auto", "your car"],
          ["er/es", "sein", "sein Haus", "his/its house"],
          ["sie", "ihr", "ihr Hund", "her dog"],
          ["wir", "unser", "unser Lehrer", "our teacher"],
          ["ihr", "euer", "euer Zimmer", "your (pl.) room"],
          ["sie", "ihr", "ihr Kind", "their child"],
          ["Sie", "Ihr", "Ihr Name", "your (formal) name"],
        ],
      },
      examples: [
        { german: "Das ist mein Bruder.", english: "This is my brother." },
        { german: "Wo ist dein Handy?", english: "Where is your phone?" },
      ],
      tip: "Possessives take the same endings as 'ein/eine'!",
    },
  },
  {
    id: 103,
    lessonId: "articles-gender",
    title: "Articles & Gender",
    description: "Master der/die/das - the key to German nouns",
    level: "Beginner",
    duration: "15 min",
    content: {
      concept: `German has three genders: masculine (der), feminine (die), neuter (das). Always learn nouns WITH their article!`,
      keyPoints: [
        "der = masculine (der Mann)",
        "die = feminine (die Frau) - also ALL plurals!",
        "das = neuter (das Kind)",
        "Noun endings often hint at gender",
        "Always learn: article + noun as one unit",
      ],
      table: {
        headers: ["Gender", "Article", "Ending Hints", "Example"],
        rows: [
          ["Masculine", "der", "-er (people), -ling, -ismus", "der Lehrer"],
          ["Feminine", "die", "-ung, -keit, -heit, -ion, -schaft", "die Zeitung"],
          ["Neuter", "das", "-chen, -lein, -um, -ment", "das Mädchen"],
          ["Plural", "die", "(all plurals)", "die Bücher"],
        ],
      },
      examples: [
        { german: "Der Mann liest.", english: "The man reads." },
        { german: "Die Zeitung ist interessant.", english: "The newspaper is interesting." },
      ],
      tip: "-ung, -keit, -heit, -schaft = ALWAYS feminine (die)!",
    },
  },
  {
    id: 104,
    lessonId: "prepositions-by-case",
    title: "Prepositions & Intoduction to Cases",
    description: "Master prepositions - they determine which case to use!",
    level: "Intermediate",
    duration: "20 min",
    content: {
      concept: `Each preposition demands a specific CASE! Some always take Accusative, some always Dative, and some can take either.`,
      keyPoints: [
        "Accusative: durch, für, gegen, ohne, um (DOGFU)",
        "Dative: aus, bei, mit, nach, seit, von, zu",
        "Two-way: in, an, auf, über, unter, vor, hinter, neben, zwischen",
        "Two-way: motion → Akk, location → Dat",
      ],
      table: {
        headers: ["Case", "Prepositions", "Example"],
        rows: [
          ["Accusative", "für, ohne, durch, gegen, um", "Das ist für dich."],
          ["Dative", "mit, von, zu, bei, nach, aus, seit", "Ich fahre mit dem Bus."],
          ["Two-way (motion)", "in + Akk", "Ich gehe in die Schule."],
          ["Two-way (location)", "in + Dat", "Ich bin in der Schule."],
        ],
      },
      examples: [
        { german: "Ich warte auf dich. (Akk)", english: "I'm waiting for you." },
        { german: "Ich helfe dir bei der Arbeit. (Dat)", english: "I help you with work." },
      ],
      tip: "DOGFU = durch, ohne, gegen, für, um → Always Accusative!",
    },
  },
  {
    id: 105,
    lessonId: "question-words",
    title: "Question Words (W-Fragen)",
    description: "Ask questions - including wo+prep vs prep+wen/wem",
    level: "Beginner",
    duration: "15 min",
    content: {
      concept: `Question words mostly start with 'W'. For prepositional questions: THINGS use wo+prep, PEOPLE use prep+wen/wem.`,
      keyPoints: [
        "Was = What, Wer = Who, Wo = Where, Wann = When",
        "Warum = Why, Wie = How",
        "For THINGS: wo + prep (wofür, womit, worüber)",
        "For PEOPLE: prep + wen/wem (für wen, mit wem)",
      ],
      table: {
        headers: ["Question", "For Things", "For People"],
        rows: [
          ["about what/whom", "worüber", "über wen"],
          ["for what/whom", "wofür", "für wen"],
          ["with what/whom", "womit", "mit wem"],
          ["on what/whom", "worauf", "auf wen"],
        ],
      },
      examples: [
        { german: "Worüber sprichst du? (thing)", english: "What are you talking about?" },
        { german: "Über wen sprichst du? (person)", english: "Who are you talking about?" },
      ],
      tip: "If preposition starts with vowel, add 'r': wo + auf = worauf",
    },
  },
  {
    id: 106,
    lessonId: "connectors-verb-position",
    title: "Connectors & Word Order",
    description: "Join sentences - but watch the verb position!",
    level: "Intermediate",
    duration: "18 min",
    content: {
      concept: `Different connectors change where the verb goes! Type 0: verb stays, Type 1: verb to end, Type 2: verb after connector.`,
      keyPoints: [
        "Type 0: und, oder, aber, denn → verb position unchanged",
        "Type 1: weil, dass, wenn, obwohl → verb goes to END",
        "Type 2: deshalb, trotzdem, dann → verb comes FIRST after",
        "Subordinate clause first? Get verb-verb!",
      ],
      table: {
        headers: ["Type", "Connectors", "Verb Position"],
        rows: [
          ["0 (Coordinating)", "und, oder, aber, denn", "Normal (position 2)"],
          ["1 (Subordinating)", "weil, dass, wenn, obwohl", "End of clause"],
          ["2 (Adverbs)", "deshalb, trotzdem, dann", "After connector"],
        ],
      },
      examples: [
        { german: "Ich bleibe, weil ich müde bin.", english: "I'm staying because I'm tired." },
        { german: "Weil ich müde bin, bleibe ich.", english: "Because I'm tired, I'm staying." },
      ],
      tip: "Type 1 clause first → verb-verb pattern: 'Weil ich müde BIN, GEHE ich.'",
    },
  },
]

const shuffle = <T,>(items: T[]) => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }
  return copy
}

const buildLessonQuestions = (lesson: (typeof regularLessons)[number]): LessonQuestion[] => {
  const examples = lesson.content?.examples ?? []
  if (!examples.length) return []
  const fallbackChoices = regularLessons.flatMap((entry) => entry.content?.examples?.map((example) => example.english) ?? [])

  return examples.slice(0, 3).map((example) => {
    const choiceSet = new Set<string>([example.english])
    const shuffledFallback = shuffle(fallbackChoices)
    for (const option of shuffledFallback) {
      if (choiceSet.size >= 4) break
      choiceSet.add(option)
    }
    const choices = shuffle(Array.from(choiceSet))
    return {
      prompt: example.german,
      choices,
      answer: example.english,
    }
  })
}

const resolvePlacementLevelFromScore = (score: number, total: number): PlacementLevel => {
  const ratio = total === 0 ? 0 : score / total
  if (ratio >= 0.9) return "C1"
  if (ratio >= 0.75) return "B2"
  if (ratio >= 0.55) return "B1"
  if (ratio >= 0.35) return "A2"
  return "A1"
}

const resolveRecommendedLessonId = (level: PlacementLevel | null) => {
  if (!level) return null
  const beginnerLevels = new Set<PlacementLevel>(["A1", "A2"])
  const intermediateLevels = new Set<PlacementLevel>(["B1", "B2"])
  const targetLevel = beginnerLevels.has(level) ? "Beginner" : intermediateLevels.has(level) ? "Intermediate" : "Advanced"
  const match = regularLessons.find((lesson) => lesson.level === targetLevel)
  if (match) return match.id
  return regularLessons[0]?.id ?? null
}

export function LessonsTab({ onNavigate, onNavigateWithLesson }: LessonsTabProps) {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)
  const [activeTree, setActiveTree] = useState<"verbs" | "cases" | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState<{
    totalXp: number
    dailyXp: number
    dailyGoal: number
    streakCount: number
    streakBrokenDate: string | null
    streakBackup: number
    treats: number
  } | null>(null)
  const [progressMessage, setProgressMessage] = useState<string | null>(null)
  const [isSavingProgress, setIsSavingProgress] = useState(false)
  const [completionOpen, setCompletionOpen] = useState(false)
  const [completionData, setCompletionData] = useState<{
    xp: number
    title: string
    dailyXp: number
    dailyGoal: number
    streakCount: number
    treats: number
    streakBrokenDate: string | null
    streakBackup: number
  } | null>(null)
  const [placementOpen, setPlacementOpen] = useState(false)
  const [placementStep, setPlacementStep] = useState<"choose" | "manual" | "quiz" | "result">("choose")
  const [placementQuestionIndex, setPlacementQuestionIndex] = useState(0)
  const [placementCorrect, setPlacementCorrect] = useState(0)
  const [placementLevel, setPlacementLevel] = useState<PlacementLevel | null>(null)
  const [recommendedLessonId, setRecommendedLessonId] = useState<number | null>(null)
  const [placementPending, setPlacementPending] = useState(false)
  const [lessonStage, setLessonStage] = useState<"intro" | "quiz" | "result">("intro")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [questionStatus, setQuestionStatus] = useState<"idle" | "correct" | "wrong">("idle")
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [showReference, setShowReference] = useState(false)
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const { status: authStatus } = useSession()
  const authDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED === "true"
  const { play } = useSoundSettings()
  const casesTopicCount = casesTree.branches.reduce((acc, branch) => acc + branch.topics.length, 0)
  const timeZone = useMemo(
    () => (typeof window === "undefined" ? "UTC" : Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC"),
    []
  )
  const dateKey = useMemo(() => {
    if (typeof window === "undefined") return ""
    const now = new Date()
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now)
  }, [timeZone])
  const dailyWelcome = useMemo(() => {
    if (!dateKey) return welcomePrompts[0]
    const seed = dateKey.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return welcomePrompts[seed % welcomePrompts.length]
  }, [dateKey])
  const dailyLessonPicks = useMemo(() => {
    if (!dateKey) return regularLessons.slice(0, 2)
    const seed = dateKey.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const firstIndex = seed % regularLessons.length
    const secondIndex = (seed + 3) % regularLessons.length
    const picks = [regularLessons[firstIndex], regularLessons[secondIndex]].filter(Boolean)
    return picks
  }, [dateKey])

  const parseDurationMinutes = (duration?: string) => {
    if (!duration) return null
    const match = duration.match(/(\d+)/)
    return match ? Number(match[1]) : null
  }

  const calculateLessonXp = (duration?: string) => {
    const minutes = parseDurationMinutes(duration)
    if (!minutes) return 25
    return Math.max(10, Math.round(minutes * 5))
  }

  const loadProgress = useCallback(async () => {
    if (authStatus !== "authenticated" && !authDisabled) return
    try {
      const response = await fetch("/api/gamification/progress")
      if (!response.ok) return
      const data = await response.json()
      if (data?.progress) {
        setProgress({
          totalXp: data.progress.totalXp,
          dailyXp: data.progress.dailyXp,
          dailyGoal: data.progress.dailyGoal,
          streakCount: data.progress.streakCount,
          streakBrokenDate: data.progress.streakBrokenDate,
          streakBackup: data.progress.streakBackup,
          treats: data.progress.treats,
        })
        const nextPlacement = (data.progress.placementLevel as PlacementLevel | null | undefined) ?? null
        setPlacementLevel(nextPlacement)
        setRecommendedLessonId(resolveRecommendedLessonId(nextPlacement))
        if (!nextPlacement) {
          setPlacementOpen(true)
        }
      }
    } catch (error) {
      console.error("Failed to load progress", error)
    }
  }, [authStatus, authDisabled])

  const awardLessonXp = async (xp: number, lessonId?: string, title?: string) => {
    if (authStatus !== "authenticated" && !authDisabled) {
      setProgressMessage("Sign in to track XP and streaks.")
      return
    }
    setIsSavingProgress(true)
    try {
      const response = await fetch("/api/gamification/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xp,
          activityType: "LESSON_COMPLETE",
          lessonId,
          timezone: timeZone,
        }),
      })
      if (!response.ok) {
        setProgressMessage("Failed to save XP. Please try again.")
        return
      }
      const data = await response.json()
      if (data?.progress) {
        setProgress({
          totalXp: data.progress.totalXp,
          dailyXp: data.progress.dailyXp,
          dailyGoal: data.progress.dailyGoal,
          streakCount: data.progress.streakCount,
          streakBrokenDate: data.progress.streakBrokenDate,
          streakBackup: data.progress.streakBackup,
          treats: data.progress.treats,
        })
        const previousDailyXp = progress?.dailyXp ?? 0
        const justReachedGoal =
          previousDailyXp < data.progress.dailyGoal && data.progress.dailyXp >= data.progress.dailyGoal
        if (justReachedGoal) {
          play("streak")
        } else {
          play("complete")
        }
        setCompletionData({
          xp,
          title: title ?? "Lesson complete",
          dailyXp: data.progress.dailyXp,
          dailyGoal: data.progress.dailyGoal,
          streakCount: data.progress.streakCount,
          treats: data.progress.treats,
          streakBrokenDate: data.progress.streakBrokenDate,
          streakBackup: data.progress.streakBackup,
        })
        setCompletionOpen(true)
      }
      setProgressMessage(`+${xp} XP added.`)
    } catch (error) {
      console.error("Failed to award XP", error)
      setProgressMessage("Failed to save XP. Please try again.")
    } finally {
      setIsSavingProgress(false)
    }
  }

  const savePlacement = async (level: PlacementLevel, source: "self" | "quiz", score?: number) => {
    if (authStatus !== "authenticated" && !authDisabled) return
    setPlacementPending(true)
    try {
      const response = await fetch("/api/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placementLevel: level,
          placementSource: source,
          placementScore: Number.isFinite(score) ? score : null,
        }),
      })
      if (!response.ok) {
        return
      }
      setPlacementLevel(level)
      const nextRecommended = resolveRecommendedLessonId(level)
      setRecommendedLessonId(nextRecommended)
      setPlacementOpen(false)
      setPlacementStep("choose")
      setPlacementQuestionIndex(0)
      setPlacementCorrect(0)
      if (nextRecommended) {
        setSelectedLesson(nextRecommended)
      }
    } catch (error) {
      console.error("Failed to save placement", error)
    } finally {
      setPlacementPending(false)
    }
  }

  const startPlacementQuiz = () => {
    setPlacementStep("quiz")
    setPlacementQuestionIndex(0)
    setPlacementCorrect(0)
  }

  const handlePlacementAnswer = (choice: string) => {
    const question = placementQuestions[placementQuestionIndex]
    const isCorrect = question?.answer === choice
    const nextCorrect = placementCorrect + (isCorrect ? 1 : 0)
    if (placementQuestionIndex + 1 >= placementQuestions.length) {
      const resolved = resolvePlacementLevelFromScore(nextCorrect, placementQuestions.length)
      setPlacementCorrect(nextCorrect)
      setPlacementStep("result")
      setPlacementLevel(resolved)
      setRecommendedLessonId(resolveRecommendedLessonId(resolved))
      return
    }
    setPlacementCorrect(nextCorrect)
    setPlacementQuestionIndex((prev) => prev + 1)
  }

  const handleLessonAnswer = (choice: string) => {
    if (!activeQuestion || questionStatus !== "idle") return
    const isCorrect = choice === activeQuestion.answer
    setSelectedAnswer(choice)
    setQuestionStatus(isCorrect ? "correct" : "wrong")
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1)
      play("success")
    } else {
      play("sad")
    }
  }

  const handleNextQuestion = () => {
    if (questionIndex + 1 >= lessonQuestions.length) {
      setLessonStage("result")
      return
    }
    setQuestionIndex((prev) => prev + 1)
    setQuestionStatus("idle")
    setSelectedAnswer(null)
  }

  useEffect(() => {
    if (authStatus === "authenticated" || authDisabled) {
      loadProgress()
    }
  }, [authStatus, authDisabled, loadProgress])

  useEffect(() => {
    if (!dateKey) return
    if (placementOpen) return
    if (typeof window === "undefined") return
    const dismissedKey = `dm-welcome-dismissed-${dateKey}`
    const dismissed = window.localStorage.getItem(dismissedKey)
    if (!dismissed) {
      setWelcomeOpen(true)
    }
  }, [dateKey, placementOpen])

  useEffect(() => {
    if (selectedLesson === null) return
    setLessonStage("intro")
    setQuestionIndex(0)
    setQuestionStatus("idle")
    setSelectedAnswer(null)
    setCorrectCount(0)
    setShowReference(false)
  }, [selectedLesson])

  const renderProgressCard = () => {
    if (authStatus !== "authenticated" && !authDisabled) {
      return (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Sign in to track XP and streaks.</p>
          </CardContent>
        </Card>
      )
    }

    if (!progress) return null

    const progressPercent = Math.min(100, Math.round((progress.dailyXp / progress.dailyGoal) * 100))
    const mood: IgelMood = progress.streakBrokenDate
      ? "sad"
      : progress.dailyXp >= progress.dailyGoal
        ? "celebrate"
        : progressMessage?.startsWith("+")
          ? "happy"
          : "idle"
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Daily Goal</p>
                <p className="text-lg font-semibold">{progress.dailyXp} / {progress.dailyGoal} XP</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-lg font-semibold">{progress.streakCount} days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Treats</p>
                <p className="text-lg font-semibold">{progress.treats}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 flex items-center justify-center">
                <IgelMascot size={52} mood={mood} />
              </div>
            </div>
            {progress.streakBrokenDate && progress.streakBackup > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-amber-700">Streak broken. Earn 2x XP today or use 1 treat.</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={progress.treats < 1 || isSavingProgress}
                  onClick={restoreStreak}
                >
                  Use 1 treat
                </Button>
              </div>
            )}
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {progressMessage && (
            <p className="text-xs text-muted-foreground">{progressMessage}</p>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderPlacementDialog = () => {
    return (
      <Dialog
        open={placementOpen}
        onOpenChange={(open) => {
          if (!open && !placementLevel) return
          setPlacementOpen(open)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Find your German level</DialogTitle>
            <DialogDescription>
              We will personalize your roadmap so you start at the right level.
            </DialogDescription>
          </DialogHeader>

          {placementStep === "choose" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-dashed">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold">Quick check (2 min)</h4>
                  <p className="text-sm text-muted-foreground">
                    Answer 5 questions and get an instant recommendation.
                  </p>
                  <Button className="w-full" onClick={startPlacementQuiz}>
                    Start checkup
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-dashed">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-semibold">I know my level</h4>
                  <p className="text-sm text-muted-foreground">
                    Pick your CEFR level (A1-C1).
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => setPlacementStep("manual")}>
                    Choose level
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {placementStep === "manual" && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {placementLevels.map((level) => (
                  <Card key={level.level} className="hover:border-primary transition-colors">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{level.label}</h4>
                        <span className="text-xs text-muted-foreground">{level.level}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                      <Button
                        className="w-full"
                        onClick={() => savePlacement(level.level, "self")}
                        disabled={placementPending}
                      >
                        Start at {level.level}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button variant="ghost" onClick={() => setPlacementStep("choose")}>Back</Button>
            </div>
          )}

          {placementStep === "quiz" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Question {placementQuestionIndex + 1} / {placementQuestions.length}</span>
                <span>{placementCorrect} correct</span>
              </div>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h4 className="font-semibold">{placementQuestions[placementQuestionIndex]?.prompt}</h4>
                  <div className="grid gap-2">
                    {placementQuestions[placementQuestionIndex]?.choices.map((choice) => (
                      <Button
                        key={choice}
                        variant="outline"
                        className="justify-start"
                        onClick={() => handlePlacementAnswer(choice)}
                      >
                        {choice}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Button variant="ghost" onClick={() => setPlacementStep("choose")}>Cancel</Button>
            </div>
          )}

          {placementStep === "result" && placementLevel && (
            <div className="space-y-4">
              <Card className="bg-primary/5 border-primary/30">
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Recommended level</p>
                  <h3 className="text-2xl font-bold">{placementLevel}</h3>
                  <p className="text-sm text-muted-foreground">
                    We will start you with a lesson that matches this level.
                  </p>
                </CardContent>
              </Card>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => savePlacement(placementLevel, "quiz", placementCorrect)}
                  disabled={placementPending}
                >
                  Start my roadmap
                </Button>
                <Button variant="outline" onClick={() => setPlacementStep("manual")}>
                  Choose a different level
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  const handleCloseWelcome = () => {
    if (!dateKey || typeof window === "undefined") {
      setWelcomeOpen(false)
      return
    }
    window.localStorage.setItem(`dm-welcome-dismissed-${dateKey}`, "true")
    setWelcomeOpen(false)
  }

  const renderWelcomeDialog = () => {
    return (
      <Dialog open={welcomeOpen} onOpenChange={setWelcomeOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{dailyWelcome.title}</DialogTitle>
            <DialogDescription>{dailyWelcome.description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 md:grid-cols-[200px_1fr] items-start">
            <div className="flex justify-center md:justify-start">
              <div className="h-44 w-44 flex items-center justify-center">
                <IgelMascot size={150} mood="happy" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {dailyLessonPicks.map((lesson) => (
                  <Card key={lesson.id} className="border-dashed bg-white/70">
                    <CardContent className="p-4 space-y-3 flex flex-col h-full">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          lesson.level === "Beginner" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        )}>
                          {lesson.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.duration}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
                      </div>
                      <div className="flex-1" />
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedLesson(lesson.id)
                          handleCloseWelcome()
                        }}
                      >
                        Start now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { onNavigate("train"); handleCloseWelcome() }}>
                  Quick practice
                </Button>
                <Button variant="outline" size="sm" onClick={() => { onNavigate("vocab"); handleCloseWelcome() }}>
                  Vocabulary sprint
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseWelcome}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const restoreStreak = async () => {
    if (authStatus !== "authenticated" && !authDisabled) return
    setIsSavingProgress(true)
    try {
      const response = await fetch("/api/gamification/restore", { method: "POST" })
      if (!response.ok) {
        setProgressMessage("Unable to restore streak.")
        return
      }
      const data = await response.json()
      if (data?.progress) {
        setProgress({
          totalXp: data.progress.totalXp,
          dailyXp: data.progress.dailyXp,
          dailyGoal: data.progress.dailyGoal,
          streakCount: data.progress.streakCount,
          streakBrokenDate: data.progress.streakBrokenDate,
          streakBackup: data.progress.streakBackup,
          treats: data.progress.treats,
        })
      }
      play("success")
      setProgressMessage("Streak restored.")
    } catch (error) {
      console.error("Failed to restore streak", error)
      setProgressMessage("Unable to restore streak.")
    } finally {
      setIsSavingProgress(false)
    }
  }

  const openTree = (tree: "verbs" | "cases") => {
    setActiveTree(tree)
    setSelectedBranch(null)
    setSelectedTopic(null)
    setExpandedBranches(new Set())
  }

  const closeTree = () => {
    setActiveTree(null)
    setSelectedBranch(null)
    setSelectedTopic(null)
    setExpandedBranches(new Set())
  }

  const handleConnectorLink = () => {
    onNavigate("core")
    if (typeof window !== "undefined") {
      window.location.hash = "core-topic-11"
    }
  }

  const toggleBranch = (branchId: string) => {
    const newExpanded = new Set(expandedBranches)
    if (newExpanded.has(branchId)) {
      newExpanded.delete(branchId)
    } else {
      newExpanded.add(branchId)
    }
    setExpandedBranches(newExpanded)
  }

  const activeTreeData = activeTree === "cases" ? casesTree : verbTree
  const currentBranch = activeTree
    ? activeTreeData.branches.find(b => b.id === selectedBranch)
    : undefined
  const currentTopic = currentBranch?.topics.find(t => t.id === selectedTopic)
  const selectedLessonData = selectedLesson !== null ? regularLessons.find((lesson) => lesson.id === selectedLesson) : null
  const lessonQuestions = useMemo(
    () => (selectedLessonData ? buildLessonQuestions(selectedLessonData) : []),
    [selectedLessonData]
  )
  const activeQuestion = lessonQuestions[questionIndex]
  const roadmapItems = useMemo(() => {
    return [
      ...regularLessons.map((lesson) => ({ type: "lesson" as const, lesson })),
      {
        type: "tree" as const,
        treeId: "verbs" as const,
        title: "Verbs Tree",
        description: "Master all verb concepts: tenses, moods, passive voice, and more.",
        tag: "Intermediate",
        accent: "bg-primary/10 text-primary",
      },
      {
        type: "tree" as const,
        treeId: "cases" as const,
        title: "Cases Tree",
        description: "Nominativ, Akkusativ, Dativ, Genitiv and how they change words.",
        tag: "Intermediate",
        accent: "bg-amber-100 text-amber-700",
      },
    ]
  }, [])

  // Render verb lesson content
  const resolveLessonIdForLinks = () => {
    if (selectedLesson !== null) {
      const lesson = regularLessons.find((l) => l.id === selectedLesson)
      return lesson?.lessonId
    }

    if (activeTree === "cases") {
      return "cases-basics"
    }

    if (!currentTopic) {
      return "verb-tenses"
    }

    const topicMap: Record<string, string> = {
      separable: "separable-verbs",
      reflexive: "reflexive-verbs",
      "verbs-prepositions": "verbs-with-prep",
      "passive-intro": "passive-voice",
      "passive-tenses": "passive-voice",
      "active-passive-compare": "passive-voice",
      "werden-overview": "werden-forms",
      "modal-verbs": "modal-verbs",
      "modal-perfect": "konjunktiv-2",
      konjunktiv2: "konjunktiv-2",
      konjunktiv1: "konjunktiv-2",
    }

    return topicMap[currentTopic.id] ?? "verb-tenses"
  }

  const renderVerbContent = (content: LessonContent, lessonId?: string) => {
    const tables = (Array.isArray(content.table)
      ? content.table
      : [content.table]) as Array<{
      title?: string
      headers: string[]
      rows: string[][]
    }>

    const effectiveLessonId = lessonId ?? resolveLessonIdForLinks()
    const handleNavigateWithLesson = (tab: TabType) => {
      if (onNavigateWithLesson) {
        onNavigateWithLesson(tab, effectiveLessonId)
        return
      }
      onNavigate(tab)
    }

    return (
      <div className="space-y-6">
      {/* Concept */}
      <div className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary">
        <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Core Concept
        </h4>
        <p className="text-foreground/80">{content.concept}</p>
      </div>

      {/* Key Points */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          Key Points
        </h4>
        <ul className="space-y-2">
          {content.keyPoints.map((point, i) => {
            const hasCoreLink = typeof point === "string" && point.includes("Click here")
            const linkParts = hasCoreLink ? point.split("Click here") : [point, ""]

            return (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span className="text-sm">
                  {hasCoreLink ? (
                    <>
                      {linkParts[0]}
                      <button
                        type="button"
                        onClick={handleConnectorLink}
                        className="text-primary underline underline-offset-2 hover:text-primary/80"
                      >
                        Click here
                      </button>
                      {linkParts[1]}
                    </>
                  ) : (
                    point
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Table */}
      <div>
        <h4 className="font-semibold mb-3">
          {tables.length > 1 ? "Reference Tables" : "Reference Table"}
        </h4>
        <div className="space-y-6">
          {tables.map((table, tableIndex) => (
            <div key={tableIndex}>
              {table.title && (
                <h5 className="font-semibold text-sm text-muted-foreground mb-2">
                  {table.title}
                </h5>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      {table.headers.map((header, i) => (
                        <th
                          key={i}
                          className="border border-border px-3 py-2 text-left font-semibold"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        {row.map((cell, j) => (
                          <td key={j} className="border border-border px-3 py-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Examples */}
      <div>
        <h4 className="font-semibold mb-3">Examples</h4>
        <div className="space-y-2">
          {content.examples.map((ex, i) => (
            <div key={i} className="bg-muted/50 rounded-lg p-3">
              <p className="font-medium text-primary">{ex.german}</p>
              <p className="text-sm text-muted-foreground">{ex.english}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-1 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Pro Tip
        </h4>
        <p className="text-yellow-900 text-sm">{content.tip}</p>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-wrap gap-2 pt-4 border-t">
        <Button variant="outline" size="sm" onClick={() => handleNavigateWithLesson("vocab")} className="gap-2">
          <BookText className="h-4 w-4" />
          Study Vocabulary
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleNavigateWithLesson("cards")} className="gap-2">
          <Layers className="h-4 w-4" />
          Practice Flashcards
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("core")} className="gap-2">
          <Target className="h-4 w-4" />
          Full Grammar Reference
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("cheat")} className="gap-2">
          <Zap className="h-4 w-4" />
          Quick Cheat Sheet
        </Button>
      </div>
      </div>
    )
  }

  // Verb Tree View
  if (activeTree) {
    return (
      <div className="space-y-6">
        {renderPlacementDialog()}
        <Dialog open={completionOpen} onOpenChange={setCompletionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{completionData?.title ?? "Lesson complete"}</DialogTitle>
              <DialogDescription>
                {completionData
                  ? `You earned ${completionData.xp} XP.`
                  : "Nice work!"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              <div className="h-36 w-36 flex items-center justify-center">
                <IgelMascot size={120} mood="celebrate" />
              </div>
              {completionData && (
                <div className="grid w-full gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Daily goal</span>
                    <span className="font-semibold">
                      {completionData.dailyXp} / {completionData.dailyGoal} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Streak</span>
                    <span className="font-semibold">{completionData.streakCount} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Treats</span>
                    <span className="font-semibold">{completionData.treats}</span>
                  </div>
                  {completionData.streakBrokenDate && completionData.streakBackup > 0 && (
                    <p className="text-xs text-amber-700">
                      Streak broken. Earn 2x XP today or use 1 treat.
                    </p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setCompletionOpen(false)}>Keep going</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {renderProgressCard()}
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => {
            if (selectedTopic) {
              setSelectedTopic(null)
            } else if (selectedBranch) {
              setSelectedBranch(null)
            } else {
              closeTree()
            }
          }}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-primary">{activeTreeData.title}</h2>
            <p className="text-muted-foreground">{activeTreeData.description}</p>
          </div>
        </div>

        {/* Topic Content View */}
        {selectedTopic && currentTopic ? (
          <Card>
            <CardHeader>
              <CardTitle>{currentTopic.title}</CardTitle>
              <CardDescription>
                {currentBranch?.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderVerbContent(currentTopic.content, resolveLessonIdForLinks())}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Complete this topic to earn XP.
                </p>
                <Button
                  onClick={() => awardLessonXp(calculateLessonXp(), resolveLessonIdForLinks(), currentTopic.title)}
                  disabled={isSavingProgress}
                >
                  Complete Topic (+{calculateLessonXp()} XP)
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : selectedBranch && currentBranch ? (
          /* Branch Topics View */
          <div className="space-y-4">
            <Card className={cn("border-2", currentBranch.color)}>
              <CardHeader>
                <CardTitle>{currentBranch.title}</CardTitle>
              </CardHeader>
            </Card>
            
            <div className="grid gap-3">
              {currentBranch.topics.map((topic) => (
                <Card
                  key={topic.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedTopic(topic.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{topic.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {topic.content.concept.slice(0, 80)}...
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Full Tree View */
          <div className="space-y-6">
            {/* Intro */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
              <CardContent className="p-6">
                <p className="text-lg font-medium text-center">{activeTreeData.intro}</p>
                <p className="text-center text-muted-foreground mt-2">
                  Click on any branch below to explore the topic tree.
                </p>
              </CardContent>
            </Card>

            {/* Tree Visualization */}
            <div className="flex justify-center">
              <div className="inline-block">
                {/* Root */}
                <div className="flex justify-center mb-4">
                  <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                    {activeTreeData.rootLabel}
                  </div>
                </div>
                
                {/* Connector line */}
                <div className="flex justify-center mb-4">
                  <div className="w-0.5 h-8 bg-primary/50"></div>
                </div>

                {/* Branches */}
                <div className="space-y-3">
                  {activeTreeData.branches.map((branch, index) => (
                    <div key={branch.id}>
                      <Card
                        className={cn(
                          "cursor-pointer transition-all border-2 hover:shadow-md",
                          branch.color,
                          expandedBranches.has(branch.id) && "ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedBranch(branch.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <GitBranch className="h-5 w-5" />
                              <div>
                                <h3 className="font-semibold">{branch.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {branch.topics.length} topics
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleBranch(branch.id)
                                }}
                              >
                                {expandedBranches.has(branch.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Expanded topics preview */}
                          {expandedBranches.has(branch.id) && (
                            <div className="mt-4 pl-8 border-l-2 border-primary/30 space-y-2">
                              {branch.topics.map((topic) => (
                                <div
                                  key={topic.id}
                                  className="text-sm p-2 bg-background/50 rounded hover:bg-background cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedBranch(branch.id)
                                    setSelectedTopic(topic.id)
                                  }}
                                >
                                  {topic.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      {/* Connector between branches */}
                      {index < activeTreeData.branches.length - 1 && (
                        <div className="flex justify-center my-2">
                          <div className="w-0.5 h-4 bg-muted-foreground/30"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Regular lesson detail view
  if (selectedLesson !== null) {
    const lesson = selectedLessonData
    if (!lesson) return null
    const lessonXp = calculateLessonXp(lesson.duration)

    return (
      <div className="space-y-6">
        <Dialog open={completionOpen} onOpenChange={setCompletionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{completionData?.title ?? "Lesson complete"}</DialogTitle>
              <DialogDescription>
                {completionData
                  ? `You earned ${completionData.xp} XP.`
                  : "Nice work!"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              <div className="h-36 w-36 flex items-center justify-center">
                <IgelMascot size={120} mood="celebrate" />
              </div>
              {completionData && (
                <div className="grid w-full gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Daily goal</span>
                    <span className="font-semibold">
                      {completionData.dailyXp} / {completionData.dailyGoal} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Streak</span>
                    <span className="font-semibold">{completionData.streakCount} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Treats</span>
                    <span className="font-semibold">{completionData.treats}</span>
                  </div>
                  {completionData.streakBrokenDate && completionData.streakBackup > 0 && (
                    <p className="text-xs text-amber-700">
                      Streak broken. Earn 2x XP today or use 1 treat.
                    </p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setCompletionOpen(false)}>Keep going</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {renderProgressCard()}
        <Button variant="ghost" onClick={() => setSelectedLesson(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Lessons
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  lesson.level === "Beginner" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                )}
              >
                {lesson.level}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lesson.duration}
              </span>
            </div>
            <CardTitle className="text-2xl">{lesson.title}</CardTitle>
            <CardDescription>{lesson.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {lessonStage === "intro" && (
                <div className="space-y-4">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold">Mission</h3>
                      <p className="text-sm text-muted-foreground">{lesson.content.concept}</p>
                      <div className="grid gap-2">
                        {lesson.content.keyPoints.slice(0, 3).map((point) => (
                          <div key={point} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button onClick={() => setLessonStage("quiz")} disabled={lessonQuestions.length === 0}>
                      Start challenge
                    </Button>
                    <Button variant="outline" onClick={() => setShowReference((prev) => !prev)}>
                      {showReference ? "Hide reference" : "Show reference"}
                    </Button>
                  </div>
                  {lessonQuestions.length === 0 && (
                    <p className="text-xs text-muted-foreground">Interactive challenge coming soon.</p>
                  )}
                </div>
              )}

              {lessonStage === "quiz" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Question {questionIndex + 1} / {lessonQuestions.length}</span>
                    <span>{correctCount} correct</span>
                  </div>
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <h3 className="font-semibold">Translate:</h3>
                      <p className="text-lg font-medium">{activeQuestion?.prompt}</p>
                      <div className="grid gap-2">
                        {activeQuestion?.choices.map((choice) => {
                          const isCorrect = questionStatus !== "idle" && choice === activeQuestion.answer
                          const isWrongSelection = questionStatus === "wrong" && selectedAnswer === choice
                          return (
                            <Button
                              key={choice}
                              variant="outline"
                              className={cn(
                                "justify-start",
                                isCorrect && "border-emerald-500 text-emerald-600",
                                isWrongSelection && "border-rose-500 text-rose-600"
                              )}
                              onClick={() => handleLessonAnswer(choice)}
                              disabled={questionStatus !== "idle"}
                            >
                              {choice}
                            </Button>
                          )
                        })}
                      </div>
                      {questionStatus !== "idle" && (
                        <div
                          className={cn(
                            "text-sm",
                            questionStatus === "correct" ? "text-emerald-600" : "text-rose-600"
                          )}
                        >
                          {questionStatus === "correct"
                            ? "Nice work!"
                            : `Correct: ${activeQuestion?.answer}`}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleNextQuestion} disabled={questionStatus === "idle"}>
                      {questionIndex + 1 >= lessonQuestions.length ? "Finish" : "Next"}
                    </Button>
                    <Button variant="outline" onClick={() => setLessonStage("intro")}>Review mission</Button>
                  </div>
                </div>
              )}

              {lessonStage === "result" && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Lesson complete</h3>
                        <p className="text-sm text-muted-foreground">
                          Score {correctCount} / {lessonQuestions.length}
                        </p>
                      </div>
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => awardLessonXp(lessonXp, lesson.lessonId, lesson.title)}
                        disabled={isSavingProgress}
                      >
                        Claim {lessonXp} XP
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setLessonStage("intro")
                          setQuestionIndex(0)
                          setQuestionStatus("idle")
                          setSelectedAnswer(null)
                          setCorrectCount(0)
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {showReference && (
                <div className="space-y-3">
                  {renderVerbContent(
                    lesson.content as typeof verbTree.branches[0]["topics"][0]["content"],
                    lesson.lessonId
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main lessons list
  return (
    <div className="space-y-6">
      {renderWelcomeDialog()}
      {renderPlacementDialog()}
      <Dialog open={completionOpen} onOpenChange={setCompletionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{completionData?.title ?? "Lesson complete"}</DialogTitle>
            <DialogDescription>
              {completionData
                ? `You earned ${completionData.xp} XP.`
                : "Nice work!"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="h-36 w-36 flex items-center justify-center">
              <IgelMascot size={120} mood="celebrate" />
            </div>
            {completionData && (
              <div className="grid w-full gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Daily goal</span>
                  <span className="font-semibold">
                    {completionData.dailyXp} / {completionData.dailyGoal} XP
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Streak</span>
                  <span className="font-semibold">{completionData.streakCount} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Treats</span>
                  <span className="font-semibold">{completionData.treats}</span>
                </div>
                {completionData.streakBrokenDate && completionData.streakBackup > 0 && (
                  <p className="text-xs text-amber-700">
                    Streak broken. Earn 2x XP today or use 1 treat.
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setCompletionOpen(false)}>Keep going</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {renderProgressCard()}
      <div>
        <h2 className="text-2xl font-bold">German Lessons</h2>
        <p className="text-muted-foreground">
          Master German step by step with structured lessons
        </p>
      </div>

      {/* Roadmap */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Your Roadmap</h3>
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-muted-foreground/30" />
          <div className="space-y-10">
          {roadmapItems.map((item, index) => {
            const isLeft = index % 2 === 0
            if (item.type === "lesson") {
              const lesson = item.lesson
              const isRecommended = lesson.id === recommendedLessonId
              const lessonXp = calculateLessonXp(lesson.duration)
            return (
              <div key={`lesson-${lesson.id}`} className="relative grid gap-6 md:grid-cols-2">
                <div
                  className={cn(
                    "absolute left-4 md:left-1/2 top-6 h-7 w-7 -translate-y-1/2 rounded-full border-2 flex items-center justify-center z-10",
                    isRecommended
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-muted-foreground/40"
                  )}
                >
                  {isRecommended ? <Star className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />}
                </div>
                <div className={cn(isLeft ? "md:pr-10" : "md:col-start-2 md:pl-10")}
                >
                  <Card
                    className={cn(
                      "transition-all bg-gradient-to-br from-background to-muted/30",
                      isRecommended && "border-primary/60 shadow"
                    )}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            lesson.level === "Beginner" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          )}
                        >
                          {lesson.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {lessonXp} XP
                        </span>
                        {isRecommended && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {lesson.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => setSelectedLesson(lesson.id)}>
                          Start lesson
                        </Button>
                        <span className="text-xs text-muted-foreground">Next stop</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )
            }

            return (
              <div key={`tree-${item.treeId}`} className="relative grid gap-6 md:grid-cols-2">
                <div
                  className={cn(
                    "absolute left-4 md:left-1/2 top-6 h-7 w-7 -translate-y-1/2 rounded-full border-2 flex items-center justify-center z-10",
                    "bg-background border-muted-foreground/40"
                  )}
                >
                  <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className={cn(isLeft ? "md:pr-10" : "md:col-start-2 md:pl-10")}>
                  <Card className="transition-all bg-gradient-to-br from-background to-muted/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", item.accent)}>
                          {item.tag}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openTree(item.treeId)}>
                          Open tree
                        </Button>
                        <span className="text-xs text-muted-foreground">Branch out</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )
          })}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Quick Navigation</h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onNavigate("vocab")} className="gap-2">
              <BookText className="h-4 w-4" />
              Vocabulary
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate("cards")} className="gap-2">
              <Layers className="h-4 w-4" />
              Flashcards
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate("train")} className="gap-2">
              <Target className="h-4 w-4" />
              Practice
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate("core")} className="gap-2">
              <BookText className="h-4 w-4" />
              Grammar Reference
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate("cheat")} className="gap-2">
              <Zap className="h-4 w-4" />
              Cheat Sheets
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
