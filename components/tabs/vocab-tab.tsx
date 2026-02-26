"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Check, Filter, RotateCcw, Search, Star, Volume2, BookOpen, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { lessonCatalog } from "@/lib/lesson-catalog"

const categories = [
  { id: "all", label: "All Words" },
  { id: "pronouns", label: "Pronouns" },
  { id: "possessives", label: "Possessives" },
  { id: "prepositions", label: "Prepositions" },
  { id: "connectors", label: "Connectors" },
  { id: "question-words", label: "Question Words" },
  { id: "modal-verbs", label: "Modal Verbs" },
  { id: "reflexive-verbs", label: "Reflexive Verbs" },
  { id: "separable-verbs", label: "Separable Verbs" },
  { id: "regular-verbs", label: "Regular Verbs" },
  { id: "irregular-verbs", label: "Irregular Verbs" },
  { id: "mixed-verbs", label: "Mixed Verbs" },
  { id: "nouns", label: "Nouns" },
  { id: "verbs", label: "Verbs + Prep" },
]

type WordLevel = "A1" | "A2" | "B1" | "None"
type CognateTag = "direct" | "near" | "false" | "none"
type FrequencyTag = "core" | "booster" | "specialist"

interface LearningHooks {
  domains: string[]
  cognate: CognateTag
  frequency: FrequencyTag
  confusables?: string[]
}

const defaultDomainsByCategory: Record<string, string[]> = {
  pronouns: ["Relationships"],
  possessives: ["Relationships"],
  prepositions: ["Travel"],
  connectors: ["Opinions/Arguments"],
  "question-words": ["Opinions/Arguments"],
  "modal-verbs": ["Work/Office"],
  "reflexive-verbs": ["Relationships"],
  "separable-verbs": ["Travel"],
  nouns: ["Shopping/Food"],
  verbs: ["Opinions/Arguments"],
  "regular-verbs": ["Work/Office"],
  "irregular-verbs": ["Work/Office"],
  "mixed-verbs": ["Work/Office"],
}

const defaultFrequencyByLevel: Record<WordLevel, FrequencyTag> = {
  A1: "core",
  A2: "booster",
  B1: "booster",
  None: "specialist",
}

interface VocabWord {
  id: number
  german: string
  english: string
  category: string
  article: string | null
  starred: boolean
  note: string
  level?: WordLevel
  example?: string
  hooks?: LearningHooks
}

