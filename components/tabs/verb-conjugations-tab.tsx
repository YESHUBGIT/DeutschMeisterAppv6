"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"

const pronouns = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"]

type VerbTense = {
  id: string
  label: string
  forms: string[]
  note?: string
}

type VerbEntry = {
  id: string
  title: string
  meaning: string
  tenses: VerbTense[]
}

type VerbSection = {
  id: string
  label: string
  description: string
  verbs: VerbEntry[]
}

const verbSections: VerbSection[] = [
  {
    id: "modal",
    label: "Modal Verbs",
    description: "All modal verbs with core tenses and Konjunktiv II.",
    verbs: [
      {
        id: "koennen",
        title: "können",
        meaning: "can / to be able to",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["kann", "kannst", "kann", "können", "könnt", "können"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["konnte", "konntest", "konnte", "konnten", "konntet", "konnten"],
          },
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["könnte", "könntest", "könnte", "könnten", "könntet", "könnten"],
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["habe gekonnt", "hast gekonnt", "hat gekonnt", "haben gekonnt", "habt gekonnt", "haben gekonnt"],
          },
        ],
      },
      {
        id: "muessen",
        title: "müssen",
        meaning: "must / have to",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["muss", "musst", "muss", "müssen", "müsst", "müssen"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["musste", "musstest", "musste", "mussten", "musstet", "mussten"],
          },
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["müsste", "müsstest", "müsste", "müssten", "müsstet", "müssten"],
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["habe gemusst", "hast gemusst", "hat gemusst", "haben gemusst", "habt gemusst", "haben gemusst"],
          },
        ],
      },
      {
        id: "wollen",
        title: "wollen",
        meaning: "want to",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["will", "willst", "will", "wollen", "wollt", "wollen"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["wollte", "wolltest", "wollte", "wollten", "wolltet", "wollten"],
          },
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["wollte", "wolltest", "wollte", "wollten", "wolltet", "wollten"],
            note: "Same form as Präteritum.",
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["habe gewollt", "hast gewollt", "hat gewollt", "haben gewollt", "habt gewollt", "haben gewollt"],
          },
        ],
      },
      {
        id: "sollen",
        title: "sollen",
        meaning: "should / supposed to",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["soll", "sollst", "soll", "sollen", "sollt", "sollen"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["sollte", "solltest", "sollte", "sollten", "solltet", "sollten"],
          },
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["sollte", "solltest", "sollte", "sollten", "solltet", "sollten"],
            note: "Same form as Präteritum.",
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["habe gesollt", "hast gesollt", "hat gesollt", "haben gesollt", "habt gesollt", "haben gesollt"],
          },
        ],
      },
      {
        id: "duerfen",
        title: "dürfen",
        meaning: "may / to be allowed",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["darf", "darfst", "darf", "dürfen", "dürft", "dürfen"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["durfte", "durftest", "durfte", "durften", "durftet", "durften"],
          },
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["dürfte", "dürftest", "dürfte", "dürften", "dürftet", "dürften"],
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["habe gedurft", "hast gedurft", "hat gedurft", "haben gedurft", "habt gedurft", "haben gedurft"],
          },
        ],
      },
      {
        id: "moegen",
        title: "mögen",
        meaning: "to like",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["mag", "magst", "mag", "mögen", "mögt", "mögen"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["mochte", "mochtest", "mochte", "mochten", "mochtet", "mochten"],
          },
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["möchte", "möchtest", "möchte", "möchten", "möchtet", "möchten"],
            note: "Möchte is the common polite form.",
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["habe gemocht", "hast gemocht", "hat gemocht", "haben gemocht", "habt gemocht", "haben gemocht"],
          },
        ],
      },
    ],
  },
  {
    id: "konj2",
    label: "Konjunktiv II",
    description: "Core Konjunktiv II verbs and their past forms.",
    verbs: [
      {
        id: "sein-konj",
        title: "sein (wäre)",
        meaning: "would be",
        tenses: [
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["wäre", "wärest", "wäre", "wären", "wäret", "wären"],
          },
          {
            id: "konj2-past",
            label: "Konjunktiv II Vergangenheit",
            forms: ["wäre gewesen", "wärst gewesen", "wäre gewesen", "wären gewesen", "wärt gewesen", "wären gewesen"],
          },
        ],
      },
      {
        id: "haben-konj",
        title: "haben (hätte)",
        meaning: "would have",
        tenses: [
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["hätte", "hättest", "hätte", "hätten", "hättet", "hätten"],
          },
          {
            id: "konj2-past",
            label: "Konjunktiv II Vergangenheit",
            forms: ["hätte gehabt", "hättest gehabt", "hätte gehabt", "hätten gehabt", "hättet gehabt", "hätten gehabt"],
          },
        ],
      },
      {
        id: "werden-konj",
        title: "werden (würde)",
        meaning: "would (auxiliary)",
        tenses: [
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["würde", "würdest", "würde", "würden", "würdet", "würden"],
          },
          {
            id: "konj2-past",
            label: "Konjunktiv II Vergangenheit",
            forms: ["wäre geworden", "wärst geworden", "wäre geworden", "wären geworden", "wärt geworden", "wären geworden"],
          },
        ],
      },
      {
        id: "koennen-konj",
        title: "können (könnte)",
        meaning: "could",
        tenses: [
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["könnte", "könntest", "könnte", "könnten", "könntet", "könnten"],
          },
          {
            id: "konj2-past",
            label: "Konjunktiv II Vergangenheit",
            forms: ["hätte gekonnt", "hättest gekonnt", "hätte gekonnt", "hätten gekonnt", "hättet gekonnt", "hätten gekonnt"],
          },
        ],
      },
      {
        id: "muessen-konj",
        title: "müssen (müsste)",
        meaning: "would have to",
        tenses: [
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["müsste", "müsstest", "müsste", "müssten", "müsstet", "müssten"],
          },
          {
            id: "konj2-past",
            label: "Konjunktiv II Vergangenheit",
            forms: ["hätte gemusst", "hättest gemusst", "hätte gemusst", "hätten gemusst", "hättet gemusst", "hätten gemusst"],
          },
        ],
      },
      {
        id: "sollen-konj",
        title: "sollen (sollte)",
        meaning: "should",
        tenses: [
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["sollte", "solltest", "sollte", "sollten", "solltet", "sollten"],
          },
          {
            id: "konj2-past",
            label: "Konjunktiv II Vergangenheit",
            forms: ["hätte gesollt", "hättest gesollt", "hätte gesollt", "hätten gesollt", "hättet gesollt", "hätten gesollt"],
          },
        ],
      },
      {
        id: "duerfen-konj",
        title: "dürfen (dürfte)",
        meaning: "might be allowed",
        tenses: [
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["dürfte", "dürftest", "dürfte", "dürften", "dürftet", "dürften"],
          },
          {
            id: "konj2-past",
            label: "Konjunktiv II Vergangenheit",
            forms: ["hätte gedurft", "hättest gedurft", "hätte gedurft", "hätten gedurft", "hättet gedurft", "hätten gedurft"],
          },
        ],
      },
      {
        id: "wollen-konj",
        title: "wollen (wollte)",
        meaning: "would want",
        tenses: [
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["wollte", "wolltest", "wollte", "wollten", "wolltet", "wollten"],
          },
          {
            id: "konj2-past",
            label: "Konjunktiv II Vergangenheit",
            forms: ["hätte gewollt", "hättest gewollt", "hätte gewollt", "hätten gewollt", "hättet gewollt", "hätten gewollt"],
          },
        ],
      },
      {
        id: "moegen-konj",
        title: "mögen (möchte)",
        meaning: "would like",
        tenses: [
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["möchte", "möchtest", "möchte", "möchten", "möchtet", "möchten"],
          },
          {
            id: "konj2-past",
            label: "Konjunktiv II Vergangenheit",
            forms: ["hätte gemocht", "hättest gemocht", "hätte gemocht", "hätten gemocht", "hättet gemocht", "hätten gemocht"],
          },
        ],
      },
    ],
  },
  {
    id: "werden",
    label: "Werden Forms",
    description: "Werden as a full verb, future helper, passive helper, and Konjunktiv II.",
    verbs: [
      {
        id: "werden-full",
        title: "werden (full verb)",
        meaning: "to become",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["werde", "wirst", "wird", "werden", "werdet", "werden"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["wurde", "wurdest", "wurde", "wurden", "wurdet", "wurden"],
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["bin geworden", "bist geworden", "ist geworden", "sind geworden", "seid geworden", "sind geworden"],
          },
          {
            id: "plusquam",
            label: "Plusquamperfekt",
            forms: ["war geworden", "warst geworden", "war geworden", "waren geworden", "wart geworden", "waren geworden"],
          },
          {
            id: "futur",
            label: "Futur I",
            forms: ["werde werden", "wirst werden", "wird werden", "werden werden", "werdet werden", "werden werden"],
          },
        ],
      },
      {
        id: "werden-future",
        title: "werden (future helper)",
        meaning: "will (auxiliary)",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["werde", "wirst", "wird", "werden", "werdet", "werden"],
            note: "Use + Infinitiv: Ich werde lernen.",
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["wurde", "wurdest", "wurde", "wurden", "wurdet", "wurden"],
            note: "Use + Infinitiv (rare): Ich wurde lernen.",
          },
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["würde", "würdest", "würde", "würden", "würdet", "würden"],
            note: "Use + Infinitiv: Ich würde lernen.",
          },
        ],
      },
      {
        id: "werden-passive",
        title: "werden (passive helper)",
        meaning: "is/was done",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["werde", "wirst", "wird", "werden", "werdet", "werden"],
            note: "Use + Partizip II: Es wird gemacht.",
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["wurde", "wurdest", "wurde", "wurden", "wurdet", "wurden"],
            note: "Use + Partizip II: Es wurde gemacht.",
          },
          {
            id: "konj2",
            label: "Konjunktiv II",
            forms: ["würde", "würdest", "würde", "würden", "würdet", "würden"],
            note: "Use + Partizip II: Es würde gemacht.",
          },
        ],
      },
    ],
  },
  {
    id: "core",
    label: "Core Verbs",
    description: "High-frequency verbs with the main tenses.",
    verbs: [
      {
        id: "sein",
        title: "sein",
        meaning: "to be",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["bin", "bist", "ist", "sind", "seid", "sind"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["war", "warst", "war", "waren", "wart", "waren"],
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["bin gewesen", "bist gewesen", "ist gewesen", "sind gewesen", "seid gewesen", "sind gewesen"],
          },
        ],
      },
      {
        id: "haben",
        title: "haben",
        meaning: "to have",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["habe", "hast", "hat", "haben", "habt", "haben"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["hatte", "hattest", "hatte", "hatten", "hattet", "hatten"],
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["habe gehabt", "hast gehabt", "hat gehabt", "haben gehabt", "habt gehabt", "haben gehabt"],
          },
        ],
      },
      {
        id: "gehen",
        title: "gehen",
        meaning: "to go",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["gehe", "gehst", "geht", "gehen", "geht", "gehen"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["ging", "gingst", "ging", "gingen", "gingt", "gingen"],
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["bin gegangen", "bist gegangen", "ist gegangen", "sind gegangen", "seid gegangen", "sind gegangen"],
          },
        ],
      },
      {
        id: "kommen",
        title: "kommen",
        meaning: "to come",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["komme", "kommst", "kommt", "kommen", "kommt", "kommen"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["kam", "kamst", "kam", "kamen", "kamt", "kamen"],
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["bin gekommen", "bist gekommen", "ist gekommen", "sind gekommen", "seid gekommen", "sind gekommen"],
          },
        ],
      },
      {
        id: "sehen",
        title: "sehen",
        meaning: "to see",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["sehe", "siehst", "sieht", "sehen", "seht", "sehen"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["sah", "sahst", "sah", "sahen", "saht", "sahen"],
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["habe gesehen", "hast gesehen", "hat gesehen", "haben gesehen", "habt gesehen", "haben gesehen"],
          },
        ],
      },
      {
        id: "geben",
        title: "geben",
        meaning: "to give",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["gebe", "gibst", "gibt", "geben", "gebt", "geben"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["gab", "gabst", "gab", "gaben", "gabt", "gaben"],
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["habe gegeben", "hast gegeben", "hat gegeben", "haben gegeben", "habt gegeben", "haben gegeben"],
          },
        ],
      },
      {
        id: "nehmen",
        title: "nehmen",
        meaning: "to take",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["nehme", "nimmst", "nimmt", "nehmen", "nehmt", "nehmen"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["nahm", "nahmst", "nahm", "nahmen", "nahmt", "nahmen"],
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["habe genommen", "hast genommen", "hat genommen", "haben genommen", "habt genommen", "haben genommen"],
          },
        ],
      },
      {
        id: "sprechen",
        title: "sprechen",
        meaning: "to speak",
        tenses: [
          {
            id: "present",
            label: "Präsens",
            forms: ["spreche", "sprichst", "spricht", "sprechen", "sprecht", "sprechen"],
          },
          {
            id: "preterite",
            label: "Präteritum",
            forms: ["sprach", "sprachst", "sprach", "sprachen", "spracht", "sprachen"],
          },
          {
            id: "perfect",
            label: "Perfekt",
            forms: ["habe gesprochen", "hast gesprochen", "hat gesprochen", "haben gesprochen", "habt gesprochen", "haben gesprochen"],
          },
        ],
      },
    ],
  },
]

