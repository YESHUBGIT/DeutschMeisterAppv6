"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const cheatSheets = [
  {
    id: 1,
    title: "Personal Pronouns",
    description: "Subject pronouns - Nominative case",
    items: [
      { german: "ich", english: "I", note: "Always lowercase unless sentence start" },
      { german: "du", english: "you (informal)", note: "Friends, family, kids" },
      { german: "er / sie / es", english: "he / she / it", note: "Matches noun gender" },
      { german: "wir", english: "we", note: "" },
      { german: "ihr", english: "you all (informal)", note: "Group of friends" },
      { german: "sie", english: "they", note: "Lowercase" },
      { german: "Sie", english: "you (formal)", note: "ALWAYS capitalized!" },
    ],
  },
  {
    id: 2,
    title: "Possessive Articles",
    description: "my, your, his, her, etc.",
    items: [
      { german: "mein", english: "my", note: "From ich" },
      { german: "dein", english: "your (informal)", note: "From du" },
      { german: "sein", english: "his / its", note: "From er/es" },
      { german: "ihr", english: "her / their", note: "From sie" },
      { german: "unser", english: "our", note: "From wir" },
      { german: "euer", english: "your (pl. informal)", note: "Loses 'e' with endings" },
      { german: "Ihr", english: "your (formal)", note: "Capitalized - from Sie" },
    ],
  },
  {
    id: 3,
    title: "Accusative Prepositions (DOGFU)",
    description: "Always take Accusative",
    items: [
      { german: "durch", english: "through", note: "durch den Park" },
      { german: "ohne", english: "without", note: "ohne mich" },
      { german: "gegen", english: "against", note: "gegen die Wand" },
      { german: "für", english: "for", note: "für dich" },
      { german: "um", english: "around / at (time)", note: "um den Tisch" },
    ],
  },
  {
    id: 4,
    title: "Dative Prepositions",
    description: "Always take Dative",
    items: [
      { german: "aus", english: "out of / from", note: "aus dem Haus" },
      { german: "bei", english: "at / near", note: "bei mir" },
      { german: "mit", english: "with", note: "mit dem Bus" },
      { german: "nach", english: "after / to (places)", note: "nach Hause" },
      { german: "seit", english: "since / for (time)", note: "seit einem Jahr" },
      { german: "von", english: "from / of", note: "von der Arbeit" },
      { german: "zu", english: "to", note: "zum Bahnhof (zu+dem)" },
    ],
  },
  {
    id: 5,
    title: "Connectors - Type 0",
    description: "NO verb position change",
    items: [
      { german: "und", english: "and", note: "Ich lerne UND er arbeitet." },
      { german: "oder", english: "or", note: "Verb stays in position 2" },
      { german: "aber", english: "but", note: "Verb stays in position 2" },
      { german: "denn", english: "because", note: "Different from 'weil'!" },
      { german: "sondern", english: "but rather", note: "After negative" },
    ],
  },
  {
    id: 6,
    title: "Connectors - Type 1",
    description: "Verb goes to END!",
    items: [
      { german: "weil", english: "because", note: "...weil ich müde BIN" },
      { german: "dass", english: "that", note: "...dass er krank IST" },
      { german: "wenn", english: "if / when", note: "...wenn du kommst" },
      { german: "obwohl", english: "although", note: "...obwohl es regnet" },
      { german: "als", english: "when (past)", note: "...als ich jung war" },
      { german: "bevor", english: "before", note: "...bevor du gehst" },
      { german: "nachdem", english: "after", note: "...nachdem er kam" },
    ],
  },
  {
    id: 7,
    title: "Connectors - Type 2",
    description: "Verb comes FIRST after connector",
    items: [
      { german: "deshalb", english: "therefore", note: "Deshalb BLEIBE ich." },
      { german: "trotzdem", english: "nevertheless", note: "Trotzdem GEHE ich." },
      { german: "dann", english: "then", note: "Dann MACHE ich..." },
      { german: "danach", english: "after that", note: "Danach FAHRE ich." },
      { german: "außerdem", english: "besides", note: "Außerdem BRAUCHE ich." },
    ],
  },
  {
    id: 8,
    title: "Question Words",
    description: "W-Fragen + prepositional",
    items: [
      { german: "was / wer / wen / wem", english: "what / who(nom) / whom(acc) / whom(dat)", note: "" },
      { german: "wo / wann / warum / wie", english: "where / when / why / how", note: "" },
      { german: "worüber / über wen", english: "about what / about whom", note: "THING / PERSON" },
      { german: "wofür / für wen", english: "for what / for whom", note: "THING / PERSON" },
      { german: "womit / mit wem", english: "with what / with whom", note: "THING / PERSON" },
    ],
  },
  {
    id: 9,
    title: "Dative Verbs",
    description: "These ALWAYS take Dative!",
    items: [
      { german: "helfen", english: "to help", note: "Ich helfe DIR" },
      { german: "danken", english: "to thank", note: "Ich danke DIR" },
      { german: "gefallen", english: "to please", note: "Es gefällt MIR" },
      { german: "gehören", english: "to belong to", note: "Das gehört MIR" },
      { german: "folgen", english: "to follow", note: "Ich folge DIR" },
      { german: "antworten", english: "to answer", note: "Ich antworte DIR" },
    ],
  },
  {
    id: 10,
    title: "Reflexive Verbs",
    description: "Common verbs with 'sich'",
    items: [
      { german: "sich freuen auf + Akk", english: "look forward to", note: "Future event" },
      { german: "sich freuen über + Akk", english: "be happy about", note: "Current/past event" },
      { german: "sich interessieren für", english: "be interested in", note: "" },
      { german: "sich erinnern an + Akk", english: "remember", note: "" },
      { german: "sich beeilen", english: "hurry", note: "Beeil dich!" },
    ],
  },
  {
    id: 11,
    title: "Gender Patterns",
    description: "Endings that predict gender",
    items: [
      { german: "-ung / -keit / -heit", english: "feminine (die)", note: "Zeitung, Freiheit" },
      { german: "-ion / -schaft", english: "feminine (die)", note: "Nation, Freundschaft" },
      { german: "-chen / -lein", english: "neuter (das)", note: "Mädchen, Brötchen" },
      { german: "-ment", english: "neuter (das)", note: "Dokument" },
      { german: "-ling", english: "masculine (der)", note: "Frühling" },
    ],
  },
  {
    id: 12,
    title: "Article Changes by Case",
    description: "How der/die/das change",
    items: [
      { german: "der → den → dem", english: "Masculine: Nom → Akk → Dat", note: "" },
      { german: "die → die → der", english: "Feminine: Nom → Akk → Dat", note: "Only Dat changes" },
      { german: "das → das → dem", english: "Neuter: Nom → Akk → Dat", note: "Only Dat changes" },
      { german: "ein → einen → einem", english: "Masc indefinite", note: "" },
      { german: "eine → eine → einer", english: "Fem indefinite", note: "" },
    ],
  },
]