const InfoTooltip = ({ text, bullets }: { text?: string; bullets?: string[] }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
        <Info className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-xs">
      {text && <p>{text}</p>}
      {bullets && (
        <ul className="mt-2 space-y-1">
          {bullets.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </TooltipContent>
  </Tooltip>
)

const vocabulary: VocabWord[] = [
  // Personal Pronouns
  { id: 1, german: "ich", english: "I", category: "pronouns", article: null, starred: true, note: "Always lowercase unless starting sentence" },
  { id: 2, german: "du", english: "you (informal singular)", category: "pronouns", article: null, starred: false, note: "For friends, family, children" },
  { id: 3, german: "er", english: "he", category: "pronouns", article: null, starred: false, note: "Masculine" },
  { id: 4, german: "sie", english: "she / they", category: "pronouns", article: null, starred: true, note: "Context determines meaning" },
  { id: 5, german: "es", english: "it", category: "pronouns", article: null, starred: false, note: "Neuter or impersonal" },
  { id: 6, german: "wir", english: "we", category: "pronouns", article: null, starred: false, note: "" },
  { id: 7, german: "ihr", english: "you (informal plural)", category: "pronouns", article: null, starred: false, note: "Group of friends" },
  { id: 8, german: "Sie", english: "you (formal)", category: "pronouns", article: null, starred: true, note: "Always capitalized!" },
  
  // Possessives
  { id: 9, german: "mein", english: "my", category: "possessives", article: null, starred: true, note: "From ich" },
  { id: 10, german: "dein", english: "your (informal)", category: "possessives", article: null, starred: false, note: "From du" },
  { id: 11, german: "sein", english: "his / its", category: "possessives", article: null, starred: false, note: "From er/es" },
  { id: 12, german: "ihr", english: "her / their", category: "possessives", article: null, starred: true, note: "From sie" },
  { id: 13, german: "unser", english: "our", category: "possessives", article: null, starred: false, note: "From wir" },
  { id: 14, german: "euer", english: "your (plural informal)", category: "possessives", article: null, starred: false, note: "From ihr - loses 'e' with endings" },
  { id: 15, german: "Ihr", english: "your (formal)", category: "possessives", article: null, starred: true, note: "From Sie - always capitalized" },

  // Prepositions - Accusative
  { id: 16, german: "durch", english: "through", category: "prepositions", article: null, starred: false, note: "Always Accusative - DOGFU" },
  { id: 17, german: "für", english: "for", category: "prepositions", article: null, starred: true, note: "Always Accusative - DOGFU" },
  { id: 18, german: "gegen", english: "against", category: "prepositions", article: null, starred: false, note: "Always Accusative - DOGFU" },
  { id: 19, german: "ohne", english: "without", category: "prepositions", article: null, starred: true, note: "Always Accusative - DOGFU" },
  { id: 20, german: "um", english: "around / at (time)", category: "prepositions", article: null, starred: false, note: "Always Accusative - DOGFU" },

  // Prepositions - Dative
  { id: 21, german: "aus", english: "out of / from", category: "prepositions", article: null, starred: true, note: "Always Dative" },
  { id: 22, german: "bei", english: "at / near / with", category: "prepositions", article: null, starred: false, note: "Always Dative" },
  { id: 23, german: "mit", english: "with", category: "prepositions", article: null, starred: true, note: "Always Dative" },
  { id: 24, german: "nach", english: "after / to (places)", category: "prepositions", article: null, starred: false, note: "Always Dative" },
  { id: 25, german: "seit", english: "since / for (time)", category: "prepositions", article: null, starred: false, note: "Always Dative" },
  { id: 26, german: "von", english: "from / of", category: "prepositions", article: null, starred: true, note: "Always Dative" },
  { id: 27, german: "zu", english: "to", category: "prepositions", article: null, starred: true, note: "Always Dative - zum/zur" },

  // Prepositions - Genitive
  { id: 200, german: "während", english: "during", category: "prepositions", article: null, starred: false, note: "Always Genitive" },
  { id: 201, german: "wegen", english: "because of", category: "prepositions", article: null, starred: true, note: "Always Genitive" },
  { id: 202, german: "trotz", english: "despite", category: "prepositions", article: null, starred: false, note: "Always Genitive" },

  // Prepositions - Two-way
  { id: 203, german: "in", english: "in / into", category: "prepositions", article: null, starred: true, note: "Two-way (Akk/Dativ)" },
  { id: 204, german: "an", english: "at / on", category: "prepositions", article: null, starred: false, note: "Two-way (Akk/Dativ)" },
  { id: 205, german: "auf", english: "on / onto", category: "prepositions", article: null, starred: false, note: "Two-way (Akk/Dativ)" },
  { id: 206, german: "über", english: "over / about", category: "prepositions", article: null, starred: false, note: "Two-way (Akk/Dativ)" },
  { id: 207, german: "unter", english: "under", category: "prepositions", article: null, starred: false, note: "Two-way (Akk/Dativ)" },
  { id: 208, german: "vor", english: "in front of / before", category: "prepositions", article: null, starred: false, note: "Two-way (Akk/Dativ)" },
  { id: 209, german: "hinter", english: "behind", category: "prepositions", article: null, starred: false, note: "Two-way (Akk/Dativ)" },
  { id: 210, german: "neben", english: "next to", category: "prepositions", article: null, starred: false, note: "Two-way (Akk/Dativ)" },
  { id: 211, german: "zwischen", english: "between", category: "prepositions", article: null, starred: false, note: "Two-way (Akk/Dativ)" },

  // Connectors - Type 0 (no verb change)
  { id: 28, german: "und", english: "and", category: "connectors", article: null, starred: true, note: "Type 0 - verb position unchanged" },
  { id: 29, german: "oder", english: "or", category: "connectors", article: null, starred: false, note: "Type 0 - verb position unchanged" },
  { id: 30, german: "aber", english: "but", category: "connectors", article: null, starred: true, note: "Type 0 - verb position unchanged" },
  { id: 31, german: "denn", english: "because (coord.)", category: "connectors", article: null, starred: false, note: "Type 0 - verb position unchanged", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "core", confusables: ["weil vs denn"] } },
  { id: 32, german: "sondern", english: "but rather", category: "connectors", article: null, starred: false, note: "Type 0 - after negative" },
  { id: 213, german: "doch", english: "but / however", category: "connectors", article: null, starred: false, note: "Type 0 - often after negation" },

  // Connectors - Type 1 (verb to end)
  { id: 33, german: "weil", english: "because", category: "connectors", article: null, starred: true, note: "Type 1 - verb goes to END" },
  { id: 34, german: "dass", english: "that", category: "connectors", article: null, starred: true, note: "Type 1 - verb goes to END" },
  { id: 35, german: "wenn", english: "if / when", category: "connectors", article: null, starred: true, note: "Type 1 - verb goes to END", hooks: { domains: ["Time & scheduling", "Opinions/Arguments"], cognate: "none", frequency: "core", confusables: ["wenn vs als"] } },
  { id: 36, german: "obwohl", english: "although", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 37, german: "als", english: "when (past)", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "booster", confusables: ["wenn vs als"] } },
  { id: 38, german: "bevor", english: "before", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 39, german: "nachdem", english: "after", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 214, german: "da", english: "since / because", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 215, german: "falls", english: "in case", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 216, german: "sofern", english: "provided that", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 217, german: "obgleich", english: "although (formal)", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 218, german: "obschon", english: "although (formal/rare)", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 219, german: "ehe", english: "before (formal)", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 220, german: "seit", english: "since", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 221, german: "seitdem", english: "since (then)", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 222, german: "sobald", english: "as soon as", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 223, german: "solange", english: "as long as", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 224, german: "während", english: "while", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 225, german: "bis", english: "until", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 226, german: "sowie", english: "as soon as / once", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 227, german: "damit", english: "so that", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 228, german: "indem", english: "by doing", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 229, german: "als ob", english: "as if", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 230, german: "als wenn", english: "as if (colloquial)", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 231, german: "ob", english: "whether / if", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 232, german: "auch wenn", english: "even if", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 233, german: "nur wenn", english: "only if", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 234, german: "außer wenn", english: "except if", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 235, german: "ohne dass", english: "without (doing)", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 236, german: "statt dass", english: "instead of (doing)", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 237, german: "anstatt dass", english: "instead of (doing)", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 238, german: "so dass", english: "so that / so ... that", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 239, german: "sodass", english: "so that / so ... that", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },
  { id: 240, german: "je nachdem, ob", english: "depending on whether", category: "connectors", article: null, starred: false, note: "Type 1 - verb goes to END" },

  // Connectors - Type 2 (verb first after)
  { id: 40, german: "deshalb", english: "therefore", category: "connectors", article: null, starred: true, note: "Type 2 - verb comes FIRST after" },
  { id: 41, german: "trotzdem", english: "nevertheless", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 42, german: "dann", english: "then", category: "connectors", article: null, starred: true, note: "Type 2 - verb comes FIRST after" },
  { id: 43, german: "danach", english: "after that", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 212, german: "außerdem", english: "besides / furthermore", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 241, german: "deswegen", english: "for that reason", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 242, german: "daher", english: "therefore", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 243, german: "darum", english: "therefore", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 244, german: "also", english: "so / therefore", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 245, german: "folglich", english: "consequently", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 246, german: "somit", english: "thus", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 247, german: "dennoch", english: "nevertheless", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 248, german: "allerdings", english: "however / admittedly", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 249, german: "hingegen", english: "in contrast", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 250, german: "dagegen", english: "on the other hand", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 251, german: "ebenfalls", english: "likewise", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 252, german: "auch", english: "also / too", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 253, german: "dazu", english: "in addition", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 254, german: "später", english: "later", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 255, german: "zuerst", english: "first", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 256, german: "anschließend", english: "afterwards", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 257, german: "inzwischen", english: "meanwhile", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 258, german: "schließlich", english: "finally / after all", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 259, german: "zum Beispiel", english: "for example", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 260, german: "nämlich", english: "namely / because (explains)", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 261, german: "kurz gesagt", english: "in short", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 262, german: "tatsächlich", english: "actually / in fact", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },
  { id: 263, german: "sonst", english: "otherwise / else", category: "connectors", article: null, starred: false, note: "Type 2 - verb comes FIRST after" },

  // Question Words
  { id: 44, german: "was", english: "what", category: "question-words", article: null, starred: true, note: "" },
  { id: 45, german: "wer", english: "who", category: "question-words", article: null, starred: true, note: "Nominative" },
  { id: 46, german: "wen", english: "whom (acc)", category: "question-words", article: null, starred: false, note: "Accusative" },
  { id: 47, german: "wem", english: "whom (dat)", category: "question-words", article: null, starred: false, note: "Dative" },
  { id: 48, german: "wo", english: "where", category: "question-words", article: null, starred: true, note: "" },
  { id: 49, german: "wann", english: "when", category: "question-words", article: null, starred: true, note: "" },
  { id: 50, german: "warum", english: "why", category: "question-words", article: null, starred: true, note: "" },
  { id: 51, german: "wie", english: "how", category: "question-words", article: null, starred: true, note: "" },
  { id: 52, german: "worüber", english: "about what", category: "question-words", article: null, starred: true, note: "For THINGS only" },
  { id: 53, german: "womit", english: "with what", category: "question-words", article: null, starred: false, note: "For THINGS only" },
  { id: 54, german: "worauf", english: "on what / for what", category: "question-words", article: null, starred: true, note: "For THINGS only" },
  { id: 55, german: "mit wem", english: "with whom", category: "question-words", article: null, starred: true, note: "For PEOPLE only" },

  // Modal Verbs - Present
  { id: 56, german: "können (ich kann)", english: "can / to be able to", category: "modal-verbs", article: null, starred: true, note: "Present: Ich kann es machen" },
  { id: 57, german: "müssen (ich muss)", english: "must / have to", category: "modal-verbs", article: null, starred: true, note: "Present: Ich muss es machen" },
  { id: 58, german: "wollen (ich will)", english: "want to", category: "modal-verbs", article: null, starred: true, note: "Present: Ich will es machen" },
  { id: 59, german: "sollen (ich soll)", english: "should / supposed to", category: "modal-verbs", article: null, starred: false, note: "Present: Ich soll es machen" },
  { id: 60, german: "dürfen (ich darf)", english: "may / allowed to", category: "modal-verbs", article: null, starred: false, note: "Present: Ich darf es machen" },
  { id: 61, german: "mögen (ich mag)", english: "to like", category: "modal-verbs", article: null, starred: false, note: "Ich mache es gern (preferred)" },

  // Modal Verbs - Konjunktiv II
  { id: 62, german: "könnte", english: "could (Konj. II)", category: "modal-verbs", article: null, starred: true, note: "Ich könnte morgen kommen" },
  { id: 63, german: "müsste", english: "would have to", category: "modal-verbs", article: null, starred: false, note: "Ich müsste mehr lernen" },
  { id: 64, german: "dürfte", english: "might be allowed", category: "modal-verbs", article: null, starred: false, note: "Ich dürfte länger bleiben" },
  { id: 65, german: "sollte", english: "should (softer)", category: "modal-verbs", article: null, starred: true, note: "Ich sollte früher gehen" },
  { id: 66, german: "wollte", english: "would want", category: "modal-verbs", article: null, starred: false, note: "Ich wollte dir helfen" },
  { id: 67, german: "möchte", english: "would like to", category: "modal-verbs", article: null, starred: true, note: "Ich möchte einen Kaffee" },

  // Reflexive Verbs
  { id: 99, german: "sich freuen auf + Akk", english: "to look forward to", category: "reflexive-verbs", article: null, starred: true, note: "Ich freue mich auf..." },
  { id: 100, german: "sich freuen über + Akk", english: "to be happy about", category: "reflexive-verbs", article: null, starred: true, note: "Sie freut sich über..." },
  { id: 101, german: "sich interessieren für", english: "to be interested in", category: "reflexive-verbs", article: null, starred: true, note: "Er interessiert sich für..." },
  { id: 102, german: "sich treffen", english: "to meet (each other)", category: "reflexive-verbs", article: null, starred: false, note: "Wir treffen uns" },
  { id: 103, german: "sich vorstellen", english: "to imagine / introduce", category: "reflexive-verbs", article: null, starred: true, note: "Ich stelle mir vor..." },
  { id: 104, german: "sich erinnern an + Akk", english: "to remember", category: "reflexive-verbs", article: null, starred: true, note: "Ich erinnere mich an..." },

  // Separable Verbs
  { id: 105, german: "aufstehen", english: "to get up", category: "separable-verbs", article: null, starred: true, note: "Ich stehe auf. / Ich bin aufgestanden.", level: "A1", example: "Ich stehe um sieben Uhr auf." },
  { id: 106, german: "anfangen", english: "to begin", category: "separable-verbs", article: null, starred: true, note: "Es fängt an. / Es hat angefangen." },
  { id: 107, german: "mitkommen", english: "to come along", category: "separable-verbs", article: null, starred: false, note: "Kommst du mit? / Bist du mitgekommen?" },
  { id: 108, german: "einkaufen", english: "to shop", category: "separable-verbs", article: null, starred: false, note: "Ich kaufe ein. / Ich habe eingekauft." },
  { id: 109, german: "anrufen", english: "to call", category: "separable-verbs", article: null, starred: true, note: "Ich rufe an. / Ich habe angerufen." },
  { id: 110, german: "zurückkommen", english: "to come back", category: "separable-verbs", article: null, starred: false, note: "Er kommt zurück. / Er ist zurückgekommen." },
  { id: 437, german: "aufmachen", english: "to open (up)", category: "separable-verbs", article: null, starred: false, note: "Mach die Tür auf.", level: "A1", example: "Ich mache das Fenster auf." },
  { id: 438, german: "anziehen", english: "to put on (clothes)", category: "separable-verbs", article: null, starred: false, note: "Ich ziehe mich an.", level: "A1", example: "Ich ziehe die Jacke an." },
  { id: 439, german: "mitnehmen", english: "to take along", category: "separable-verbs", article: null, starred: false, note: "Ich nehme Wasser mit.", level: "A2", example: "Nimm bitte den Schlüssel mit." },
  { id: 440, german: "aussteigen", english: "to get off", category: "separable-verbs", article: null, starred: false, note: "Wir steigen an der Haltestelle aus.", level: "A2", example: "Steig an der nächsten Station aus." },
  { id: 490, german: "abfahren", english: "to depart", category: "separable-verbs", article: null, starred: false, note: "Der Zug fährt ab.", level: "A2", example: "Der Zug fährt um neun Uhr ab.", hooks: { domains: ["Travel", "Time & scheduling"], cognate: "none", frequency: "booster" } },
  { id: 491, german: "ankommen", english: "to arrive", category: "separable-verbs", article: null, starred: false, note: "Wir kommen an.", level: "A2", example: "Wir kommen um 18 Uhr an.", hooks: { domains: ["Travel", "Time & scheduling"], cognate: "none", frequency: "booster" } },
  { id: 492, german: "umsteigen", english: "to change trains", category: "separable-verbs", article: null, starred: false, note: "Ich steige um.", level: "B1", example: "Ich steige in München um.", hooks: { domains: ["Travel"], cognate: "none", frequency: "booster" } },

  // Nouns with Articles
  { id: 111, german: "der Mann", english: "the man", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1" },
  { id: 112, german: "die Frau", english: "the woman", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1" },
  { id: 113, german: "das Kind", english: "the child", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1" },
  { id: 114, german: "die Zeitung", english: "the newspaper", category: "nouns", article: "die", starred: true, note: "-ung = feminine", level: "A2", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 115, german: "das Mädchen", english: "the girl", category: "nouns", article: "das", starred: true, note: "-chen = neuter (always!)", level: "A1" },
  { id: 116, german: "der Lehrer", english: "the teacher (m)", category: "nouns", article: "der", starred: false, note: "-er person = masculine", level: "A1", hooks: { domains: ["University"], cognate: "none", frequency: "core" } },
  { id: 299, german: "die Schule", english: "the school", category: "nouns", article: "die", starred: true, note: "-e often feminine", level: "A1", hooks: { domains: ["University"], cognate: "none", frequency: "core" } },
  { id: 300, german: "das Buch", english: "the book", category: "nouns", article: "das", starred: true, note: "Common noun", level: "A1", hooks: { domains: ["University"], cognate: "none", frequency: "core" } },
  { id: 301, german: "der Freund", english: "the friend (m)", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", hooks: { domains: ["Relationships"], cognate: "none", frequency: "core" } },
  { id: 302, german: "die Freundin", english: "the friend (f)", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", hooks: { domains: ["Relationships"], cognate: "none", frequency: "core" } },
  { id: 303, german: "das Haus", english: "the house", category: "nouns", article: "das", starred: true, note: "Neuter", level: "A1", hooks: { domains: ["Housing"], cognate: "none", frequency: "core" } },
  { id: 304, german: "die Stadt", english: "the city", category: "nouns", article: "die", starred: false, note: "-t often feminine", level: "A1", hooks: { domains: ["Travel"], cognate: "none", frequency: "core" } },
  { id: 305, german: "das Auto", english: "the car", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", hooks: { domains: ["Travel"], cognate: "direct", frequency: "core" } },
  { id: 306, german: "der Tisch", english: "the table", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1" },
  { id: 307, german: "der Stuhl", english: "the chair", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1" },
  { id: 308, german: "die Tür", english: "the door", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1" },
  { id: 309, german: "das Fenster", english: "the window", category: "nouns", article: "das", starred: false, note: "-er often neuter", level: "A1" },
  { id: 310, german: "die Straße", english: "the street", category: "nouns", article: "die", starred: false, note: "-e feminine", level: "A1", hooks: { domains: ["Travel"], cognate: "none", frequency: "core" } },
  { id: 311, german: "der Bahnhof", english: "the train station", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", hooks: { domains: ["Travel"], cognate: "none", frequency: "booster" } },
  { id: 312, german: "die Arbeit", english: "the work", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "core" } },
  { id: 313, german: "der Beruf", english: "the job", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "core" } },
  { id: 314, german: "die Familie", english: "the family", category: "nouns", article: "die", starred: true, note: "-ie feminine", level: "A1", hooks: { domains: ["Relationships"], cognate: "near", frequency: "core" } },
  { id: 315, german: "der Morgen", english: "the morning", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 316, german: "der Abend", english: "the evening", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 317, german: "die Nacht", english: "the night", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 318, german: "das Jahr", english: "the year", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 319, german: "die Woche", english: "the week", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 320, german: "der Monat", english: "the month", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 321, german: "der Tag", english: "the day", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 322, german: "die Zeit", english: "the time", category: "nouns", article: "die", starred: true, note: "Feminine", level: "A1", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 323, german: "das Geld", english: "the money", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", hooks: { domains: ["Shopping/Food", "Bureaucracy"], cognate: "none", frequency: "core" } },
  { id: 324, german: "der Preis", english: "the price", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "booster" } },
  { id: 325, german: "die Frage", english: "the question", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", hooks: { domains: ["Opinions/Arguments", "University"], cognate: "none", frequency: "core" } },
  { id: 326, german: "die Antwort", english: "the answer", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "core" } },
  { id: 327, german: "das Problem", english: "the problem", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", hooks: { domains: ["Opinions/Arguments", "Work/Office"], cognate: "direct", frequency: "booster" } },
  { id: 328, german: "die Lösung", english: "the solution", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "A2", hooks: { domains: ["Opinions/Arguments", "Work/Office"], cognate: "none", frequency: "booster" } },
  { id: 329, german: "das Gespräch", english: "the conversation", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", hooks: { domains: ["Opinions/Arguments", "Relationships"], cognate: "none", frequency: "booster" } },
  { id: 330, german: "die Sprache", english: "the language", category: "nouns", article: "die", starred: true, note: "Feminine", level: "A1", hooks: { domains: ["University"], cognate: "none", frequency: "core" } },
  { id: 331, german: "der Satz", english: "the sentence", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", hooks: { domains: ["University"], cognate: "none", frequency: "booster" } },
  { id: 332, german: "das Wort", english: "the word", category: "nouns", article: "das", starred: true, note: "Neuter", level: "A1", hooks: { domains: ["University"], cognate: "none", frequency: "core" } },
  { id: 333, german: "die Bedeutung", english: "the meaning", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "A2", hooks: { domains: ["University"], cognate: "none", frequency: "booster" } },
  { id: 334, german: "die Nummer", english: "the number", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", hooks: { domains: ["Bureaucracy", "Shopping/Food"], cognate: "direct", frequency: "core" } },
  { id: 335, german: "die Adresse", english: "the address", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", hooks: { domains: ["Bureaucracy"], cognate: "direct", frequency: "core" } },
  { id: 336, german: "der Zug", english: "the train", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", hooks: { domains: ["Travel"], cognate: "none", frequency: "core" } },
  { id: 337, german: "der Bus", english: "the bus", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", hooks: { domains: ["Travel"], cognate: "direct", frequency: "core" } },
  { id: 338, german: "die U-Bahn", english: "the subway", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", hooks: { domains: ["Travel"], cognate: "near", frequency: "booster" } },
  { id: 339, german: "das Fahrrad", english: "the bicycle", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", hooks: { domains: ["Travel"], cognate: "none", frequency: "booster" } },
  { id: 340, german: "das Flugzeug", english: "the airplane", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", hooks: { domains: ["Travel"], cognate: "near", frequency: "booster" } },
  { id: 341, german: "der Supermarkt", english: "the supermarket", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", hooks: { domains: ["Shopping/Food"], cognate: "direct", frequency: "core" } },
  { id: 342, german: "der Markt", english: "the market", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "booster" } },
  { id: 343, german: "die Apotheke", english: "the pharmacy", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", hooks: { domains: ["Health"], cognate: "near", frequency: "booster" } },
  { id: 344, german: "das Krankenhaus", english: "the hospital", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", hooks: { domains: ["Health"], cognate: "none", frequency: "booster" } },
  { id: 345, german: "der Arzt", english: "the doctor (m)", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 346, german: "die Ärztin", english: "the doctor (f)", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 347, german: "das Essen", english: "the food", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 348, german: "das Wasser", english: "the water", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", hooks: { domains: ["Shopping/Food", "Health"], cognate: "none", frequency: "core" } },
  { id: 349, german: "der Kaffee", english: "the coffee", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", hooks: { domains: ["Shopping/Food"], cognate: "direct", frequency: "core" } },
  { id: 350, german: "der Tee", english: "the tea", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", hooks: { domains: ["Shopping/Food"], cognate: "direct", frequency: "core" } },
  { id: 351, german: "die Milch", english: "the milk", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 352, german: "das Brot", english: "the bread", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 353, german: "der Käse", english: "the cheese", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 354, german: "die Rechnung", english: "the bill", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "A2", hooks: { domains: ["Shopping/Food", "Work/Office"], cognate: "none", frequency: "booster" } },
  { id: 355, german: "das Zimmer", english: "the room", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", hooks: { domains: ["Housing"], cognate: "none", frequency: "core" } },
  { id: 356, german: "der Schlüssel", english: "the key", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", hooks: { domains: ["Housing"], cognate: "none", frequency: "booster" } },
  { id: 357, german: "der Termin", english: "the appointment", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", hooks: { domains: ["Health", "Work/Office"], cognate: "none", frequency: "booster" } },
  { id: 400, german: "die Küche", english: "the kitchen", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Die Küche ist klein.", hooks: { domains: ["Housing"], cognate: "none", frequency: "core" } },
  { id: 401, german: "das Bad", english: "the bathroom", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Das Bad ist neben der Küche.", hooks: { domains: ["Housing"], cognate: "none", frequency: "core" } },
  { id: 402, german: "das Schlafzimmer", english: "the bedroom", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Im Schlafzimmer steht ein Bett.", hooks: { domains: ["Housing"], cognate: "none", frequency: "core" } },
  { id: 403, german: "das Bett", english: "the bed", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Das Bett ist bequem.", hooks: { domains: ["Housing"], cognate: "none", frequency: "core" } },
  { id: 404, german: "der Kühlschrank", english: "the fridge", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", example: "Im Kühlschrank ist Milch.", hooks: { domains: ["Housing", "Shopping/Food"], cognate: "none", frequency: "booster" } },
  { id: 405, german: "der Herd", english: "the stove", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Herd ist heiß.", hooks: { domains: ["Housing", "Shopping/Food"], cognate: "none", frequency: "booster" } },
  { id: 406, german: "die Lampe", english: "the lamp", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Die Lampe ist an.", hooks: { domains: ["Housing"], cognate: "none", frequency: "booster" } },
  { id: 407, german: "das Sofa", english: "the sofa", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Wir sitzen auf dem Sofa.", hooks: { domains: ["Housing"], cognate: "direct", frequency: "booster" } },
  { id: 408, german: "der Schrank", english: "the closet", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Die Jacke ist im Schrank.", hooks: { domains: ["Housing"], cognate: "none", frequency: "booster" } },
  { id: 409, german: "die Kleidung", english: "the clothing", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Meine Kleidung ist sauber.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "booster" } },
  { id: 410, german: "die Hose", english: "the pants", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Die Hose ist neu.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 411, german: "das Hemd", english: "the shirt", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Das Hemd ist blau.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 412, german: "der Schuh", english: "the shoe", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", example: "Der Schuh ist bequem.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 413, german: "die Jacke", english: "the jacket", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Ich ziehe die Jacke an.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 414, german: "die Tasche", english: "the bag", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Die Tasche ist schwer.", hooks: { domains: ["Shopping/Food", "Travel"], cognate: "none", frequency: "core" } },
  { id: 415, german: "die Brille", english: "the glasses", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Ich brauche eine Brille.", hooks: { domains: ["Health"], cognate: "none", frequency: "booster" } },
  { id: 416, german: "die Uhr", english: "the watch/clock", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Die Uhr ist kaputt.", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 417, german: "das Handy", english: "the phone", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Mein Handy ist leer.", hooks: { domains: ["Work/Office", "Relationships"], cognate: "none", frequency: "core" } },
  { id: 418, german: "der Computer", english: "the computer", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Computer ist schnell.", hooks: { domains: ["Work/Office", "University"], cognate: "direct", frequency: "booster" } },
  { id: 419, german: "das Internet", english: "the internet", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Internet ist langsam.", hooks: { domains: ["Work/Office", "University"], cognate: "direct", frequency: "booster" } },
  { id: 420, german: "die E-Mail", english: "the email", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Ich schreibe eine E-Mail.", hooks: { domains: ["Work/Office", "University"], cognate: "direct", frequency: "booster" } },
  { id: 421, german: "die Nachricht", english: "the message", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Ich bekomme eine Nachricht.", hooks: { domains: ["Relationships"], cognate: "none", frequency: "booster", confusables: ["bekommen vs become (false friend)"] } },
  { id: 422, german: "das Wetter", english: "the weather", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Das Wetter ist gut.", hooks: { domains: ["Travel"], cognate: "none", frequency: "core" } },
  { id: 423, german: "der Regen", english: "the rain", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", example: "Der Regen hört auf.", hooks: { domains: ["Travel"], cognate: "none", frequency: "booster" } },
  { id: 424, german: "die Sonne", english: "the sun", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Die Sonne scheint.", hooks: { domains: ["Travel"], cognate: "none", frequency: "booster" } },
  { id: 425, german: "der Wind", english: "the wind", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Wind ist stark.", hooks: { domains: ["Travel"], cognate: "none", frequency: "booster" } },
  { id: 426, german: "der Kopf", english: "the head", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", example: "Mein Kopf tut weh.", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 427, german: "die Hand", english: "the hand", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Gib mir deine Hand.", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 428, german: "der Fuß", english: "the foot", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", example: "Mein Fuß ist müde.", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 429, german: "der Arm", english: "the arm", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", example: "Der Arm ist verletzt.", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 430, german: "das Bein", english: "the leg", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Ich bewege das Bein.", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 431, german: "das Ticket", english: "the ticket", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Ich kaufe ein Ticket.", hooks: { domains: ["Travel"], cognate: "direct", frequency: "booster" } },
  { id: 432, german: "der Ausweis", english: "the ID", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Zeigen Sie Ihren Ausweis.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "booster" } },
  { id: 433, german: "das Büro", english: "the office", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Ich arbeite im Büro.", hooks: { domains: ["Work/Office"], cognate: "near", frequency: "core" } },
  { id: 434, german: "die Miete", english: "the rent", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Miete ist hoch.", hooks: { domains: ["Housing"], cognate: "none", frequency: "booster" } },
  { id: 435, german: "der Vertrag", english: "the contract", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Ich unterschreibe den Vertrag.", hooks: { domains: ["Work/Office", "Bureaucracy"], cognate: "direct", frequency: "specialist" } },
  { id: 451, german: "die Universität", english: "the university", category: "nouns", article: "die", starred: true, note: "Feminine", level: "A2", example: "Die Universität ist in der Stadt.", hooks: { domains: ["University"], cognate: "near", frequency: "core" } },
  { id: 452, german: "der Student", english: "the student (m)", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", example: "Der Student lernt Deutsch.", hooks: { domains: ["University"], cognate: "direct", frequency: "core" } },
  { id: 453, german: "die Studentin", english: "the student (f)", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Die Studentin hat eine Prüfung.", hooks: { domains: ["University"], cognate: "direct", frequency: "core" } },
  { id: 454, german: "die Prüfung", english: "the exam", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "A2", example: "Die Prüfung ist morgen.", hooks: { domains: ["University"], cognate: "none", frequency: "booster" } },
  { id: 455, german: "die Vorlesung", english: "the lecture", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Die Vorlesung beginnt um zehn.", hooks: { domains: ["University"], cognate: "none", frequency: "booster" } },
  { id: 456, german: "das Seminar", english: "the seminar", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Das Seminar ist interessant.", hooks: { domains: ["University"], cognate: "direct", frequency: "booster" } },
  { id: 457, german: "die Bibliothek", english: "the library", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Ich lerne in der Bibliothek.", hooks: { domains: ["University"], cognate: "none", frequency: "booster" } },
  { id: 458, german: "der Professor", english: "the professor", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Professor erklärt die Aufgabe.", hooks: { domains: ["University"], cognate: "direct", frequency: "booster" } },
  { id: 459, german: "die Note", english: "the grade", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Ich bekomme eine gute Note.", hooks: { domains: ["University"], cognate: "none", frequency: "booster" } },
  { id: 460, german: "die Beziehung", english: "the relationship", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Beziehung ist wichtig.", hooks: { domains: ["Relationships"], cognate: "near", frequency: "booster" } },
  { id: 461, german: "der Partner", english: "the partner", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Mein Partner kocht gern.", hooks: { domains: ["Relationships"], cognate: "direct", frequency: "booster" } },
  { id: 462, german: "die Partnerin", english: "the partner (f)", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Meine Partnerin arbeitet hier.", hooks: { domains: ["Relationships"], cognate: "direct", frequency: "booster" } },
  { id: 463, german: "die Ehe", english: "the marriage", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Ehe dauert lange.", hooks: { domains: ["Relationships", "Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 464, german: "die Wohnung", english: "the apartment", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Die Wohnung ist groß.", hooks: { domains: ["Housing"], cognate: "none", frequency: "core" } },
  { id: 465, german: "der Vermieter", english: "the landlord", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Vermieter repariert die Heizung.", hooks: { domains: ["Housing", "Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 466, german: "der Nachbar", english: "the neighbor", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Nachbar ist freundlich.", hooks: { domains: ["Housing", "Relationships"], cognate: "none", frequency: "booster" } },
  { id: 467, german: "das Amt", english: "the public office", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Ich gehe zum Amt.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 468, german: "das Formular", english: "the form", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Ich fülle das Formular aus.", hooks: { domains: ["Bureaucracy"], cognate: "direct", frequency: "specialist" } },
  { id: 469, german: "der Antrag", english: "the application", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Antrag ist komplett.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 471, german: "die Steuer", english: "the tax", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Steuer ist hoch.", hooks: { domains: ["Bureaucracy", "Work/Office"], cognate: "none", frequency: "specialist" } },
  { id: 472, german: "die Versicherung", english: "the insurance", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Versicherung zahlt das.", hooks: { domains: ["Bureaucracy", "Health"], cognate: "direct", frequency: "specialist" } },
  { id: 473, german: "der Aufenthalt", english: "the stay/residence", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Aufenthalt dauert ein Jahr.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 474, german: "die Kasse", english: "the checkout", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Die Kasse ist frei.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 475, german: "das Angebot", english: "the sale/offer", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Angebot ist günstig.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "booster" } },
  { id: 476, german: "das Gemüse", english: "the vegetables", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Ich kaufe Gemüse.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 477, german: "das Obst", english: "the fruit", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Das Obst ist frisch.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 478, german: "der Terminplan", english: "the schedule", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Terminplan ist voll.", hooks: { domains: ["Time & scheduling", "Work/Office"], cognate: "none", frequency: "booster" } },
  { id: 479, german: "die Meinung", english: "the opinion", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Meiner Meinung nach ist es gut.", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },

  // Verbs with Prepositions
  { id: 117, german: "warten auf + Akk", english: "to wait for", category: "verbs", article: null, starred: true, note: "Ich warte auf den Bus", level: "A2", hooks: { domains: ["Travel", "Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 118, german: "denken an + Akk", english: "to think about", category: "verbs", article: null, starred: true, note: "Ich denke an dich", level: "A2", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "core", confusables: ["denken vs glauben", "kennen vs wissen"] } },
  { id: 119, german: "träumen von + Dat", english: "to dream of", category: "verbs", article: null, starred: false, note: "Er träumt von...", level: "A2", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 120, german: "helfen + Dat", english: "to help", category: "verbs", article: null, starred: true, note: "DATIVE verb! Ich helfe dir", level: "A2", hooks: { domains: ["Relationships", "Health"], cognate: "none", frequency: "core" } },
  { id: 121, german: "gefallen + Dat", english: "to please", category: "verbs", article: null, starred: true, note: "DATIVE verb! Es gefällt mir", level: "A2", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 122, german: "Angst haben vor + Dat", english: "to be afraid of", category: "verbs", article: null, starred: false, note: "Sie hat Angst vor Spinnen", level: "A2", hooks: { domains: ["Health"], cognate: "none", frequency: "booster" } },
  { id: 359, german: "sprechen mit + Dat", english: "to talk with", category: "verbs", article: null, starred: true, note: "Ich spreche mit meiner Freundin", level: "A1", hooks: { domains: ["Relationships", "Work/Office"], cognate: "near", frequency: "core" } },
  { id: 360, german: "gehören zu + Dat", english: "to belong to", category: "verbs", article: null, starred: false, note: "Das gehört zu mir", level: "A2", hooks: { domains: ["Relationships"], cognate: "none", frequency: "booster" } },
  { id: 361, german: "sich kümmern um + Akk", english: "to take care of", category: "verbs", article: null, starred: false, note: "Ich kümmere mich um das Kind", level: "B1", hooks: { domains: ["Relationships", "Health"], cognate: "none", frequency: "booster" } },
  { id: 362, german: "sich bedanken bei + Dat", english: "to thank", category: "verbs", article: null, starred: false, note: "Ich bedanke mich bei dir", level: "A2", hooks: { domains: ["Relationships"], cognate: "none", frequency: "booster" } },
  { id: 363, german: "sich erinnern an + Akk", english: "to remember", category: "verbs", article: null, starred: false, note: "Ich erinnere mich an dich", level: "A2", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 364, german: "sich freuen über + Akk", english: "to be happy about", category: "verbs", article: null, starred: false, note: "Ich freue mich über das Geschenk", level: "A2", hooks: { domains: ["Relationships"], cognate: "none", frequency: "booster" } },
  { id: 365, german: "sich freuen auf + Akk", english: "to look forward to", category: "verbs", article: null, starred: false, note: "Ich freue mich auf den Urlaub", level: "A2", hooks: { domains: ["Travel", "Time & scheduling"], cognate: "none", frequency: "booster" } },
  { id: 366, german: "teilnehmen an + Dat", english: "to participate in", category: "verbs", article: null, starred: false, note: "Ich nehme an dem Kurs teil", level: "B1", hooks: { domains: ["University", "Work/Office"], cognate: "near", frequency: "booster" } },
  { id: 367, german: "sich interessieren für + Akk", english: "to be interested in", category: "verbs", article: null, starred: false, note: "Er interessiert sich für Musik", level: "A2", hooks: { domains: ["Opinions/Arguments"], cognate: "direct", frequency: "booster" } },
  { id: 368, german: "sich vorbereiten auf + Akk", english: "to prepare for", category: "verbs", article: null, starred: false, note: "Ich bereite mich auf die Prüfung vor", level: "B1", hooks: { domains: ["University", "Work/Office"], cognate: "none", frequency: "booster" } },
  { id: 369, german: "sich entscheiden für + Akk", english: "to decide on", category: "verbs", article: null, starred: false, note: "Wir entscheiden uns für die Reise", level: "B1", hooks: { domains: ["Travel", "Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 370, german: "sich verlassen auf + Akk", english: "to rely on", category: "verbs", article: null, starred: false, note: "Ich verlasse mich auf dich", level: "B1", hooks: { domains: ["Relationships"], cognate: "none", frequency: "booster" } },
  { id: 371, german: "sich beeilen", english: "to hurry", category: "verbs", article: null, starred: false, note: "Beeil dich!", level: "A2", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "booster" } },
  { id: 372, german: "sich treffen mit + Dat", english: "to meet with", category: "verbs", article: null, starred: false, note: "Ich treffe mich mit Anna", level: "A1", hooks: { domains: ["Relationships"], cognate: "none", frequency: "core" } },

  // Regular Verbs
  { id: 264, german: "machen", english: "to do / make", category: "regular-verbs", article: null, starred: true, note: "ich mache, ich machte, ich habe gemacht", level: "A1", hooks: { domains: ["Work/Office", "Shopping/Food"], cognate: "none", frequency: "core", confusables: ["machen vs tun"] } },
  { id: 265, german: "lernen", english: "to learn", category: "regular-verbs", article: null, starred: true, note: "ich lerne, ich lernte, ich habe gelernt", level: "A1" },
  { id: 266, german: "arbeiten", english: "to work", category: "regular-verbs", article: null, starred: false, note: "ich arbeite, ich arbeitete, ich habe gearbeitet", level: "A1" },
  { id: 267, german: "fragen", english: "to ask", category: "regular-verbs", article: null, starred: false, note: "ich frage, ich fragte, ich habe gefragt", level: "A1" },
  { id: 268, german: "antworten", english: "to answer", category: "regular-verbs", article: null, starred: false, note: "ich antworte, ich antwortete, ich habe geantwortet", level: "A1" },
  { id: 269, german: "spielen", english: "to play", category: "regular-verbs", article: null, starred: false, note: "ich spiele, ich spielte, ich habe gespielt", level: "A1" },
  { id: 270, german: "brauchen", english: "to need", category: "regular-verbs", article: null, starred: false, note: "ich brauche, ich brauchte, ich habe gebraucht", level: "A1" },
  { id: 271, german: "sagen", english: "to say", category: "regular-verbs", article: null, starred: true, note: "ich sage, ich sagte, ich habe gesagt", level: "A1" },
  { id: 272, german: "kaufen", english: "to buy", category: "regular-verbs", article: null, starred: false, note: "ich kaufe, ich kaufte, ich habe gekauft", level: "A1" },
  { id: 273, german: "wohnen", english: "to live / reside", category: "regular-verbs", article: null, starred: false, note: "ich wohne, ich wohnte, ich habe gewohnt", level: "A1" },
  { id: 373, german: "reisen", english: "to travel", category: "regular-verbs", article: null, starred: false, note: "ich reise, ich reiste, ich bin gereist", level: "A2" },
  { id: 374, german: "studieren", english: "to study", category: "regular-verbs", article: null, starred: false, note: "ich studiere, ich studierte, ich habe studiert", level: "A2" },
  { id: 375, german: "planen", english: "to plan", category: "regular-verbs", article: null, starred: false, note: "ich plane, ich plante, ich habe geplant", level: "A2" },
  { id: 376, german: "besuchen", english: "to visit", category: "regular-verbs", article: null, starred: false, note: "ich besuche, ich besuchte, ich habe besucht", level: "A2" },
  { id: 377, german: "erklären", english: "to explain", category: "regular-verbs", article: null, starred: false, note: "ich erkläre, ich erklärte, ich habe erklärt", level: "A2" },
  { id: 378, german: "benutzen", english: "to use", category: "regular-verbs", article: null, starred: false, note: "ich benutze, ich benutzte, ich habe benutzt", level: "A2" },
  { id: 379, german: "kochen", english: "to cook", category: "regular-verbs", article: null, starred: false, note: "ich koche, ich kochte, ich habe gekocht", level: "A1" },
  { id: 380, german: "öffnen", english: "to open", category: "regular-verbs", article: null, starred: false, note: "ich öffne, ich öffnete, ich habe geöffnet", level: "A1" },
  { id: 381, german: "schließen", english: "to close", category: "regular-verbs", article: null, starred: false, note: "ich schließe, ich schloss, ich habe geschlossen", level: "A2" },
  { id: 382, german: "feiern", english: "to celebrate", category: "regular-verbs", article: null, starred: false, note: "ich feiere, ich feierte, ich habe gefeiert", level: "A2" },
  { id: 441, german: "tanzen", english: "to dance", category: "regular-verbs", article: null, starred: false, note: "ich tanze, ich tanzte, ich habe getanzt", level: "A1", example: "Wir tanzen heute Abend." },
  { id: 442, german: "telefonieren", english: "to telephone", category: "regular-verbs", article: null, starred: false, note: "ich telefoniere, ich telefonierte, ich habe telefoniert", level: "A1", example: "Ich telefoniere mit meiner Mutter." },
  { id: 443, german: "suchen", english: "to search", category: "regular-verbs", article: null, starred: false, note: "ich suche, ich suchte, ich habe gesucht", level: "A1", example: "Ich suche meine Tasche." },
  { id: 444, german: "putzen", english: "to clean", category: "regular-verbs", article: null, starred: false, note: "ich putze, ich putzte, ich habe geputzt", level: "A1", example: "Ich putze das Bad." },
  { id: 445, german: "bestellen", english: "to order", category: "regular-verbs", article: null, starred: false, note: "ich bestelle, ich bestellte, ich habe bestellt", level: "A2", example: "Ich bestelle eine Pizza." },
  { id: 446, german: "bezahlen", english: "to pay", category: "regular-verbs", article: null, starred: false, note: "ich bezahle, ich bezahlte, ich habe bezahlt", level: "A2", example: "Ich bezahle mit Karte." },
  { id: 700, german: "tun", english: "to do", category: "mixed-verbs", article: null, starred: false, note: "ich tue, ich tat, ich habe getan", level: "A2", example: "Was soll ich tun?", hooks: { domains: ["Work/Office", "Opinions/Arguments"], cognate: "none", frequency: "core", confusables: ["machen vs tun"] } },
  { id: 701, german: "stellen", english: "to put (upright)", category: "regular-verbs", article: null, starred: false, note: "ich stelle, ich stellte, ich habe gestellt", level: "A2", example: "Ich stelle die Flasche auf den Tisch.", hooks: { domains: ["Housing", "Work/Office"], cognate: "none", frequency: "booster", confusables: ["stehen vs stellen"] } },
  { id: 702, german: "setzen", english: "to set / seat", category: "regular-verbs", article: null, starred: false, note: "ich setze, ich setzte, ich habe gesetzt", level: "A2", example: "Ich setze mich auf den Stuhl.", hooks: { domains: ["Housing"], cognate: "none", frequency: "booster", confusables: ["sitzen vs setzen"] } },
  { id: 703, german: "legen", english: "to lay", category: "regular-verbs", article: null, starred: false, note: "ich lege, ich legte, ich habe gelegt", level: "A2", example: "Ich lege das Buch auf den Tisch.", hooks: { domains: ["Housing", "Work/Office"], cognate: "none", frequency: "booster", confusables: ["liegen vs legen"] } },
  { id: 704, german: "sitzen", english: "to sit", category: "irregular-verbs", article: null, starred: false, note: "ich sitze, ich saß, ich habe gesessen", level: "A2", example: "Ich sitze am Fenster.", hooks: { domains: ["Housing", "Work/Office"], cognate: "none", frequency: "core", confusables: ["sitzen vs setzen"] } },
  { id: 480, german: "arbeiten", english: "to work", category: "regular-verbs", article: null, starred: false, note: "ich arbeite, ich arbeitete, ich habe gearbeitet", level: "A1", example: "Ich arbeite im Büro.", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "core" } },
  { id: 481, german: "studieren", english: "to study", category: "regular-verbs", article: null, starred: false, note: "ich studiere, ich studierte, ich habe studiert", level: "A2", example: "Ich studiere Informatik.", hooks: { domains: ["University"], cognate: "direct", frequency: "core" } },
  { id: 482, german: "buchen", english: "to book", category: "regular-verbs", article: null, starred: false, note: "ich buche, ich buchte, ich habe gebucht", level: "A2", example: "Ich buche ein Hotel.", hooks: { domains: ["Travel"], cognate: "direct", frequency: "booster" } },
  { id: 483, german: "reservieren", english: "to reserve", category: "regular-verbs", article: null, starred: false, note: "ich reserviere, ich reservierte, ich habe reserviert", level: "B1", example: "Ich reserviere einen Tisch.", hooks: { domains: ["Travel", "Shopping/Food"], cognate: "direct", frequency: "booster" } },
  { id: 484, german: "anmelden", english: "to register", category: "separable-verbs", article: null, starred: false, note: "Ich melde mich an.", level: "B1", example: "Ich melde mich beim Kurs an.", hooks: { domains: ["Bureaucracy", "University"], cognate: "none", frequency: "specialist" } },
  { id: 485, german: "ausfüllen", english: "to fill out", category: "separable-verbs", article: null, starred: false, note: "Ich fülle das Formular aus.", level: "B1", example: "Bitte füllen Sie das Formular aus.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 486, german: "beantragen", english: "to apply for", category: "separable-verbs", article: null, starred: false, note: "Ich beantrage den Ausweis.", level: "B1", example: "Ich beantrage einen Termin.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 487, german: "erklären", english: "to explain", category: "regular-verbs", article: null, starred: false, note: "ich erkläre, ich erklärte, ich habe erklärt", level: "A2", example: "Ich erkläre die Aufgabe.", hooks: { domains: ["University", "Work/Office"], cognate: "none", frequency: "booster" } },
  { id: 488, german: "meinen", english: "to mean", category: "regular-verbs", article: null, starred: false, note: "ich meine, ich meinte, ich habe gemeint", level: "A2", example: "Was meinst du?", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 489, german: "glauben", english: "to believe", category: "regular-verbs", article: null, starred: false, note: "ich glaube, ich glaubte, ich habe geglaubt", level: "A2", example: "Ich glaube dir.", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster", confusables: ["denken vs glauben"] } },

  // Irregular Verbs (Strong)
  { id: 274, german: "sein", english: "to be", category: "irregular-verbs", article: null, starred: true, note: "ich bin, ich war, ich bin gewesen", level: "A1", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "core", confusables: ["werden vs sein"] } },
  { id: 275, german: "haben", english: "to have", category: "irregular-verbs", article: null, starred: true, note: "ich habe, ich hatte, ich habe gehabt", level: "A1", hooks: { domains: ["Shopping/Food", "Work/Office"], cognate: "none", frequency: "core" } },
  { id: 276, german: "werden", english: "to become", category: "irregular-verbs", article: null, starred: true, note: "ich werde, ich wurde, ich bin geworden", level: "A1", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "core", confusables: ["werden vs sein"] } },
  { id: 277, german: "gehen", english: "to go", category: "irregular-verbs", article: null, starred: true, note: "ich gehe, ich ging, ich bin gegangen", level: "A1" },
  { id: 278, german: "kommen", english: "to come", category: "irregular-verbs", article: null, starred: true, note: "ich komme, ich kam, ich bin gekommen", level: "A1" },
  { id: 279, german: "sehen", english: "to see", category: "irregular-verbs", article: null, starred: true, note: "ich sehe, ich sah, ich habe gesehen", level: "A1" },
  { id: 280, german: "geben", english: "to give", category: "irregular-verbs", article: null, starred: false, note: "ich gebe, ich gab, ich habe gegeben", level: "A2" },
  { id: 281, german: "nehmen", english: "to take", category: "irregular-verbs", article: null, starred: false, note: "ich nehme, ich nahm, ich habe genommen", level: "A2" },
  { id: 282, german: "sprechen", english: "to speak", category: "irregular-verbs", article: null, starred: false, note: "ich spreche, ich sprach, ich habe gesprochen", level: "A1" },
  { id: 283, german: "fahren", english: "to drive / ride", category: "irregular-verbs", article: null, starred: false, note: "ich fahre, ich fuhr, ich bin gefahren", level: "A1" },
  { id: 284, german: "essen", english: "to eat", category: "irregular-verbs", article: null, starred: false, note: "ich esse, ich aß, ich habe gegessen", level: "A1" },
  { id: 285, german: "trinken", english: "to drink", category: "irregular-verbs", article: null, starred: false, note: "ich trinke, ich trank, ich habe getrunken", level: "A1" },
  { id: 286, german: "lesen", english: "to read", category: "irregular-verbs", article: null, starred: false, note: "ich lese, ich las, ich habe gelesen", level: "A2" },
  { id: 287, german: "schreiben", english: "to write", category: "irregular-verbs", article: null, starred: false, note: "ich schreibe, ich schrieb, ich habe geschrieben", level: "A2" },
  { id: 288, german: "finden", english: "to find", category: "irregular-verbs", article: null, starred: false, note: "ich finde, ich fand, ich habe gefunden", level: "A2" },
  { id: 289, german: "stehen", english: "to stand", category: "irregular-verbs", article: null, starred: false, note: "ich stehe, ich stand, ich habe gestanden", level: "A2", hooks: { domains: ["Travel", "Housing"], cognate: "none", frequency: "core", confusables: ["stehen vs stellen", "sitzen vs setzen"] } },
  { id: 290, german: "liegen", english: "to lie", category: "irregular-verbs", article: null, starred: false, note: "ich liege, ich lag, ich habe gelegen", level: "A2", hooks: { domains: ["Housing", "Health"], cognate: "none", frequency: "core", confusables: ["liegen vs legen"] } },
  { id: 383, german: "fallen", english: "to fall", category: "irregular-verbs", article: null, starred: false, note: "ich falle, ich fiel, ich bin gefallen", level: "A2" },
  { id: 384, german: "ziehen", english: "to pull / move", category: "irregular-verbs", article: null, starred: false, note: "ich ziehe, ich zog, ich habe gezogen", level: "B1" },
  { id: 385, german: "halten", english: "to hold / stop", category: "irregular-verbs", article: null, starred: false, note: "ich halte, ich hielt, ich habe gehalten", level: "A2" },
  { id: 386, german: "laufen", english: "to run", category: "irregular-verbs", article: null, starred: false, note: "ich laufe, ich lief, ich bin gelaufen", level: "A2" },
  { id: 387, german: "fliegen", english: "to fly", category: "irregular-verbs", article: null, starred: false, note: "ich fliege, ich flog, ich bin geflogen", level: "A2" },
  { id: 388, german: "vergessen", english: "to forget", category: "irregular-verbs", article: null, starred: false, note: "ich vergesse, ich vergaß, ich habe vergessen", level: "A2" },
  { id: 389, german: "beginnen", english: "to begin", category: "irregular-verbs", article: null, starred: false, note: "ich beginne, ich begann, ich habe begonnen", level: "A2" },
  { id: 390, german: "bleiben", english: "to stay", category: "irregular-verbs", article: null, starred: false, note: "ich bleibe, ich blieb, ich bin geblieben", level: "A2" },
  { id: 391, german: "helfen", english: "to help", category: "irregular-verbs", article: null, starred: false, note: "ich helfe, ich half, ich habe geholfen", level: "A2" },
  { id: 392, german: "treffen", english: "to meet", category: "irregular-verbs", article: null, starred: false, note: "ich treffe, ich traf, ich habe getroffen", level: "A2" },
  { id: 448, german: "schlafen", english: "to sleep", category: "irregular-verbs", article: null, starred: false, note: "ich schlafe, ich schlief, ich habe geschlafen", level: "A1", example: "Ich schlafe acht Stunden." },
  { id: 449, german: "tragen", english: "to carry / wear", category: "irregular-verbs", article: null, starred: false, note: "ich trage, ich trug, ich habe getragen", level: "A2", example: "Ich trage eine Jacke." },
  { id: 450, german: "verlieren", english: "to lose", category: "irregular-verbs", article: null, starred: false, note: "ich verliere, ich verlor, ich habe verloren", level: "A2", example: "Ich verliere meinen Schlüssel." },
  { id: 291, german: "bringen", english: "to bring", category: "mixed-verbs", article: null, starred: false, note: "ich bringe, ich brachte, ich habe gebracht", level: "A2" },
  { id: 292, german: "denken", english: "to think", category: "mixed-verbs", article: null, starred: false, note: "ich denke, ich dachte, ich habe gedacht", level: "A2" },
  { id: 293, german: "wissen", english: "to know", category: "mixed-verbs", article: null, starred: false, note: "ich weiß, ich wusste, ich habe gewusst", level: "A2", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "core", confusables: ["kennen vs wissen"] } },
  { id: 294, german: "kennen", english: "to know (someone/place)", category: "mixed-verbs", article: null, starred: false, note: "ich kenne, ich kannte, ich habe gekannt", level: "A2", hooks: { domains: ["Relationships", "Travel"], cognate: "none", frequency: "core", confusables: ["kennen vs wissen"] } },
  { id: 295, german: "rennen", english: "to run", category: "mixed-verbs", article: null, starred: false, note: "ich renne, ich rannte, ich bin gerannt", level: "A2" },
  { id: 296, german: "brennen", english: "to burn", category: "mixed-verbs", article: null, starred: false, note: "ich brenne, ich brannte, ich habe gebrannt", level: "B1" },
  { id: 297, german: "nennen", english: "to name", category: "mixed-verbs", article: null, starred: false, note: "ich nenne, ich nannte, ich habe genannt", level: "A2" },
  { id: 298, german: "denken an + Akk", english: "to think about", category: "verbs", article: null, starred: false, note: "Ich denke an dich", level: "A2", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "core", confusables: ["denken vs glauben", "kennen vs wissen"] } },
  { id: 394, german: "schicken", english: "to send", category: "mixed-verbs", article: null, starred: false, note: "ich schicke, ich schickte, ich habe geschickt", level: "A2" },
  { id: 395, german: "verkaufen", english: "to sell", category: "mixed-verbs", article: null, starred: false, note: "ich verkaufe, ich verkaufte, ich habe verkauft", level: "A2" },
  { id: 397, german: "bitten", english: "to ask/request", category: "mixed-verbs", article: null, starred: false, note: "ich bitte, ich bat, ich habe gebeten", level: "A2" },
  { id: 398, german: "senden", english: "to send", category: "mixed-verbs", article: null, starred: false, note: "ich sende, ich sandte, ich habe gesendet", level: "B1" },
  { id: 399, german: "wenden", english: "to turn", category: "mixed-verbs", article: null, starred: false, note: "ich wende, ich wandte, ich habe gewendet", level: "B1" },
  { id: 500, german: "der Flughafen", english: "the airport", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Flughafen ist weit.", hooks: { domains: ["Travel"], cognate: "near", frequency: "booster" } },
  { id: 501, german: "der Reisepass", english: "the passport", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Ich brauche meinen Reisepass.", hooks: { domains: ["Travel", "Bureaucracy"], cognate: "near", frequency: "booster" } },
  { id: 502, german: "das Visum", english: "the visa", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Das Visum ist gültig.", hooks: { domains: ["Travel", "Bureaucracy"], cognate: "direct", frequency: "specialist" } },
  { id: 503, german: "das Gepäck", english: "the luggage", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Mein Gepäck ist schwer.", hooks: { domains: ["Travel"], cognate: "none", frequency: "booster" } },
  { id: 504, german: "die Reservierung", english: "the reservation", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Die Reservierung ist bestätigt.", hooks: { domains: ["Travel", "Shopping/Food"], cognate: "direct", frequency: "booster" } },
  { id: 505, german: "der Bahnsteig", english: "the platform", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Zug fährt am Bahnsteig 3 ab.", hooks: { domains: ["Travel"], cognate: "none", frequency: "booster" } },
  { id: 506, german: "die Verspätung", english: "the delay", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Der Zug hat Verspätung.", hooks: { domains: ["Travel", "Time & scheduling"], cognate: "none", frequency: "booster" } },
  { id: 507, german: "das Hotel", english: "the hotel", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Das Hotel ist teuer.", hooks: { domains: ["Travel"], cognate: "direct", frequency: "core" } },
  { id: 508, german: "die Quittung", english: "the receipt", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Ich brauche die Quittung.", hooks: { domains: ["Shopping/Food", "Work/Office"], cognate: "none", frequency: "specialist" } },
  { id: 509, german: "die Karte", english: "the map", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Die Karte ist hilfreich.", hooks: { domains: ["Travel"], cognate: "none", frequency: "core" } },
  { id: 510, german: "der Schalter", english: "the counter", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Schalter ist geschlossen.", hooks: { domains: ["Travel", "Bureaucracy"], cognate: "none", frequency: "booster" } },
  { id: 511, german: "der Reiseführer", english: "the guidebook", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Reiseführer ist neu.", hooks: { domains: ["Travel"], cognate: "none", frequency: "specialist" } },
  { id: 512, german: "die Grenze", english: "the border", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Wir fahren über die Grenze.", hooks: { domains: ["Travel", "Bureaucracy"], cognate: "none", frequency: "booster" } },
  { id: 513, german: "die Reise", english: "the trip", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Reise war schön.", hooks: { domains: ["Travel"], cognate: "none", frequency: "core" } },
  { id: 514, german: "der Urlaub", english: "the vacation", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Ich mache Urlaub.", hooks: { domains: ["Travel"], cognate: "none", frequency: "core" } },
  { id: 515, german: "das Reiseziel", english: "the destination", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Das Reiseziel ist bekannt.", hooks: { domains: ["Travel"], cognate: "none", frequency: "booster" } },
  { id: 516, german: "die Abfahrt", english: "the departure", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Abfahrt ist um neun.", hooks: { domains: ["Travel", "Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 517, german: "die Ankunft", english: "the arrival", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Ankunft ist verspätet.", hooks: { domains: ["Travel", "Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 518, german: "der Platz", english: "the seat/place", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", example: "Der Platz ist frei.", hooks: { domains: ["Travel", "Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 519, german: "das Gate", english: "the gate", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Das Gate ist A12.", hooks: { domains: ["Travel"], cognate: "direct", frequency: "booster" } },
  { id: 520, german: "das Meeting", english: "the meeting", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Meeting beginnt um zehn.", hooks: { domains: ["Work/Office"], cognate: "direct", frequency: "core" } },
  { id: 521, german: "die Besprechung", english: "the meeting", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "A2", example: "Die Besprechung ist kurz.", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "core" } },
  { id: 522, german: "die Deadline", english: "the deadline", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Deadline ist morgen.", hooks: { domains: ["Work/Office", "University"], cognate: "direct", frequency: "booster" } },
  { id: 523, german: "das Projekt", english: "the project", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Projekt ist wichtig.", hooks: { domains: ["Work/Office", "University"], cognate: "direct", frequency: "booster" } },
  { id: 524, german: "das Team", english: "the team", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Team ist groß.", hooks: { domains: ["Work/Office"], cognate: "direct", frequency: "core" } },
  { id: 525, german: "der Chef", english: "the boss", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", example: "Der Chef ist im Büro.", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "core" } },
  { id: 526, german: "die Kollegin", english: "the colleague (f)", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Die Kollegin hilft mir.", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "core" } },
  { id: 527, german: "der Kollege", english: "the colleague (m)", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", example: "Der Kollege arbeitet hier.", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "core" } },
  { id: 528, german: "das Gehalt", english: "the salary", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Das Gehalt ist gut.", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "booster" } },
  { id: 529, german: "der Bericht", english: "the report", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Bericht ist fertig.", hooks: { domains: ["Work/Office", "University"], cognate: "none", frequency: "booster" } },
  { id: 530, german: "die Präsentation", english: "the presentation", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Präsentation ist morgen.", hooks: { domains: ["Work/Office", "University"], cognate: "direct", frequency: "booster" } },
  { id: 531, german: "die Aufgabe", english: "the task", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Aufgabe ist schwer.", hooks: { domains: ["Work/Office", "University"], cognate: "none", frequency: "core" } },
  { id: 532, german: "die Schicht", english: "the shift", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Ich arbeite in der Nachtschicht.", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "booster" } },
  { id: 533, german: "der Drucker", english: "the printer", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Drucker funktioniert nicht.", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "booster" } },
  { id: 534, german: "die Abteilung", english: "the department", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Die Abteilung ist klein.", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "booster" } },
  { id: 535, german: "der Kunde", english: "the customer", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Kunde wartet.", hooks: { domains: ["Work/Office", "Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 537, german: "der Kurs", english: "the course", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Kurs beginnt im Oktober.", hooks: { domains: ["University"], cognate: "none", frequency: "core" } },
  { id: 538, german: "das Semester", english: "the semester", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Semester startet bald.", hooks: { domains: ["University"], cognate: "direct", frequency: "core" } },
  { id: 539, german: "der Campus", english: "the campus", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Campus ist groß.", hooks: { domains: ["University"], cognate: "direct", frequency: "booster" } },
  { id: 540, german: "die Forschung", english: "the research", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Forschung ist wichtig.", hooks: { domains: ["University"], cognate: "none", frequency: "booster" } },
  { id: 541, german: "die Thesis", english: "the thesis", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Thesis dauert lange.", hooks: { domains: ["University"], cognate: "direct", frequency: "booster" } },
  { id: 542, german: "das Thema", english: "the topic", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Thema ist interessant.", hooks: { domains: ["University", "Opinions/Arguments"], cognate: "near", frequency: "core" } },
  { id: 543, german: "das Tutorium", english: "the tutorial", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Das Tutorium ist am Mittwoch.", hooks: { domains: ["University"], cognate: "none", frequency: "booster" } },
  { id: 544, german: "die Lerngruppe", english: "the study group", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Lerngruppe trifft sich heute.", hooks: { domains: ["University"], cognate: "none", frequency: "booster" } },
  { id: 545, german: "das Zeugnis", english: "the transcript", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Das Zeugnis ist fertig.", hooks: { domains: ["University", "Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 546, german: "die Anmeldung", english: "the registration", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Die Anmeldung ist notwendig.", hooks: { domains: ["University", "Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 547, german: "die Medizin", english: "the medicine", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Ich brauche Medizin.", hooks: { domains: ["Health"], cognate: "direct", frequency: "booster" } },
  { id: 548, german: "das Rezept", english: "the prescription", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Der Arzt gibt ein Rezept.", hooks: { domains: ["Health"], cognate: "none", frequency: "booster" } },
  { id: 549, german: "die Schmerzen", english: "the pain", category: "nouns", article: "die", starred: false, note: "Plural", level: "A2", example: "Ich habe starke Schmerzen.", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 550, german: "das Fieber", english: "the fever", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Ich habe Fieber.", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 551, german: "der Husten", english: "the cough", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Husten ist schlimm.", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 552, german: "die Erkältung", english: "the cold", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "A2", example: "Ich habe eine Erkältung.", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 553, german: "der Zahnarzt", english: "the dentist", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Ich gehe zum Zahnarzt.", hooks: { domains: ["Health"], cognate: "none", frequency: "booster" } },
  { id: 554, german: "der Notfall", english: "the emergency", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Das ist ein Notfall.", hooks: { domains: ["Health"], cognate: "none", frequency: "booster" } },
  { id: 555, german: "das Symptom", english: "the symptom", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Das Symptom ist neu.", hooks: { domains: ["Health"], cognate: "direct", frequency: "booster" } },
  { id: 556, german: "die Allergie", english: "the allergy", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Ich habe eine Allergie.", hooks: { domains: ["Health"], cognate: "direct", frequency: "booster" } },
  { id: 557, german: "das Blut", english: "the blood", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Das Blut ist rot.", hooks: { domains: ["Health"], cognate: "none", frequency: "booster" } },
  { id: 558, german: "die Kopfschmerzen", english: "the headache", category: "nouns", article: "die", starred: false, note: "Plural", level: "A2", example: "Ich habe Kopfschmerzen.", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 559, german: "der Magen", english: "the stomach", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Mein Magen tut weh.", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 560, german: "der Rücken", english: "the back", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Mein Rücken tut weh.", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 561, german: "das Date", english: "the date", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Das Date ist heute Abend.", hooks: { domains: ["Relationships"], cognate: "direct", frequency: "booster" } },
  { id: 562, german: "der Mitbewohner", english: "the roommate", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Mitbewohner kocht gern.", hooks: { domains: ["Housing", "Relationships"], cognate: "none", frequency: "booster" } },
  { id: 563, german: "die Mitbewohnerin", english: "the roommate (f)", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Mitbewohnerin lernt viel.", hooks: { domains: ["Housing", "Relationships"], cognate: "none", frequency: "booster" } },
  { id: 564, german: "der Freund", english: "the boyfriend", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Mein Freund ist hier.", hooks: { domains: ["Relationships"], cognate: "none", frequency: "core" } },
  { id: 565, german: "die Freundin", english: "the girlfriend", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Meine Freundin kommt.", hooks: { domains: ["Relationships"], cognate: "none", frequency: "core" } },
  { id: 566, german: "die Hochzeit", english: "the wedding", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Hochzeit ist im Mai.", hooks: { domains: ["Relationships"], cognate: "none", frequency: "booster" } },
  { id: 567, german: "die Scheidung", english: "the divorce", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Die Scheidung ist schwierig.", hooks: { domains: ["Relationships", "Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 568, german: "das Vertrauen", english: "the trust", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Vertrauen ist wichtig.", hooks: { domains: ["Relationships"], cognate: "none", frequency: "booster" } },
  { id: 569, german: "der Streit", english: "the argument", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Streit war laut.", hooks: { domains: ["Opinions/Arguments", "Relationships"], cognate: "none", frequency: "booster" } },
  { id: 570, german: "die Unterstützung", english: "the support", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Ich brauche Unterstützung.", hooks: { domains: ["Relationships", "Work/Office"], cognate: "none", frequency: "booster" } },
  { id: 571, german: "der Respekt", english: "the respect", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Respekt ist wichtig.", hooks: { domains: ["Relationships"], cognate: "direct", frequency: "booster" } },
  { id: 572, german: "die Liebe", english: "the love", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Liebe ist schön.", hooks: { domains: ["Relationships"], cognate: "none", frequency: "core" } },
  { id: 573, german: "der Mietvertrag", english: "the lease", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Mietvertrag ist unterschrieben.", hooks: { domains: ["Housing", "Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 574, german: "die Kaution", english: "the deposit", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Kaution ist hoch.", hooks: { domains: ["Housing", "Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 575, german: "das Wohnzimmer", english: "the living room", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Das Wohnzimmer ist hell.", hooks: { domains: ["Housing"], cognate: "none", frequency: "core" } },
  { id: 576, german: "die Heizung", english: "the heating", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "A2", example: "Die Heizung ist aus.", hooks: { domains: ["Housing"], cognate: "none", frequency: "booster" } },
  { id: 577, german: "der Strom", english: "the electricity", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Strom ist weg.", hooks: { domains: ["Housing"], cognate: "none", frequency: "booster" } },
  { id: 579, german: "der Müll", english: "the garbage", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Müll muss raus.", hooks: { domains: ["Housing"], cognate: "none", frequency: "core" } },
  { id: 580, german: "das Amt", english: "the public office", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Ich gehe zum Amt.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 581, german: "das Formular", english: "the form", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Ich fülle das Formular aus.", hooks: { domains: ["Bureaucracy"], cognate: "direct", frequency: "specialist" } },
  { id: 582, german: "der Antrag", english: "the application", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Antrag ist fertig.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 584, german: "die Steuer", english: "the tax", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Steuer ist hoch.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 585, german: "die Versicherung", english: "the insurance", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Versicherung zahlt.", hooks: { domains: ["Bureaucracy", "Health"], cognate: "direct", frequency: "specialist" } },
  { id: 586, german: "die Genehmigung", english: "the permit", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Die Genehmigung fehlt.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 587, german: "die Aufenthaltserlaubnis", english: "the residence permit", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Aufenthaltserlaubnis ist gültig.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 588, german: "die Unterlagen", english: "the documents", category: "nouns", article: "die", starred: false, note: "Plural", level: "B1", example: "Die Unterlagen fehlen.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 589, german: "die Bescheinigung", english: "the certificate", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Ich brauche eine Bescheinigung.", hooks: { domains: ["Bureaucracy", "Work/Office"], cognate: "none", frequency: "specialist" } },
  { id: 590, german: "die Unterschrift", english: "the signature", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Hier ist meine Unterschrift.", hooks: { domains: ["Bureaucracy", "Work/Office"], cognate: "none", frequency: "specialist" } },
  { id: 593, german: "der Einkaufswagen", english: "the shopping cart", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Einkaufswagen ist voll.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "booster" } },
  { id: 594, german: "der Korb", english: "the basket", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A1", example: "Der Korb ist leer.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 595, german: "das Regal", english: "the shelf", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Regal ist voll.", hooks: { domains: ["Shopping/Food", "Housing"], cognate: "none", frequency: "booster" } },
  { id: 596, german: "die Speisekarte", english: "the menu", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Speisekarte ist hier.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 597, german: "das Gericht", english: "the dish", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Gericht ist lecker.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 598, german: "die Zutaten", english: "the ingredients", category: "nouns", article: "die", starred: false, note: "Plural", level: "B1", example: "Die Zutaten sind frisch.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "booster" } },
  { id: 599, german: "das Fleisch", english: "the meat", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Fleisch ist teuer.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 600, german: "der Fisch", english: "the fish", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Fisch ist frisch.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 601, german: "das Getränk", english: "the drink", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Das Getränk ist kalt.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 603, german: "der Kalender", english: "the calendar", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Kalender ist voll.", hooks: { domains: ["Time & scheduling"], cognate: "near", frequency: "core" } },
  { id: 604, german: "die Pause", english: "the break", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Wir machen eine Pause.", hooks: { domains: ["Time & scheduling", "Work/Office"], cognate: "none", frequency: "core" } },
  { id: 606, german: "das Heute", english: "today", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Heute ist ein guter Tag.", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 607, german: "das Morgen", english: "tomorrow", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Morgen habe ich Zeit.", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 608, german: "das Gestern", english: "yesterday", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Gestern war es kalt.", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 610, german: "das Argument", english: "the argument", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Das Argument ist stark.", hooks: { domains: ["Opinions/Arguments"], cognate: "direct", frequency: "booster" } },
  { id: 611, german: "der Grund", english: "the reason", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Grund ist klar.", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "core" } },
  { id: 612, german: "der Beweis", english: "the evidence", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Beweis ist wichtig.", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 613, german: "die Diskussion", english: "the discussion", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Diskussion war lang.", hooks: { domains: ["Opinions/Arguments", "Work/Office"], cognate: "direct", frequency: "booster" } },
  { id: 614, german: "zustimmen", english: "to agree", category: "regular-verbs", article: null, starred: false, note: "ich stimme zu, ich stimmte zu, ich habe zugestimmt", level: "B1", example: "Ich stimme dir zu.", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster", confusables: ["weil vs denn"] } },
  { id: 615, german: "widersprechen", english: "to disagree", category: "irregular-verbs", article: null, starred: false, note: "ich widerspreche, ich widersprach, ich habe widersprochen", level: "B1", example: "Ich widerspreche dir.", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 617, german: "beweisen", english: "to prove", category: "irregular-verbs", article: null, starred: false, note: "ich beweise, ich bewies, ich habe bewiesen", level: "B1", example: "Er beweist seine These.", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 618, german: "überzeugen", english: "to convince", category: "regular-verbs", article: null, starred: false, note: "ich überzeuge, ich überzeugte, ich habe überzeugt", level: "B1", example: "Die Idee überzeugt mich.", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 619, german: "weil", english: "because", category: "connectors", article: null, starred: true, note: "Type 1 - verb goes to END", level: "A2", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "core", confusables: ["weil vs denn"] } },
  { id: 620, german: "der Fahrplan", english: "the schedule", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Fahrplan hängt hier.", hooks: { domains: ["Travel", "Time & scheduling"], cognate: "none", frequency: "booster" } },
  { id: 621, german: "die Unterkunft", english: "the accommodation", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Unterkunft ist günstig.", hooks: { domains: ["Travel"], cognate: "none", frequency: "booster" } },
  { id: 622, german: "der Koffer", english: "the suitcase", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Koffer ist schwer.", hooks: { domains: ["Travel"], cognate: "none", frequency: "booster" } },
  { id: 623, german: "die Reiseversicherung", english: "the travel insurance", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Reiseversicherung ist wichtig.", hooks: { domains: ["Travel", "Bureaucracy"], cognate: "direct", frequency: "specialist" } },
  { id: 624, german: "der Reisende", english: "the traveler", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Reisende wartet.", hooks: { domains: ["Travel"], cognate: "none", frequency: "booster" } },
  { id: 625, german: "der Stadtplan", english: "the city map", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Stadtplan ist neu.", hooks: { domains: ["Travel"], cognate: "none", frequency: "booster" } },
  { id: 626, german: "das Zentrum", english: "the center", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Zentrum ist nah.", hooks: { domains: ["Travel"], cognate: "direct", frequency: "core" } },
  { id: 627, german: "die Haltestelle", english: "the stop", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Haltestelle ist hier.", hooks: { domains: ["Travel"], cognate: "none", frequency: "core" } },
  { id: 628, german: "die Firma", english: "the company", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Firma wächst.", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "core" } },
  { id: 629, german: "der Arbeitsplatz", english: "the workplace", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Arbeitsplatz ist ruhig.", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "core" } },
  { id: 630, german: "die Bewerbung", english: "the application", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Die Bewerbung ist fertig.", hooks: { domains: ["Work/Office", "Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 631, german: "der Lebenslauf", english: "the CV", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Lebenslauf ist aktuell.", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "specialist" } },
  { id: 632, german: "das Praktikum", english: "the internship", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Das Praktikum dauert drei Monate.", hooks: { domains: ["Work/Office", "University"], cognate: "direct", frequency: "booster" } },
  { id: 633, german: "die Abgabe", english: "the submission", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Abgabe ist heute.", hooks: { domains: ["Work/Office", "University"], cognate: "none", frequency: "booster" } },
  { id: 634, german: "die Rückmeldung", english: "the feedback", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Rückmeldung ist hilfreich.", hooks: { domains: ["Work/Office", "University"], cognate: "none", frequency: "booster" } },
  { id: 635, german: "das Protokoll", english: "the minutes", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Das Protokoll ist fertig.", hooks: { domains: ["Work/Office"], cognate: "direct", frequency: "booster" } },
  { id: 636, german: "die Verantwortung", english: "the responsibility", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Ich trage die Verantwortung.", hooks: { domains: ["Work/Office"], cognate: "none", frequency: "booster" } },
  { id: 637, german: "die Hausarbeit", english: "the term paper", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Hausarbeit ist lang.", hooks: { domains: ["University"], cognate: "none", frequency: "booster" } },
  { id: 638, german: "der Dozent", english: "the lecturer", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Dozent erklärt viel.", hooks: { domains: ["University"], cognate: "none", frequency: "booster" } },
  { id: 639, german: "die Fakultät", english: "the faculty", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Fakultät ist groß.", hooks: { domains: ["University"], cognate: "direct", frequency: "booster" } },
  { id: 640, german: "die Vorlesungszeit", english: "the lecture time", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Vorlesungszeit beginnt um acht.", hooks: { domains: ["University", "Time & scheduling"], cognate: "none", frequency: "booster" } },
  { id: 641, german: "die Bibliothekskarte", english: "the library card", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Ich brauche eine Bibliothekskarte.", hooks: { domains: ["University"], cognate: "none", frequency: "booster" } },
  { id: 642, german: "die Tablette", english: "the tablet", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Ich nehme eine Tablette.", hooks: { domains: ["Health"], cognate: "near", frequency: "core" } },
  { id: 643, german: "die Praxis", english: "the clinic", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Praxis ist geschlossen.", hooks: { domains: ["Health"], cognate: "direct", frequency: "booster" } },
  { id: 644, german: "der Patient", english: "the patient", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Patient wartet.", hooks: { domains: ["Health"], cognate: "direct", frequency: "core" } },
  { id: 645, german: "die Krankenkasse", english: "the health insurance fund", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Krankenkasse zahlt.", hooks: { domains: ["Health", "Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 646, german: "die Behandlung", english: "the treatment", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Behandlung dauert lange.", hooks: { domains: ["Health"], cognate: "none", frequency: "booster" } },
  { id: 647, german: "die Sprechstunde", english: "the office hours", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Sprechstunde ist am Montag.", hooks: { domains: ["Health", "University"], cognate: "none", frequency: "booster" } },
  { id: 648, german: "die Verletzung", english: "the injury", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Die Verletzung ist klein.", hooks: { domains: ["Health"], cognate: "none", frequency: "booster" } },
  { id: 649, german: "die Übung", english: "the exercise", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Übung ist schwer.", hooks: { domains: ["University", "Health"], cognate: "none", frequency: "core" } },
  { id: 650, german: "die Freundschaft", english: "the friendship", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Freundschaft ist stark.", hooks: { domains: ["Relationships"], cognate: "none", frequency: "core" } },
  { id: 651, german: "die Einladung", english: "the invitation", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "A2", example: "Die Einladung ist nett.", hooks: { domains: ["Relationships"], cognate: "none", frequency: "booster" } },
  { id: 652, german: "das Treffen", english: "the meeting", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Treffen ist morgen.", hooks: { domains: ["Relationships", "Work/Office"], cognate: "none", frequency: "core" } },
  { id: 653, german: "das Gefühl", english: "the feeling", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Gefühl ist gut.", hooks: { domains: ["Relationships", "Opinions/Arguments"], cognate: "none", frequency: "core" } },
  { id: 654, german: "die WG", english: "the shared flat", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die WG ist günstig.", hooks: { domains: ["Housing"], cognate: "none", frequency: "booster" } },
  { id: 655, german: "der Balkon", english: "the balcony", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Balkon ist klein.", hooks: { domains: ["Housing"], cognate: "direct", frequency: "booster" } },
  { id: 656, german: "der Keller", english: "the basement", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Keller ist dunkel.", hooks: { domains: ["Housing"], cognate: "none", frequency: "booster" } },
  { id: 657, german: "der Aufzug", english: "the elevator", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Aufzug ist kaputt.", hooks: { domains: ["Housing"], cognate: "none", frequency: "booster" } },
  { id: 658, german: "die Nachbarschaft", english: "the neighborhood", category: "nouns", article: "die", starred: false, note: "-schaft feminine", level: "B1", example: "Die Nachbarschaft ist ruhig.", hooks: { domains: ["Housing", "Relationships"], cognate: "none", frequency: "booster" } },
  { id: 659, german: "die Behörde", english: "the authority", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Behörde ist geschlossen.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 660, german: "der Beamte", english: "the civil servant", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Beamte hilft uns.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 661, german: "die Wartezeit", english: "the waiting time", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Wartezeit ist lang.", hooks: { domains: ["Bureaucracy", "Health"], cognate: "none", frequency: "booster" } },
  { id: 662, german: "die Gebühr", english: "the fee", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Gebühr ist hoch.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 663, german: "die Akte", english: "the file", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Akte ist vollständig.", hooks: { domains: ["Bureaucracy", "Work/Office"], cognate: "none", frequency: "specialist" } },
  { id: 664, german: "der Stempel", english: "the stamp", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Stempel fehlt.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 665, german: "das Bürgeramt", english: "the citizens' office", category: "nouns", article: "das", starred: false, note: "Neuter", level: "B1", example: "Ich gehe zum Bürgeramt.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 666, german: "die Meldebescheinigung", english: "the registration certificate", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Die Meldebescheinigung ist da.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 667, german: "der Personalausweis", english: "the ID card", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Mein Personalausweis ist gültig.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 668, german: "die Steuererklärung", english: "the tax return", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Die Steuererklärung ist fällig.", hooks: { domains: ["Bureaucracy"], cognate: "none", frequency: "specialist" } },
  { id: 669, german: "die Kündigung", english: "the cancellation/termination", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Die Kündigung ist eingereicht.", hooks: { domains: ["Bureaucracy", "Housing"], cognate: "none", frequency: "specialist" } },
  { id: 670, german: "das Geschäft", english: "the shop", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A1", example: "Das Geschäft ist offen.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 671, german: "der Rabatt", english: "the discount", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Rabatt ist hoch.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "booster" } },
  { id: 672, german: "die Öffnungszeiten", english: "the opening hours", category: "nouns", article: "die", starred: false, note: "Plural", level: "A2", example: "Die Öffnungszeiten stehen an der Tür.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "booster" } },
  { id: 673, german: "die Auswahl", english: "the selection", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Auswahl ist groß.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "booster" } },
  { id: 674, german: "die Portion", english: "the portion", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Portion ist klein.", hooks: { domains: ["Shopping/Food"], cognate: "direct", frequency: "booster" } },
  { id: 675, german: "der Geschmack", english: "the taste", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Geschmack ist gut.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 676, german: "der Einkauf", english: "the shopping", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Einkauf ist erledigt.", hooks: { domains: ["Shopping/Food"], cognate: "none", frequency: "core" } },
  { id: 677, german: "die Schlange", english: "the queue", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Schlange ist lang.", hooks: { domains: ["Shopping/Food", "Bureaucracy"], cognate: "none", frequency: "booster" } },
  { id: 678, german: "der Lieferservice", english: "the delivery service", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Lieferservice kommt spät.", hooks: { domains: ["Shopping/Food"], cognate: "direct", frequency: "booster" } },
  { id: 679, german: "die Uhrzeit", english: "the time", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Welche Uhrzeit ist es?", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 680, german: "die Minute", english: "the minute", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Eine Minute, bitte.", hooks: { domains: ["Time & scheduling"], cognate: "direct", frequency: "core" } },
  { id: 681, german: "die Stunde", english: "the hour", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A1", example: "Ich warte eine Stunde.", hooks: { domains: ["Time & scheduling"], cognate: "none", frequency: "core" } },
  { id: 682, german: "der Zeitplan", english: "the timetable", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Zeitplan ist voll.", hooks: { domains: ["Time & scheduling", "Work/Office"], cognate: "none", frequency: "booster" } },
  { id: 683, german: "die Frist", english: "the deadline", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Frist endet morgen.", hooks: { domains: ["Time & scheduling", "Work/Office"], cognate: "none", frequency: "booster" } },
  { id: 684, german: "die Aussage", english: "the statement", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Aussage ist klar.", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 685, german: "der Standpunkt", english: "the viewpoint", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Das ist mein Standpunkt.", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 686, german: "die Behauptung", english: "the claim", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Die Behauptung ist falsch.", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 687, german: "die Zustimmung", english: "the agreement", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Ich gebe meine Zustimmung.", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 688, german: "der Widerspruch", english: "the objection", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Es gibt Widerspruch.", hooks: { domains: ["Opinions/Arguments"], cognate: "none", frequency: "booster" } },
  { id: 689, german: "das Ergebnis", english: "the result", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Ergebnis ist gut.", hooks: { domains: ["Opinions/Arguments", "University"], cognate: "none", frequency: "booster" } },
  { id: 690, german: "die Erfahrung", english: "the experience", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Ich habe viel Erfahrung.", hooks: { domains: ["Work/Office", "Relationships"], cognate: "none", frequency: "booster" } },
  { id: 691, german: "das Ziel", english: "the goal", category: "nouns", article: "das", starred: false, note: "Neuter", level: "A2", example: "Das Ziel ist klar.", hooks: { domains: ["Opinions/Arguments", "Work/Office"], cognate: "none", frequency: "core" } },
  { id: 692, german: "der Plan", english: "the plan", category: "nouns", article: "der", starred: false, note: "Masculine", level: "A2", example: "Der Plan ist gut.", hooks: { domains: ["Work/Office", "Travel"], cognate: "none", frequency: "core" } },
  { id: 693, german: "die Fahrt", english: "the ride", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Fahrt dauert zwei Stunden.", hooks: { domains: ["Travel"], cognate: "none", frequency: "core" } },
  { id: 694, german: "die Richtung", english: "the direction", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Welche Richtung ist richtig?", hooks: { domains: ["Travel"], cognate: "none", frequency: "core" } },
  { id: 695, german: "der Umzug", english: "the move", category: "nouns", article: "der", starred: false, note: "Masculine", level: "B1", example: "Der Umzug ist nächste Woche.", hooks: { domains: ["Housing"], cognate: "none", frequency: "booster" } },
  { id: 696, german: "die Möbel", english: "the furniture", category: "nouns", article: "die", starred: false, note: "Plural", level: "A2", example: "Die Möbel sind neu.", hooks: { domains: ["Housing"], cognate: "none", frequency: "booster" } },
  { id: 697, german: "die Reparatur", english: "the repair", category: "nouns", article: "die", starred: false, note: "Feminine", level: "B1", example: "Die Reparatur dauert lange.", hooks: { domains: ["Housing", "Work/Office"], cognate: "near", frequency: "booster" } },
  { id: 698, german: "die Gesundheit", english: "the health", category: "nouns", article: "die", starred: false, note: "Feminine", level: "A2", example: "Die Gesundheit ist wichtig.", hooks: { domains: ["Health"], cognate: "none", frequency: "core" } },
  { id: 699, german: "die Beratung", english: "the consultation", category: "nouns", article: "die", starred: false, note: "-ung feminine", level: "B1", example: "Die Beratung ist kostenlos.", hooks: { domains: ["Bureaucracy", "Work/Office", "Health"], cognate: "none", frequency: "booster" } },
]

const lessonByCategory: Record<string, string> = {
  pronouns: "personal-pronouns",
  possessives: "possessive-articles",
  prepositions: "prepositions-by-case",
  connectors: "connectors-verb-position",
  "question-words": "question-words",
  "modal-verbs": "modal-verbs",
  "reflexive-verbs": "reflexive-verbs",
  "separable-verbs": "separable-verbs",
  nouns: "articles-gender",
  verbs: "verbs-with-prep",
  "regular-verbs": "modal-verbs",
  "irregular-verbs": "modal-verbs",
  "mixed-verbs": "modal-verbs",
}

const partOfSpeechByCategory: Record<string, string> = {
  pronouns: "Pronoun",
  possessives: "Possessive",
  prepositions: "Preposition",
  connectors: "Connector",
  "question-words": "Question",
  "modal-verbs": "Verb",
  "reflexive-verbs": "Verb",
  "separable-verbs": "Verb",
  nouns: "Noun",
  verbs: "Verb",
  "regular-verbs": "Verb",
  "irregular-verbs": "Verb",
  "mixed-verbs": "Verb",
}

const levelByCategory: Record<string, WordLevel> = {
  pronouns: "A1",
  possessives: "A1",
  prepositions: "A1",
  connectors: "A2",
  "question-words": "A1",
  "modal-verbs": "A2",
  "reflexive-verbs": "A2",
  "separable-verbs": "A2",
  nouns: "A1",
  verbs: "A2",
  "regular-verbs": "A2",
  "irregular-verbs": "A2",
  "mixed-verbs": "A2",
}

type WordStatus = "new" | "again" | "learning" | "easy" | "starred"

const extractGermanExample = (note?: string) => {
  if (!note) return null
  const candidate = note.includes(":")
    ? note.split(":").slice(1).join(":").trim()
    : note.trim()
  const withoutTranslation = candidate.replace(/\s*\([^)]*\)\s*$/, "").trim()
  const hasGermanPronoun = /\b(Ich|Du|Er|Sie|Es|Wir|Ihr|Sie)\b/.test(withoutTranslation)
  const hasGermanChars = /[äöüß]/i.test(withoutTranslation)
  if (!withoutTranslation || (!hasGermanPronoun && !hasGermanChars)) {
    return null
  }
  return withoutTranslation
}

interface VocabTabProps {
  selectedLesson?: string
  onLessonChange?: (lessonId: string) => void
}

export function VocabTab({ selectedLesson, onLessonChange }: VocabTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [localLesson, setLocalLesson] = useState("all")
  const [speakingKey, setSpeakingKey] = useState<string | null>(null)
  const [speechSupported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window)
  const [germanVoice, setGermanVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [voiceWarning, setVoiceWarning] = useState(false)
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | WordStatus>("all")
  const [levelFilter, setLevelFilter] = useState<"all" | WordLevel>("all")
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [cognateFilter, setCognateFilter] = useState<"all" | CognateTag>("all")
  const [frequencyFilter, setFrequencyFilter] = useState<"all" | FrequencyTag>("all")
  const [confusableFilter, setConfusableFilter] = useState("all")
  const [statusById, setStatusById] = useState<Record<number, WordStatus>>(() => {
    if (typeof window === "undefined") return {}
    try {
      const storedStatus = window.localStorage.getItem("vocabStatus")
      if (storedStatus) {
        return JSON.parse(storedStatus) as Record<number, WordStatus>
      }
    } catch (error) {
      console.error("Failed to read vocab status", error)
    }
    return {}
  })
  const [listMaxHeight, setListMaxHeight] = useState<number | null>(null)
  const [starredWords, setStarredWords] = useState<number[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const storedStars = window.localStorage.getItem("vocabStars")
      if (storedStars) {
        const parsedStars = JSON.parse(storedStars)
        if (Array.isArray(parsedStars)) {
          return parsedStars as number[]
        }
      }
    } catch (error) {
      console.error("Failed to read vocab stars", error)
    }
    return []
  })
  const filtersRef = useRef<HTMLDivElement | null>(null)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 1023px)").matches : false
  )
  const [detailsOpen, setDetailsOpen] = useState(false)
  const hasLoadedProgressRef = useRef(false)
  const { status: authStatus, data: session } = useSession()

  const lessonValue = selectedLesson ?? localLesson
  const handleLessonValueChange = onLessonChange ?? setLocalLesson

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    const pickGermanVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length === 0) return
      const match =
        voices.find(voice => voice.lang?.toLowerCase().startsWith("de-")) ??
        voices.find(voice => voice.lang?.toLowerCase().startsWith("de")) ??
        voices.find(voice => voice.name?.toLowerCase().includes("german")) ??
        voices.find(voice => voice.name?.toLowerCase().includes("deutsch")) ??
        null
      setGermanVoice(match)
      setVoiceWarning(!match)
    }
    pickGermanVoice()
    const handler = () => pickGermanVoice()
    window.speechSynthesis.addEventListener("voiceschanged", handler)
    window.speechSynthesis.onvoiceschanged = handler
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handler)
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const mediaQuery = window.matchMedia("(max-width: 1023px)")
    const updateMobile = () => setIsMobile(mediaQuery.matches)
    mediaQuery.addEventListener("change", updateMobile)
    return () => mediaQuery.removeEventListener("change", updateMobile)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const element = filtersRef.current
    if (!element || typeof ResizeObserver === "undefined") return
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (!event.matches) {
        setListMaxHeight(null)
      }
    }
    if (!mediaQuery.matches) {
      requestAnimationFrame(() => setListMaxHeight(null))
      return
    }
    const updateHeight = (height: number) => {
      setListMaxHeight(Math.max(0, Math.round(height)))
    }
    requestAnimationFrame(() => updateHeight(element.getBoundingClientRect().height))
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        updateHeight(entry.contentRect.height)
      }
    })
    observer.observe(element)
    mediaQuery.addEventListener("change", handleMediaChange)
    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener("change", handleMediaChange)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (authStatus === "authenticated") {
      const fetchProgress = async () => {
        try {
          const response = await fetch("/api/vocab/progress")
          if (!response.ok) return
          const data = await response.json()
          const nextStatus: Record<number, WordStatus> = {}
          const nextStarred: number[] = []
          data.entries.forEach((entry: { wordId: number; status: WordStatus; starred: boolean }) => {
            if (entry.status && entry.status !== "new") {
              nextStatus[entry.wordId] = entry.status
            }
            if (entry.starred) {
              nextStarred.push(entry.wordId)
            }
          })
          setStatusById(nextStatus)
          setStarredWords(nextStarred)
          hasLoadedProgressRef.current = true
        } catch (error) {
          console.error("Failed to load vocab progress", error)
        }
      }
      fetchProgress()
      return
    }
    hasLoadedProgressRef.current = true
  }, [authStatus, session?.user?.email])

  useEffect(() => {
    if (typeof window === "undefined" || !hasLoadedProgressRef.current) return
    if (authStatus !== "authenticated") {
      try {
        window.localStorage.setItem("vocabStatus", JSON.stringify(statusById))
        window.localStorage.setItem("vocabStars", JSON.stringify(starredWords))
      } catch (error) {
        console.error("Failed to save vocab data", error)
      }
      return
    }
    const payload = {
      entries: vocabulary
        .filter(word => starredWords.includes(word.id) || (statusById[word.id] && statusById[word.id] !== "new"))
        .map(word => ({
          wordId: word.id,
          status: statusById[word.id] ?? "new",
          starred: starredWords.includes(word.id),
        })),
    }
    const timeout = window.setTimeout(async () => {
      try {
        await fetch("/api/vocab/progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } catch (error) {
        console.error("Failed to save vocab progress", error)
      }
    }, 600)
    return () => window.clearTimeout(timeout)
  }, [statusById, starredWords, authStatus])

  const toggleStar = (id: number) => {
    setStarredWords(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setActiveCategory("all")
    setStatusFilter("all")
    setLevelFilter("all")
    setSelectedDomains([])
    setCognateFilter("all")
    setFrequencyFilter("all")
    setConfusableFilter("all")
    handleLessonValueChange("all")
  }

  const confirmClear = (label: string) => {
    if (typeof window === "undefined") return true
    return window.confirm(`Clear all ${label}? This cannot be undone.`)
  }

  const clearStarred = () => {
    if (!confirmClear("starred words")) return
    setStarredWords([])
  }

  const clearStatus = (target: WordStatus) => {
    if (target === "starred") {
      clearStarred()
      return
    }
    if (!confirmClear(`${target} words`)) return
    setStatusById((prev) => {
      const updated = { ...prev }
      Object.keys(updated).forEach((key) => {
        if (updated[Number(key)] === target) {
          delete updated[Number(key)]
        }
      })
      return updated
    })
  }

  const setStatus = (id: number, status: WordStatus) => {
    setStatusById(prev => ({
      ...prev,
      [id]: prev[id] === status ? "new" : status,
    }))
  }

  const getStatusLabel = (status: WordStatus) => {
    switch (status) {
      case "again":
        return "Learn again"
      case "learning":
        return "Learning"
      case "easy":
        return "Easy"
      default:
        return "New"
    }
  }

  const getStatusStyles = (status: WordStatus) => {
    switch (status) {
      case "again":
        return "bg-rose-100 text-rose-700"
      case "learning":
        return "bg-amber-100 text-amber-700"
      case "easy":
        return "bg-emerald-100 text-emerald-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  const getSpeechText = (word: (typeof vocabulary)[number]) => {
    return extractGermanExample(word.note) ?? word.german
  }

  const getExample = (word: (typeof vocabulary)[number]) => {
    return word.example ?? extractGermanExample(word.note)
  }

  const getHooksForWord = (word: (typeof vocabulary)[number]) => {
    if (word.hooks) return word.hooks
    const level = word.level ?? levelByCategory[word.category] ?? "None"
    return {
      domains: defaultDomainsByCategory[word.category] ?? ["Opinions/Arguments"],
      cognate: "none",
      frequency: defaultFrequencyByLevel[level],
    } as LearningHooks
  }

  const filteredVocab = vocabulary.filter((word) => {
    const partOfSpeech = partOfSpeechByCategory[word.category] ?? "Other"
    const level = word.level ?? levelByCategory[word.category] ?? "None"
    const status = statusById[word.id] ?? "new"
    const hooks = getHooksForWord(word)
    const matchesSearch =
      word.german.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.note?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "all" || word.category === activeCategory
    const lessonMatch = lessonValue === "all" || lessonByCategory[word.category] === lessonValue
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "starred" ? starredWords.includes(word.id) : status === statusFilter)
    const levelMatch = levelFilter === "all" || level === levelFilter
    const domainsMatch =
      selectedDomains.length === 0 ||
      (hooks?.domains?.some(domain => selectedDomains.includes(domain)) ?? false)
    const cognateMatch =
      cognateFilter === "all" || hooks.cognate === cognateFilter
    const frequencyMatch =
      frequencyFilter === "all" || hooks.frequency === frequencyFilter
    const confusableMatch =
      confusableFilter === "all" || (hooks.confusables ?? []).includes(confusableFilter)
    return (
      matchesSearch &&
      matchesCategory &&
      lessonMatch &&
      statusMatch &&
      levelMatch &&
      domainsMatch &&
      cognateMatch &&
      frequencyMatch &&
      confusableMatch
    )
  })

  const selectedWordIdForRender = useMemo(() => {
    if (filteredVocab.length === 0) return null
    if (selectedWordId && filteredVocab.some(word => word.id === selectedWordId)) {
      return selectedWordId
    }
    return filteredVocab[0].id
  }, [filteredVocab, selectedWordId])

  const speakText = (key: string, text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    const synthesis = window.speechSynthesis
    if (speakingKey === key) {
      synthesis.cancel()
      setSpeakingKey(null)
      return
    }
    synthesis.cancel()
    const voices = synthesis.getVoices()
    const match =
      voices.find(voice => voice.lang?.toLowerCase().startsWith("de-")) ??
      voices.find(voice => voice.lang?.toLowerCase().startsWith("de")) ??
      voices.find(voice => voice.name?.toLowerCase().includes("german")) ??
      voices.find(voice => voice.name?.toLowerCase().includes("deutsch")) ??
      null
    if (match && match !== germanVoice) {
      setGermanVoice(match)
      setVoiceWarning(false)
    }
    const utterance = new SpeechSynthesisUtterance(text)
    if (match) {
      utterance.voice = match
      utterance.lang = match.lang
    } else if (germanVoice) {
      utterance.voice = germanVoice
      utterance.lang = germanVoice.lang
    } else {
      utterance.lang = "de-DE"
      setVoiceWarning(true)
    }
    utterance.onend = () => setSpeakingKey(current => (current === key ? null : current))
    utterance.onerror = () => setSpeakingKey(current => (current === key ? null : current))
    setSpeakingKey(key)
    synthesis.speak(utterance)
  }

  const partOfSpeechOptions = useMemo(() => {
    const values = new Set<string>()
    vocabulary.forEach(word => {
      values.add(partOfSpeechByCategory[word.category] ?? "Other")
    })
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [])

  const domainOptions = useMemo(() => {
    const values = new Set<string>()
    vocabulary.forEach(word => {
      getHooksForWord(word).domains.forEach(domain => values.add(domain))
    })
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [])

  const confusableOptions = useMemo(() => {
    const values = new Set<string>()
    vocabulary.forEach(word => {
      word.hooks?.confusables?.forEach(confusable => values.add(confusable))
    })
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [])

  const selectedWord = filteredVocab.find(word => word.id === selectedWordIdForRender) ?? null
  const isDetailsOpen = isMobile ? detailsOpen : false

  const renderWordDetails = (word: (typeof vocabulary)[number]) => (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-2xl font-semibold text-foreground">{word.german}</p>
            <p className="text-sm text-muted-foreground">{word.english}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => {
              const text = getSpeechText(word)
              if (!text) return
              speakText(`word-${word.id}`, text)
            }}
            disabled={!speechSupported}
            title={speechSupported ? "Speak word" : "Speech not supported"}
          >
            <Volume2
              className={cn(
                "w-4 h-4",
                speakingKey === `word-${word.id}` ? "text-primary" : "text-muted-foreground"
              )}
            />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {partOfSpeechByCategory[word.category] ?? "Other"}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {word.level ?? levelByCategory[word.category] ?? "None"}
          </span>
          {getHooksForWord(word).cognate && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              {getHooksForWord(word).cognate === "direct"
                ? "Direct cognate"
                : getHooksForWord(word).cognate === "near"
                  ? "Near-cognate"
                  : getHooksForWord(word).cognate === "false"
                    ? "False friend"
                    : "No-cognate"}
            </span>
          )}
          {getHooksForWord(word).frequency && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              {getHooksForWord(word).frequency === "core"
                ? "Core"
                : getHooksForWord(word).frequency === "booster"
                  ? "Booster"
                  : "Specialist"}
            </span>
          )}
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            getStatusStyles(statusById[word.id] ?? "new")
          )}>
            {getStatusLabel(statusById[word.id] ?? "new")}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Set status</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-rose-200 bg-rose-50 text-rose-700 hover:text-rose-700 hover:border-rose-200 hover:bg-rose-100"
            onClick={() => setStatus(word.id, "again")}
          >
            <RotateCcw className="h-4 w-4" />
            Learn again
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-yellow-300 bg-yellow-50 text-yellow-700 hover:text-yellow-700 hover:border-yellow-300 hover:bg-yellow-100"
            onClick={() => setStatus(word.id, "learning")}
          >
            <BookOpen className="h-4 w-4" />
            Learning
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100"
            onClick={() => setStatus(word.id, "easy")}
          >
            <Check className="h-4 w-4" />
            Easy
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Notes</p>
        <p className="text-sm text-muted-foreground">
          {word.note || "No notes for this word yet."}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">Learning hooks</p>
        {getHooksForWord(word).domains.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {getHooksForWord(word).domains.map((domain) => (
              <span key={domain} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {domain}
              </span>
            ))}
            {getHooksForWord(word).confusables?.map((confusable) => (
              <span key={confusable} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {confusable}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No learning hooks tagged yet.</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">Example sentence</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              const example = getExample(word)
              if (!example) return
              speakText(`example-${word.id}`, example)
            }}
            disabled={!speechSupported || !getExample(word)}
            title={
              speechSupported
                ? "Speak example"
                : "Speech not supported"
            }
          >
            <Volume2
              className={cn(
                "w-4 h-4",
                speakingKey === `example-${word.id}` ? "text-primary" : "text-muted-foreground"
              )}
            />
          </Button>
        </div>
        {getExample(word) ? (
          <p className="text-sm text-foreground">{getExample(word)}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No example sentence yet.</p>
        )}
      </div>
    </div>
  )

  const getArticleColor = (article: string | null) => {
    switch (article) {
      case "der": return "bg-blue-100 text-blue-700"
      case "die": return "bg-pink-100 text-pink-700"
      case "das": return "bg-green-100 text-green-700"
      default: return ""
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "pronouns": "bg-purple-100 text-purple-700",
      "possessives": "bg-indigo-100 text-indigo-700",
      "prepositions": "bg-cyan-100 text-cyan-700",
      "connectors": "bg-amber-100 text-amber-700",
      "question-words": "bg-rose-100 text-rose-700",
      "modal-verbs": "bg-emerald-100 text-emerald-700",
      "verb-tenses": "bg-blue-100 text-blue-700",
      "werden": "bg-violet-100 text-violet-700",
      "passive": "bg-fuchsia-100 text-fuchsia-700",
      "konjunktiv": "bg-pink-100 text-pink-700",
      "reflexive-verbs": "bg-teal-100 text-teal-700",
      "separable-verbs": "bg-lime-100 text-lime-700",
      "regular-verbs": "bg-emerald-100 text-emerald-700",
      "irregular-verbs": "bg-amber-100 text-amber-800",
      "mixed-verbs": "bg-indigo-100 text-indigo-700",
      "nouns": "bg-sky-100 text-sky-700",
      "verbs": "bg-orange-100 text-orange-700",
    }
    return colors[category] || "bg-gray-100 text-gray-700"
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="text-center space-y-4 py-6">
        <h1 className="text-4xl font-bold text-foreground">Vocabulary</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Words organized by the lessons - verbs, tenses, passive voice, modal verbs, and more
        </p>
        <div className="grid w-full max-w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center">
          <span className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{vocabulary.length}</span>
            <span className="break-words">Total Words</span>
          </span>
          <span className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{domainOptions.length}</span>
            <span className="break-words">Learning Hooks</span>
          </span>
          <span className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{starredWords.length}</span>
            <span className="break-words">Starred</span>
            {starredWords.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-0 text-xs text-red-600 hover:text-red-600 whitespace-nowrap"
                onClick={clearStarred}
              >
                Clear
              </Button>
            )}
          </span>
          <span className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {Object.values(statusById).filter(status => status === "again").length}
            </span>
            <span className="break-words">Learn again</span>
            {Object.values(statusById).some(status => status === "again") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-0 text-xs text-red-600 hover:text-red-600"
                onClick={() => clearStatus("again")}
              >
                Clear
              </Button>
            )}
          </span>
          <span className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {Object.values(statusById).filter(status => status === "learning").length}
            </span>
            <span className="break-words">Learning</span>
            {Object.values(statusById).some(status => status === "learning") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-0 text-xs text-red-600 hover:text-red-600"
                onClick={() => clearStatus("learning")}
              >
                Clear
              </Button>
            )}
          </span>
          <span className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {Object.values(statusById).filter(status => status === "easy").length}
            </span>
            <span className="break-words">Easy</span>
            {Object.values(statusById).some(status => status === "easy") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-0 text-xs text-red-600 hover:text-red-600"
                onClick={() => clearStatus("easy")}
              >
                Clear
              </Button>
            )}
          </span>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr_360px] lg:items-start w-full min-w-0">
        <div className="space-y-4 w-full min-w-0">
          <div ref={filtersRef}>
            <Card className="w-full max-w-full min-w-0 overflow-hidden">
              <CardHeader className="pb-2 min-w-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search vocabulary, notes, or meanings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Filters</span>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                </div>
                <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Word status</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "starred", label: "Starred" },
                    { value: "again", label: "Learn again" },
                    { value: "learning", label: "Learning" },
                    { value: "easy", label: "Easy" },
                  ].map(option => (
                    <Button
                      key={option.value}
                      variant={statusFilter === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(option.value as "all" | WordStatus)}
                      className="justify-start whitespace-normal text-left"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Level</p>
                    <InfoTooltip text="Filter by proficiency level (A1/A2/B1)." />
                  </div>
                  <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as "all" | WordLevel)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                      <SelectItem value="B1">B1</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Lesson</p>
                    <InfoTooltip text="Filter words by the lesson that introduced them." />
                  </div>
                  <Select value={lessonValue} onValueChange={handleLessonValueChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select lesson" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Lessons</SelectItem>
                      {lessonCatalog.map((lesson) => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          {lesson.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Parts of speech</p>
                    <InfoTooltip text="Filter by word type (verbs, nouns, pronouns, etc.)." />
                  </div>
                  <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All parts of speech" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Learning hooks</p>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {domainOptions.map((domain) => (
                        <Button
                          key={domain}
                          variant={selectedDomains.includes(domain) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedDomains((prev) =>
                              prev.includes(domain)
                                ? prev.filter(item => item !== domain)
                                : [...prev, domain]
                            )
                          }}
                          className="h-auto max-w-full whitespace-normal text-left leading-snug break-words"
                        >
                          {domain}
                        </Button>
                      ))}
                    </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Cognate type</p>
                    <InfoTooltip
                      text="Cognates tell you how safely you can guess a word from English."
                      bullets={["Direct: same word and meaning (Information).", "Near: small spelling shift (Universitat → university).", "False friend: looks English but means something else (bekommen = to receive).", "No‑cognate: no obvious English link (doch, ohnehin)."]}
                    />
                  </div>
                  <Select value={cognateFilter} onValueChange={(value) => setCognateFilter(value as "all" | CognateTag)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Cognate type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All cognates</SelectItem>
                        <SelectItem value="direct">Direct cognate</SelectItem>
                        <SelectItem value="near">Near-cognate</SelectItem>
                        <SelectItem value="false">False friend</SelectItem>
                        <SelectItem value="none">No-cognate</SelectItem>
                      </SelectContent>
                    </Select>
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Frequency</p>
                    <InfoTooltip
                      text="Frequency shows how useful a word is day‑to‑day."
                      bullets={["Core: everyday essentials you need early.", "Booster: common, expressive words that level you up.", "Specialist: niche, formal, or domain‑specific words."]}
                    />
                  </div>
                  <Select value={frequencyFilter} onValueChange={(value) => setFrequencyFilter(value as "all" | FrequencyTag)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All frequency</SelectItem>
                        <SelectItem value="core">Core</SelectItem>
                        <SelectItem value="booster">Booster</SelectItem>
                        <SelectItem value="specialist">Specialist</SelectItem>
                      </SelectContent>
                    </Select>
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Confusable sets</p>
                    <InfoTooltip text="Filter by common confusion pairs like kennen vs wissen or liegen vs legen." />
                  </div>
                  <Select value={confusableFilter} onValueChange={setConfusableFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Confusable sets" />
                    </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All confusables</SelectItem>
                        {confusableOptions.map((confusable) => (
                          <SelectItem key={confusable} value={confusable}>
                            {confusable}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card
          className="flex flex-col min-h-0 w-full max-w-full min-w-0 overflow-hidden"
          style={listMaxHeight ? { maxHeight: listMaxHeight } : undefined}
        >
          <CardHeader className="min-w-0">
            <CardTitle className="flex items-center justify-between">
              <span>Word List</span>
              <span className="text-sm font-normal text-muted-foreground">
                {filteredVocab.length} words
              </span>
            </CardTitle>
            {speechSupported && voiceWarning && (
              <p className="text-xs text-amber-600">
                German voice not installed; pronunciation may sound English.
              </p>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2 min-h-0 w-full max-w-full min-w-0">
            <div className="space-y-2">
              {filteredVocab.map((word) => {
                const status = statusById[word.id] ?? "new"
                const level = word.level ?? levelByCategory[word.category] ?? "None"
                const partOfSpeech = partOfSpeechByCategory[word.category] ?? "Other"
                const speakKey = `word-${word.id}`
                const hooks = getHooksForWord(word)
                return (
                  <div
                    key={word.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedWordId(word.id)
                      if (isMobile) {
                        setDetailsOpen(true)
                      }
                    }}
                    className={cn(
                      "flex items-start justify-between gap-3 p-4 rounded-lg bg-secondary transition-colors",
                      selectedWordIdForRender === word.id ? "ring-2 ring-primary/30" : "hover:bg-secondary/80"
                    )}
                  >
                    <div className="w-full">
                      <div className="sm:hidden space-y-2">
                        <p className="text-base font-semibold text-foreground break-words">{word.german}</p>
                        <div className="flex flex-wrap items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation()
                              const speechText = getSpeechText(word)
                              if (!speechText) return
                              speakText(speakKey, speechText)
                            }}
                            disabled={!speechSupported}
                            title={
                              speechSupported
                                ? `Speak ${getSpeechText(word)}`
                                : "Speech not supported"
                            }
                          >
                            <Volume2
                              className={cn(
                                "w-4 h-4",
                                speakingKey === speakKey ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation()
                              setStatus(word.id, "again")
                            }}
                            title="Learn again"
                          >
                            <RotateCcw className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation()
                              setStatus(word.id, "learning")
                            }}
                            title="Learning"
                          >
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation()
                              setStatus(word.id, "easy")
                            }}
                            title="Easy"
                          >
                            <Check className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation()
                              toggleStar(word.id)
                            }}
                          >
                            <Star
                              className={cn(
                                "w-4 h-4",
                                starredWords.includes(word.id)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              )}
                            />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{word.english}</p>
                        {word.note && (
                          <p className="text-xs text-primary">{word.note}</p>
                        )}
                        <div className="space-y-2">
                          <div className="flex w-full flex-nowrap items-center gap-2">
                            {word.article ? (
                              <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getArticleColor(word.article))}>
                                {word.article}
                              </span>
                            ) : (
                              <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getCategoryColor(word.category))}>
                                {categories.find(c => c.id === word.category)?.label}
                              </span>
                            )}
                          </div>
                          <div className="flex w-full flex-wrap items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-background text-muted-foreground">
                              {partOfSpeech}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-background text-muted-foreground">
                              {level}
                            </span>
                            {hooks.cognate && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-background text-muted-foreground">
                                {hooks.cognate === "direct"
                                  ? "Direct cognate"
                                  : hooks.cognate === "near"
                                    ? "Near-cognate"
                                    : hooks.cognate === "false"
                                      ? "False friend"
                                      : "No-cognate"}
                              </span>
                            )}
                            {hooks.frequency && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-background text-muted-foreground">
                                {hooks.frequency === "core"
                                  ? "Core"
                                  : hooks.frequency === "booster"
                                    ? "Booster"
                                    : "Specialist"}
                              </span>
                            )}
                            <span className={cn("text-xs px-2 py-0.5 rounded-full", getStatusStyles(status))}>
                              {getStatusLabel(status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-start justify-between gap-3">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {word.article ? (
                            <span className={cn("px-2 py-1 rounded text-xs font-medium shrink-0", getArticleColor(word.article))}>
                              {word.article}
                            </span>
                          ) : (
                            <span className={cn("px-2 py-1 rounded text-xs font-medium shrink-0", getCategoryColor(word.category))}>
                              {categories.find(c => c.id === word.category)?.label.split(" ")[0]}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-foreground truncate">{word.german}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-background text-muted-foreground">
                                {partOfSpeech}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-background text-muted-foreground">
                                {level}
                              </span>
                              {hooks.cognate && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-background text-muted-foreground">
                                  {hooks.cognate === "direct"
                                    ? "Direct cognate"
                                    : hooks.cognate === "near"
                                      ? "Near-cognate"
                                      : hooks.cognate === "false"
                                        ? "False friend"
                                        : "No-cognate"}
                                </span>
                              )}
                              {hooks.frequency && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-background text-muted-foreground">
                                  {hooks.frequency === "core"
                                    ? "Core"
                                    : hooks.frequency === "booster"
                                      ? "Booster"
                                      : "Specialist"}
                                </span>
                              )}
                              <span className={cn("text-xs px-2 py-0.5 rounded-full", getStatusStyles(status))}>
                                {getStatusLabel(status)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{word.english}</p>
                            {word.note && (
                              <p className="text-xs text-primary mt-1">{word.note}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation()
                              const speechText = getSpeechText(word)
                              if (!speechText) return
                              speakText(speakKey, speechText)
                            }}
                            disabled={!speechSupported}
                            title={
                              speechSupported
                                ? `Speak ${getSpeechText(word)}`
                                : "Speech not supported"
                            }
                          >
                            <Volume2
                              className={cn(
                                "w-4 h-4",
                                speakingKey === speakKey ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation()
                              setStatus(word.id, "again")
                            }}
                            title="Learn again"
                          >
                            <RotateCcw className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation()
                              setStatus(word.id, "learning")
                            }}
                            title="Learning"
                          >
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation()
                              setStatus(word.id, "easy")
                            }}
                            title="Easy"
                          >
                            <Check className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                              event.stopPropagation()
                              toggleStar(word.id)
                            }}
                          >
                            <Star
                              className={cn(
                                "w-4 h-4",
                                starredWords.includes(word.id)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              )}
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="hidden lg:flex lg:h-[calc(100vh-240px)] flex-col w-full max-w-full min-w-0">
          <CardHeader>
            <CardTitle>Word Details</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto w-full max-w-full">
            {selectedWord ? renderWordDetails(selectedWord) : (
              <p className="text-sm text-muted-foreground">No word selected.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Sheet open={isDetailsOpen && !!selectedWord} onOpenChange={setDetailsOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Word Details</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            {selectedWord ? renderWordDetails(selectedWord) : (
              <p className="text-sm text-muted-foreground">No word selected.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