export function VerbConjugationsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSection, setActiveSection] = useState(verbSections[0]?.id ?? "modal")
  const [selectedVerbIdBySection, setSelectedVerbIdBySection] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return null
    }

    const matches = verbSections.flatMap(section =>
      section.verbs
        .filter(verb =>
          verb.title.toLowerCase().includes(query) ||
          verb.meaning.toLowerCase().includes(query)
        )
        .map(verb => ({
          section: section.label,
          verb,
        }))
    )

    return matches
  }, [searchQuery])

  const sectionsToRender = filtered ? [] : verbSections

  const getSelectedVerb = (section: VerbSection) => {
    const selectedId = selectedVerbIdBySection[section.id] ?? section.verbs[0]?.id
    return section.verbs.find(verb => verb.id === selectedId) ?? section.verbs[0]
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4 py-6">
        <h1 className="text-4xl font-bold text-foreground">Verb Conjugations</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Search a verb or explore modal verbs, Konjunktiv II, and core tenses with clean conjugation tables.
        </p>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search verbs (e.g., gehen, können, wäre)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filtered ? (
        <div className="space-y-4">
          <Card className="bg-muted/40">
            <CardContent className="py-3 text-sm text-muted-foreground">
              {filtered.length} result{filtered.length === 1 ? "" : "s"} found
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Verb List</CardTitle>
              <CardDescription>Click a verb to view its conjugation tables.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(({ section, verb }) => (
                <button
                  key={`${section}-${verb.id}`}
                  type="button"
                  className="rounded-lg border border-border px-3 py-2 text-left text-sm font-medium hover:bg-muted"
                  onClick={() => setSelectedVerbIdBySection(prev => ({
                    ...prev,
                    [section]: verb.id,
                  }))}
                >
                  <span className="block text-foreground">{verb.title}</span>
                  <span className="text-xs text-muted-foreground">{verb.meaning}</span>
                </button>
              ))}
            </CardContent>
          </Card>
          {filtered.map(({ section, verb }) => (
            selectedVerbIdBySection[section] === verb.id ? (
              <VerbCard key={`${section}-${verb.id}`} verb={verb} sectionLabel={section} />
            ) : null
          ))}
        </div>
      ) : (
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-4">
          <TabsList className="flex flex-wrap gap-2 h-auto">
            {sectionsToRender.map((section) => (
              <TabsTrigger key={section.id} value={section.id} className="px-4">
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {sectionsToRender.map((section) => (
            <TabsContent key={section.id} value={section.id} className="space-y-4">
              <Card className="bg-muted/40">
                <CardContent className="py-4 text-sm text-muted-foreground">
                  {section.description}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Verb List</CardTitle>
                  <CardDescription>Select a verb to show its conjugation tables.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {section.verbs.map((verb) => (
                    <button
                      key={verb.id}
                      type="button"
                      className="rounded-lg border border-border px-3 py-2 text-left text-sm font-medium hover:bg-muted"
                      onClick={() => setSelectedVerbIdBySection(prev => ({
                        ...prev,
                        [section.id]: verb.id,
                      }))}
                    >
                      <span className="block text-foreground">{verb.title}</span>
                      <span className="text-xs text-muted-foreground">{verb.meaning}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
              {getSelectedVerb(section) && (
                <VerbCard verb={getSelectedVerb(section)} sectionLabel={section.label} />
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}

interface VerbCardProps {
  verb: VerbEntry
  sectionLabel: string
}

function VerbCard({ verb, sectionLabel }: VerbCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{verb.title}</CardTitle>
        <CardDescription>
          {verb.meaning} · {sectionLabel}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={verb.tenses[0]?.id} className="space-y-4">
          <TabsList className="flex flex-wrap gap-2 h-auto">
            {verb.tenses.map((tense) => (
              <TabsTrigger key={tense.id} value={tense.id} className="px-3">
                {tense.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {verb.tenses.map((tense) => (
            <TabsContent key={tense.id} value={tense.id}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-3 py-2 text-left font-semibold">Pronoun</th>
                      <th className="border border-border px-3 py-2 text-left font-semibold">Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pronouns.map((pronoun, index) => (
                      <tr key={`${tense.id}-${pronoun}`} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                        <td className="border border-border px-3 py-2 font-medium">{pronoun}</td>
                        <td className="border border-border px-3 py-2">{tense.forms[index]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {tense.note && (
                <p className="mt-3 text-xs text-muted-foreground">{tense.note}</p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