// Modal Verbs Tables
const modalVerbsPresent = [
  { english: "I can do it", german: "Ich kann es machen", example: "Ich kann Deutsch sprechen." },
  { english: "I may do it (allowed)", german: "Ich darf es machen", example: "Ich darf hier parken." },
  { english: "I must / have to do it", german: "Ich muss es machen", example: "Ich muss morgen arbeiten." },
  { english: "I shall / am supposed to do it", german: "Ich soll es machen", example: "Ich soll das Projekt beenden." },
  { english: "I want to do it", german: "Ich will es machen", example: "Ich will nach Berlin fahren." },
  { english: "I like to do it", german: "Ich mag es machen / Ich mache es gern", example: "Ich mache das gern." },
]

const modalVerbsKonjunktivII = [
  { english: "I could do it", german: "Ich könnte es machen", example: "Ich könnte morgen kommen." },
  { english: "I might be allowed to do it", german: "Ich dürfte es machen", example: "Ich dürfte länger bleiben." },
  { english: "I would have to do it", german: "Ich müsste es machen", example: "Ich müsste mehr lernen." },
  { english: "I should do it", german: "Ich sollte es machen", example: "Ich sollte früher ins Bett gehen." },
  { english: "I would want to do it", german: "Ich wollte es machen", example: "Ich wollte dir helfen." },
  { english: "I would like to do it", german: "Ich möchte es machen", example: "Ich möchte einen Kaffee." },
]

const pastConditional = [
  { english: "I could have done it", german: "Ich hätte es machen können", example: "Ich hätte das machen können." },
  { english: "I may have been allowed to do it", german: "Ich hätte es machen dürfen", example: "Ich hätte länger bleiben dürfen." },
  { english: "I would have had to do it", german: "Ich hätte es machen müssen", example: "Ich hätte gestern arbeiten müssen." },
  { english: "I should have done it", german: "Ich hätte es machen sollen", example: "Ich hätte mehr lernen sollen." },
  { english: "I would have wanted to do it", german: "Ich hätte es machen wollen", example: "Ich hätte helfen wollen." },
  { english: "I would have liked it", german: "Ich hätte es gemocht", example: "Ich hätte das gemocht." },
]

const modalPerfectInfinitive = [
  { meaning: "Possibility (may/might have done)", modal: "können", pattern: "kann / könnte es gemacht haben", example: "Er könnte das gesagt haben." },
  { meaning: "Probability (is likely to have done)", modal: "dürfen", pattern: "dürfte es gemacht haben", example: "Er dürfte schon angekommen sein." },
  { meaning: "Deduction (must have done)", modal: "müssen", pattern: "muss es gemacht haben", example: "Er muss den Fehler gemacht haben." },
  { meaning: "Hearsay (is said to have done)", modal: "sollen", pattern: "soll es gemacht haben", example: "Er soll viel verdient haben." },
  { meaning: "Self-claim (claims to have done)", modal: "wollen", pattern: "will es gemacht haben", example: "Er will das allein geschafft haben." },
]

// WERDEN tables
const werdenActiveTenses = [
  { tense: "Present", form: "werden", meaning: "is becoming", example: "Er wird müde." },
  { tense: "Past (Perfekt)", form: "sein/haben + geworden", meaning: "has/have become", example: "Er ist müde geworden." },
  { tense: "Past (Präteritum)", form: "wurden", meaning: "became", example: "Er wurde müde." },
  { tense: "Past (Plusquamperfekt)", form: "war + geworden", meaning: "had become", example: "Er war müde geworden." },
  { tense: "Future I", form: "werden + Infinitiv", meaning: "will become", example: "Er wird müde werden." },
  { tense: "Future II", form: "–", meaning: "–", example: "(rarely used in active with werden)" },
]

const werdenPassiveTenses = [
  { tense: "Present", form: "werden + Partizip II", meaning: "is being ...", example: "Die Arbeit wird gemacht." },
  { tense: "Past (Perfekt)", form: "sein + Partizip II + worden", meaning: "has been ...", example: "Die Tür ist geöffnet worden." },
  { tense: "Past (Präteritum)", form: "wurden + Partizip II", meaning: "was/were ...", example: "Die Bücher wurden gelesen." },
  { tense: "Past (Plusquamperfekt)", form: "war + Partizip II + worden", meaning: "had been ...", example: "Das Buch war gelesen worden." },
  { tense: "Future I", form: "werden + Partizip II + werden", meaning: "will be ...", example: "Die Arbeit wird gemacht werden." },
  { tense: "Future II", form: "werden + Partizip II + worden + sein", meaning: "will have been ...", example: "Das Buch wird gelesen worden sein." },
]

const activeVoiceFormula = [
  { tense: "Präsens", normalVerb: "verb stem + ending", normalEx: "Ich lese ein Buch.", modalVerb: "modal (Präs.) + Infinitiv", modalEx: "Ich muss ein Buch lesen." },
  { tense: "Präteritum", normalVerb: "verb stem + Prät. ending", normalEx: "Ich las ein Buch.", modalVerb: "modal (Prät.) + Infinitiv", modalEx: "Ich musste ein Buch lesen." },
  { tense: "Perfekt", normalVerb: "haben/sein + Partizip II", normalEx: "Ich habe ein Buch gelesen.", modalVerb: "haben + Infinitiv (lesen) + Modal (Inf.)", modalEx: "Ich habe ein Buch lesen müssen." },
  { tense: "Plusquamperfekt", normalVerb: "hatte/war + Partizip II", normalEx: "Ich hatte ein Buch gelesen.", modalVerb: "hatte + Infinitiv (lesen) + Modal (Inf.)", modalEx: "Ich hatte ein Buch lesen müssen." },
  { tense: "Futur I", normalVerb: "werden + Infinitiv", normalEx: "Ich werde ein Buch lesen.", modalVerb: "werden + Infinitiv (lesen) + Modal (Inf.)", modalEx: "Ich werde ein Buch lesen müssen." },
  { tense: "Konjunktiv II Präsens", normalVerb: "würde + Infinitiv", normalEx: "Ich würde ein Buch lesen.", modalVerb: "modal (Konj. II) + Infinitiv", modalEx: "Ich müsste ein Buch lesen." },
  { tense: "Konjunktiv II Vergangenheit", normalVerb: "hätte/wäre + Partizip II", normalEx: "Ich hätte ein Buch gelesen.", modalVerb: "hätte + Infinitiv (lesen) + Modal (Inf.)", modalEx: "Ich hätte ein Buch lesen müssen." },
]

const passiveVoiceFormula = [
  { tense: "Präsens", normalVerb: "werden + Partizip II", normalEx: "Das Buch wird gelesen.", modalVerb: "modal + Infinitiv + werden", modalEx: "Das Buch muss gelesen werden." },
  { tense: "Präteritum", normalVerb: "wurde + Partizip II", normalEx: "Das Buch wurde gelesen.", modalVerb: "modal (Prät.) + Infinitiv + werden", modalEx: "Das Buch musste gelesen werden." },
  { tense: "Perfekt", normalVerb: "sein + Partizip II + worden", normalEx: "Das Buch ist gelesen worden.", modalVerb: "haben + Infinitiv (lesen) + werden + Modal (Inf.)", modalEx: "Das Buch hat gelesen werden müssen." },
  { tense: "Plusquamperfekt", normalVerb: "war + Partizip II + worden", normalEx: "Das Buch war gelesen worden.", modalVerb: "hatte + Infinitiv (lesen) + werden + Modal (Inf.)", modalEx: "Das Buch hatte gelesen werden müssen." },
  { tense: "Futur I", normalVerb: "wird + Infinitiv (lesen) + werden", normalEx: "Das Buch wird gelesen werden.", modalVerb: "wird + Infinitiv (lesen) + werden + Modal (Inf.)", modalEx: "Das Buch wird gelesen werden müssen." },
  { tense: "Konjunktiv II Präsens", normalVerb: "würde + Infinitiv (werden) + Partizip II", normalEx: "Das Buch würde gelesen werden.", modalVerb: "Das Buch müsste gelesen werden.", modalEx: "" },
  { tense: "Konjunktiv II Vergangenheit", normalVerb: "wäre + Partizip II + worden", normalEx: "Das Buch wäre gelesen worden.", modalVerb: "hätte + Infinitiv (lesen) + werden + Modal (Inf.)", modalEx: "Das Buch hätte gelesen werden müssen." },
]

const activeVsPassiveComparison = [
  { tense: "Präsens", active: "Ich lese ein Buch.", activeEng: "I read / am reading a book.", passive: "Das Buch wird gelesen.", passiveEng: "The book is read." },
  { tense: "Präteritum", active: "Ich las ein Buch.", activeEng: "I read a book (past).", passive: "Das Buch wurde gelesen.", passiveEng: "The book was read." },
  { tense: "Perfekt", active: "Ich habe ein Buch gelesen.", activeEng: "I have read a book.", passive: "Das Buch ist gelesen worden.", passiveEng: "The book has been read." },
  { tense: "Plusquamperfekt", active: "Ich hatte ein Buch gelesen.", activeEng: "I had read a book.", passive: "Das Buch war gelesen worden.", passiveEng: "The book had been read." },
  { tense: "Futur I", active: "Ich werde ein Buch lesen.", activeEng: "I will read a book.", passive: "Das Buch wird gelesen werden.", passiveEng: "The book will be read." },
  { tense: "Futur II", active: "Ich werde ein Buch gelesen haben.", activeEng: "I will have read a book.", passive: "Das Buch wird gelesen worden sein.", passiveEng: "The book will have been read." },
  { tense: "Konjunktiv II Präsens", active: "Ich würde ein Buch lesen.", activeEng: "I would read a book.", passive: "Das Buch würde gelesen werden.", passiveEng: "The book would be read." },
  { tense: "Konjunktiv II Vergangenheit", active: "Ich hätte ein Buch gelesen.", activeEng: "I would have read a book.", passive: "Das Buch wäre gelesen worden.", passiveEng: "The book would have been read." },
]

export function CheatTab() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    modalPresent: true,
    modalKonjunktiv: false,
    pastConditional: false,
    modalPerfect: false,
    werdenActive: false,
    werdenPassive: false,
    activeFormula: false,
    passiveFormula: false,
    activeVsPassive: false,
  })

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 py-6">
        <h1 className="text-4xl font-bold text-foreground">Cheat Sheets</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Quick reference for everything - comprehensive verb tables and grammar shortcuts
        </p>
      </div>

      {/* Quick Stats */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        <Badge variant="secondary" className="text-sm py-2 px-4">
          {cheatSheets.length} Quick References
        </Badge>
        <Badge variant="secondary" className="text-sm py-2 px-4">
          9 Verb Tables
        </Badge>
        <Badge variant="secondary" className="text-sm py-2 px-4">
          All Tenses Covered
        </Badge>
      </div>

      {/* Important Rule Callout */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Key Rules to Remember</p>
              <ul className="text-amber-700 text-sm mt-2 space-y-1">
                <li>Modal verbs: Present = facts, Konjunktiv II = polite/hypothetical</li>
                <li>WERDEN has 3 uses: Full verb (to become), Future helper, Passive helper</li>
                <li>Past conditional = &quot;would have&quot; = Ich hätte + Partizip II + Modal</li>
                <li>Type 1 connectors (weil, dass, wenn) send the verb to the END</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VERB TABLES SECTION */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">V</span>
          Verb Tables (Comprehensive)
        </h2>

        {/* Modal Verbs - Present */}
        <Card>
          <CardHeader 
            className="cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('modalPresent')}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">1) Modal Verbs - Present Tense</CardTitle>
                <CardDescription>Facts, permission, ability</CardDescription>
              </div>
              {expandedSections.modalPresent ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {expandedSections.modalPresent && (
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">English</TableHead>
                      <TableHead className="w-[220px]">German</TableHead>
                      <TableHead>Example</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modalVerbsPresent.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.english}</TableCell>
                        <TableCell className="font-medium text-primary">{row.german}</TableCell>
                        <TableCell className="text-muted-foreground italic">{row.example}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Modal Verbs - Konjunktiv II */}
        <Card>
          <CardHeader 
            className="cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('modalKonjunktiv')}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">2) Modal Verbs - Konjunktiv II</CardTitle>
                <CardDescription>Hypothetical / polite &quot;would&quot;</CardDescription>
              </div>
              {expandedSections.modalKonjunktiv ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {expandedSections.modalKonjunktiv && (
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">English</TableHead>
                      <TableHead className="w-[220px]">German</TableHead>
                      <TableHead>Example</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modalVerbsKonjunktivII.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.english}</TableCell>
                        <TableCell className="font-medium text-primary">{row.german}</TableCell>
                        <TableCell className="text-muted-foreground italic">{row.example}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Past Conditional */}
        <Card>
          <CardHeader 
            className="cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('pastConditional')}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">3) Past Conditional</CardTitle>
                <CardDescription>
                  &quot;would/could/should have ... (but didn&apos;t)&quot; - Form: hätte/wäre + Infinitiv + Modal
                </CardDescription>
              </div>
              {expandedSections.pastConditional ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {expandedSections.pastConditional && (
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">English</TableHead>
                      <TableHead className="w-[250px]">German</TableHead>
                      <TableHead>Example</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastConditional.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.english}</TableCell>
                        <TableCell className="font-medium text-primary">{row.german}</TableCell>
                        <TableCell className="text-muted-foreground italic">{row.example}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-3 p-2 bg-secondary rounded">
                Tip: This is for missed/counterfactual past - things that didn&apos;t happen but could/should have.
              </p>
            </CardContent>
          )}
        </Card>

        {/* Modal + Perfect Infinitive */}
        <Card>
          <CardHeader 
            className="cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('modalPerfect')}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">4) Modal + Perfect Infinitive</CardTitle>
                <CardDescription>&quot;may/might/must/should have...&quot; - Assumptions about the past</CardDescription>
              </div>
              {expandedSections.modalPerfect ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {expandedSections.modalPerfect && (
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Form: Modal (often Konjunktiv II) + Partizip II + haben/sein
              </p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Meaning (epistemic)</TableHead>
                      <TableHead className="w-[80px]">Modal</TableHead>
                      <TableHead className="w-[200px]">German Pattern</TableHead>
                      <TableHead>Example</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modalPerfectInfinitive.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm">{row.meaning}</TableCell>
                        <TableCell className="font-medium">{row.modal}</TableCell>
                        <TableCell className="text-primary">{row.pattern}</TableCell>
                        <TableCell className="text-muted-foreground italic">{row.example}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* WERDEN Active Tenses */}
        <Card>
          <CardHeader 
            className="cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('werdenActive')}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">5) WERDEN - Active Voice (Full Verb = &quot;to become&quot;)</CardTitle>
                <CardDescription>All tenses for &quot;werden&quot; as a main verb</CardDescription>
              </div>
              {expandedSections.werdenActive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {expandedSections.werdenActive && (
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Tense</TableHead>
                      <TableHead className="w-[200px]">German Form</TableHead>
                      <TableHead className="w-[120px]">English</TableHead>
                      <TableHead>Example</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {werdenActiveTenses.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{row.tense}</TableCell>
                        <TableCell className="text-primary">{row.form}</TableCell>
                        <TableCell>{row.meaning}</TableCell>
                        <TableCell className="text-muted-foreground italic">{row.example}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* WERDEN Passive Tenses */}
        <Card>
          <CardHeader 
            className="cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('werdenPassive')}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">6) WERDEN - Passive Voice</CardTitle>
                <CardDescription>All tenses for passive constructions</CardDescription>
              </div>
              {expandedSections.werdenPassive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {expandedSections.werdenPassive && (
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Tense</TableHead>
                      <TableHead className="w-[250px]">German Form</TableHead>
                      <TableHead className="w-[100px]">English</TableHead>
                      <TableHead>Example</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {werdenPassiveTenses.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{row.tense}</TableCell>
                        <TableCell className="text-primary">{row.form}</TableCell>
                        <TableCell>{row.meaning}</TableCell>
                        <TableCell className="text-muted-foreground italic">{row.example}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Active Voice Formula Table */}
        <Card>
          <CardHeader 
            className="cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('activeFormula')}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">7) Active Voice - Formula Table</CardTitle>
                <CardDescription>Normal Verb (lesen) vs Modal Verb (müssen + lesen)</CardDescription>
              </div>
              {expandedSections.activeFormula ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {expandedSections.activeFormula && (
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[130px]">Tense</TableHead>
                      <TableHead className="w-[180px]">Normal Verb Formula</TableHead>
                      <TableHead className="w-[180px]">Example</TableHead>
                      <TableHead className="w-[200px]">Modal Verb Formula</TableHead>
                      <TableHead>Modal Example</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeVoiceFormula.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{row.tense}</TableCell>
                        <TableCell className="text-sm">{row.normalVerb}</TableCell>
                        <TableCell className="text-primary italic text-sm">{row.normalEx}</TableCell>
                        <TableCell className="text-sm">{row.modalVerb}</TableCell>
                        <TableCell className="text-primary italic text-sm">{row.modalEx}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Passive Voice Formula Table */}
        <Card>
          <CardHeader 
            className="cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('passiveFormula')}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">8) Passive Voice - Formula Table</CardTitle>
                <CardDescription>Normal Verb vs Modal Verb in Passive</CardDescription>
              </div>
              {expandedSections.passiveFormula ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {expandedSections.passiveFormula && (
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[130px]">Tense</TableHead>
                      <TableHead className="w-[200px]">Normal Verb Formula</TableHead>
                      <TableHead className="w-[200px]">Example</TableHead>
                      <TableHead className="w-[220px]">Modal Verb Formula</TableHead>
                      <TableHead>Modal Example</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {passiveVoiceFormula.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{row.tense}</TableCell>
                        <TableCell className="text-sm">{row.normalVerb}</TableCell>
                        <TableCell className="text-primary italic text-sm">{row.normalEx}</TableCell>
                        <TableCell className="text-sm">{row.modalVerb}</TableCell>
                        <TableCell className="text-primary italic text-sm">{row.modalEx}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Active vs Passive Comparison */}
        <Card>
          <CardHeader 
            className="cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => toggleSection('activeVsPassive')}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">9) Active vs Passive - Side by Side</CardTitle>
                <CardDescription>Normal verbs only comparison</CardDescription>
              </div>
              {expandedSections.activeVsPassive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {expandedSections.activeVsPassive && (
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Tense</TableHead>
                      <TableHead className="w-[200px]">Active (lesen)</TableHead>
                      <TableHead className="w-[150px]">English</TableHead>
                      <TableHead className="w-[220px]">Passive (lesen)</TableHead>
                      <TableHead>English</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeVsPassiveComparison.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{row.tense}</TableCell>
                        <TableCell className="text-primary">{row.active}</TableCell>
                        <TableCell className="text-muted-foreground text-sm italic">{row.activeEng}</TableCell>
                        <TableCell className="text-primary">{row.passive}</TableCell>
                        <TableCell className="text-muted-foreground text-sm italic">{row.passiveEng}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* QUICK REFERENCE SECTION */}
      <div className="space-y-4 mt-8">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm">Q</span>
          Quick Reference Cards
        </h2>

        {/* Cheat Sheets Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {cheatSheets.map((sheet) => (
            <Card key={sheet.id}>
              <CardHeader>
                <CardTitle className="text-lg">{sheet.title}</CardTitle>
                <CardDescription>{sheet.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sheet.items.map((item, idx) => {
                    const itemId = `${sheet.id}-${idx}`
                    return (
                      <div
                        key={idx}
                        className="flex items-start justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{item.german}</p>
                          <p className="text-sm text-muted-foreground">{item.english}</p>
                          {item.note && (
                            <p className="text-xs text-primary mt-1">{item.note}</p>
                          )}
                        </div>
                        <button
                          onClick={() => copyToClipboard(item.german, itemId)}
                          className={cn(
                            "ml-2 p-2 rounded-md transition-all shrink-0",
                            "opacity-0 group-hover:opacity-100",
                            "hover:bg-primary/10"
                          )}
                          title="Copy German text"
                        >
                          {copiedId === itemId ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Memory Tips */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle>Memory Tricks</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">DOGFU</span>
              <span>- Accusative prepositions: Durch, Ohne, Gegen, Für, Um</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">WERDEN 3 uses</span>
              <span>- Full verb (become), Future helper (will), Passive helper (is being done)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">hätte + können/müssen/sollen</span>
              <span>- &quot;would have been able/had/should have&quot; - regret about the past</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">Type 1 connectors</span>
              <span>- weil, dass, wenn send verb to END (&quot;Because, that, if - verb at the end!&quot;)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">wo + prep</span>
              <span>- For THINGS (worüber = about what). prep + wem = for PEOPLE (über wen = about whom)</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
