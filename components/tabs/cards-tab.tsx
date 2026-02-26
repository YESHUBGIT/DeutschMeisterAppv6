"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCcw, ChevronLeft, ChevronRight, Check, X, Shuffle, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { lessonCatalog } from "@/lib/lesson-catalog"

const cardDecks = [
  {
    id: "pronouns",
    title: "Personal Pronouns",
    description: "ich, du, er, sie, es, wir, ihr, sie, Sie",
    lessonId: "personal-pronouns",
    cards: [
      { id: 1, front: "ich", back: "I", hint: "Always lowercase unless starting sentence" },
      { id: 2, front: "du", back: "you (informal)", hint: "For friends, family, children" },
      { id: 3, front: "er", back: "he", hint: "Masculine pronoun" },
      { id: 4, front: "sie", back: "she", hint: "Feminine pronoun (lowercase)" },
      { id: 5, front: "es", back: "it", hint: "Neuter pronoun" },
      { id: 6, front: "wir", back: "we", hint: "First person plural" },
      { id: 7, front: "ihr", back: "you all (informal)", hint: "Plural informal" },
      { id: 8, front: "sie", back: "they", hint: "Third person plural (lowercase)" },
      { id: 9, front: "Sie", back: "you (formal)", hint: "Always capitalized!" },
    ],
  },
  {
    id: "possessives",
    title: "Possessive Articles",
    description: "mein, dein, sein, ihr, unser, euer, Ihr",
    lessonId: "possessive-articles",
    cards: [
      { id: 1, front: "mein", back: "my", hint: "From ich" },
      { id: 2, front: "dein", back: "your (informal)", hint: "From du" },
      { id: 3, front: "sein", back: "his / its", hint: "From er/es" },
      { id: 4, front: "ihr", back: "her", hint: "From sie (she)" },
      { id: 5, front: "unser", back: "our", hint: "From wir" },
      { id: 6, front: "euer", back: "your (pl. informal)", hint: "Loses 'e' with endings" },
      { id: 7, front: "ihr", back: "their", hint: "From sie (they)" },
      { id: 8, front: "Ihr", back: "your (formal)", hint: "Always capitalized!" },
    ],
  },
  {
    id: "prepositions-akk",
    title: "Accusative Prepositions (DOGFU)",
    description: "durch, ohne, gegen, für, um",
    lessonId: "prepositions-by-case",
    cards: [
      { id: 1, front: "durch", back: "through", hint: "Always Accusative" },
      { id: 2, front: "ohne", back: "without", hint: "Always Accusative" },
      { id: 3, front: "gegen", back: "against", hint: "Always Accusative" },
      { id: 4, front: "für", back: "for", hint: "Always Accusative" },
      { id: 5, front: "um", back: "around / at (time)", hint: "Always Accusative" },
      { id: 6, front: "durch den Park", back: "through the park", hint: "der Park → den Park (Akk)" },
      { id: 7, front: "für mich", back: "for me", hint: "ich → mich (Akk)" },
      { id: 8, front: "ohne dich", back: "without you", hint: "du → dich (Akk)" },
    ],
  },
  {
    id: "prepositions-dat",
    title: "Dative Prepositions",
    description: "aus, bei, mit, nach, seit, von, zu",
    lessonId: "prepositions-by-case",
    cards: [
      { id: 1, front: "aus", back: "out of / from", hint: "Always Dative" },
      { id: 2, front: "bei", back: "at / near / with", hint: "Always Dative" },
      { id: 3, front: "mit", back: "with", hint: "Always Dative" },
      { id: 4, front: "nach", back: "after / to (places)", hint: "Always Dative" },
      { id: 5, front: "seit", back: "since / for (time)", hint: "Always Dative" },
      { id: 6, front: "von", back: "from / of", hint: "Always Dative" },
      { id: 7, front: "zu", back: "to", hint: "Always Dative" },
      { id: 8, front: "mit dem Bus", back: "by bus", hint: "der Bus → dem Bus (Dat)" },
      { id: 9, front: "zum Bahnhof", back: "to the train station", hint: "zu + dem = zum" },
      { id: 10, front: "zur Schule", back: "to school", hint: "zu + der = zur" },
    ],
  },
  {
    id: "connectors",
    title: "Connectors & Verb Position",
    description: "Learn which connectors change verb position",
    lessonId: "connectors-verb-position",
    cards: [
      { id: 1, front: "und", back: "and (no change)", hint: "Type 0 - verb stays in position 2" },
      { id: 2, front: "aber", back: "but (no change)", hint: "Type 0 - verb stays in position 2" },
      { id: 3, front: "weil", back: "because (verb → end)", hint: "Type 1 - verb goes to END" },
      { id: 4, front: "dass", back: "that (verb → end)", hint: "Type 1 - verb goes to END" },
      { id: 5, front: "wenn", back: "if/when (verb → end)", hint: "Type 1 - verb goes to END" },
      { id: 6, front: "obwohl", back: "although (verb → end)", hint: "Type 1 - verb goes to END" },
      { id: 7, front: "deshalb", back: "therefore (verb first)", hint: "Type 2 - verb right after" },
      { id: 8, front: "trotzdem", back: "nevertheless (verb first)", hint: "Type 2 - verb right after" },
      { id: 9, front: "...weil ich müde bin.", back: "...because I am tired.", hint: "bin at END" },
      { id: 10, front: "Deshalb bleibe ich.", back: "Therefore I stay.", hint: "bleibe right after" },
    ],
  },
  {
    id: "modal-present",
    title: "Modal Verbs - Present",
    description: "können, müssen, wollen, dürfen, sollen, mögen",
    lessonId: "modal-verbs",
    cards: [
      { id: 1, front: "Ich kann es machen", back: "I can do it", hint: "können - ability" },
      { id: 2, front: "Ich darf es machen", back: "I may do it (allowed)", hint: "dürfen - permission" },
      { id: 3, front: "Ich muss es machen", back: "I must/have to do it", hint: "müssen - necessity" },
      { id: 4, front: "Ich soll es machen", back: "I shall/am supposed to do it", hint: "sollen - obligation" },
      { id: 5, front: "Ich will es machen", back: "I want to do it", hint: "wollen - desire" },
      { id: 6, front: "Ich mache es gern", back: "I like to do it", hint: "mögen/gern - preference" },
      { id: 7, front: "Ich kann Deutsch sprechen.", back: "I can speak German.", hint: "Main verb at end" },
      { id: 8, front: "Ich muss morgen arbeiten.", back: "I must work tomorrow.", hint: "müssen" },
    ],
  },
  {
    id: "modal-konjunktiv",
    title: "Modal Verbs - Konjunktiv II",
    description: "Polite/hypothetical: could, would, should",
    lessonId: "konjunktiv-2",
    cards: [
      { id: 1, front: "Ich könnte es machen", back: "I could do it", hint: "Polite/hypothetical" },
      { id: 2, front: "Ich dürfte es machen", back: "I might be allowed to do it", hint: "Polite permission" },
      { id: 3, front: "Ich müsste es machen", back: "I would have to do it", hint: "Hypothetical necessity" },
      { id: 4, front: "Ich sollte es machen", back: "I should do it", hint: "Advice" },
      { id: 5, front: "Ich wollte es machen", back: "I would want to do it", hint: "Past intention" },
      { id: 6, front: "Ich möchte es machen", back: "I would like to do it", hint: "Very polite" },
      { id: 7, front: "Könnten Sie mir helfen?", back: "Could you help me?", hint: "Very polite request" },
      { id: 8, front: "Ich möchte einen Kaffee.", back: "I would like a coffee.", hint: "Polite order" },
    ],
  },
  {
    id: "past-conditional",
    title: "Past Conditional",
    description: "Would have / could have / should have",
    lessonId: "konjunktiv-2",
    cards: [
      { id: 1, front: "Ich hätte es machen können", back: "I could have done it", hint: "But I didn't" },
      { id: 2, front: "Ich hätte es machen dürfen", back: "I may have been allowed to do it", hint: "Missed opportunity" },
      { id: 3, front: "Ich hätte es machen müssen", back: "I would have had to do it", hint: "Obligation not met" },
      { id: 4, front: "Ich hätte es machen sollen", back: "I should have done it", hint: "Regret" },
      { id: 5, front: "Ich hätte es machen wollen", back: "I would have wanted to do it", hint: "Wish" },
      { id: 6, front: "Ich hätte mehr lernen sollen.", back: "I should have studied more.", hint: "Regret about past" },
      { id: 7, front: "Ich hätte das machen können.", back: "I could have done that.", hint: "Missed ability" },
      { id: 8, front: "hätte/wäre + Infinitiv + Modal", back: "Past conditional formula", hint: "Key pattern!" },
    ],
  },
  {
    id: "werden-uses",
    title: "WERDEN - 3 Uses",
    description: "Full verb, future helper, passive helper",
    lessonId: "werden-forms",
    cards: [
      { id: 1, front: "Er wird müde.", back: "He is becoming tired.", hint: "Full verb = to become" },
      { id: 2, front: "Er wurde müde.", back: "He became tired.", hint: "Präteritum of werden" },
      { id: 3, front: "Er ist müde geworden.", back: "He has become tired.", hint: "Perfekt of werden" },
      { id: 4, front: "Er wird müde werden.", back: "He will become tired.", hint: "Futur I" },
      { id: 5, front: "Ich werde lernen.", back: "I will learn.", hint: "Future helper" },
      { id: 6, front: "Ich würde lernen.", back: "I would learn.", hint: "Konjunktiv II form" },
      { id: 7, front: "Die Arbeit wird gemacht.", back: "The work is being done.", hint: "Passive present" },
      { id: 8, front: "Die Arbeit wurde gemacht.", back: "The work was done.", hint: "Passive past" },
    ],
  },
  {
    id: "passive-voice",
    title: "Passive Voice Tenses",
    description: "werden + Partizip II across all tenses",
    lessonId: "passive-voice",
    cards: [
      { id: 1, front: "Das Buch wird gelesen.", back: "The book is being read.", hint: "Präsens Passiv" },
      { id: 2, front: "Das Buch wurde gelesen.", back: "The book was read.", hint: "Präteritum Passiv" },
      { id: 3, front: "Das Buch ist gelesen worden.", back: "The book has been read.", hint: "Perfekt Passiv - worden!" },
      { id: 4, front: "Das Buch war gelesen worden.", back: "The book had been read.", hint: "Plusquamperfekt Passiv" },
      { id: 5, front: "Das Buch wird gelesen werden.", back: "The book will be read.", hint: "Futur I Passiv" },
      { id: 6, front: "Das Buch würde gelesen werden.", back: "The book would be read.", hint: "Konj. II Passiv" },
      { id: 7, front: "Das Buch muss gelesen werden.", back: "The book must be read.", hint: "Modal + Passive" },
      { id: 8, front: "worden (not geworden)", back: "Use 'worden' in Passive Perfekt!", hint: "Key difference!" },
    ],
  },
  {
    id: "active-vs-passive",
    title: "Active vs Passive Comparison",
    description: "Side-by-side tense comparison",
    lessonId: "passive-voice",
    cards: [
      { id: 1, front: "Ich lese ein Buch.", back: "Das Buch wird gelesen.", hint: "Präsens: Active vs Passive" },
      { id: 2, front: "Ich las ein Buch.", back: "Das Buch wurde gelesen.", hint: "Präteritum: Active vs Passive" },
      { id: 3, front: "Ich habe ein Buch gelesen.", back: "Das Buch ist gelesen worden.", hint: "Perfekt: gelesen vs worden" },
      { id: 4, front: "Ich hatte ein Buch gelesen.", back: "Das Buch war gelesen worden.", hint: "Plusquamperfekt" },
      { id: 5, front: "Ich werde ein Buch lesen.", back: "Das Buch wird gelesen werden.", hint: "Futur I" },
      { id: 6, front: "Ich würde ein Buch lesen.", back: "Das Buch würde gelesen werden.", hint: "Konjunktiv II" },
      { id: 7, front: "Ich hätte ein Buch gelesen.", back: "Das Buch wäre gelesen worden.", hint: "Konj. II Vergangenheit" },
      { id: 8, front: "Passive = Subject receives action", back: "werden + Partizip II", hint: "Core formula!" },
    ],
  },
  {
    id: "modal-perfect",
    title: "Modal + Perfect Infinitive",
    description: "Assumptions about the past",
    lessonId: "konjunktiv-2",
    cards: [
      { id: 1, front: "Er könnte das gesagt haben.", back: "He might have said that.", hint: "Possibility - können" },
      { id: 2, front: "Er dürfte schon angekommen sein.", back: "He is likely to have arrived already.", hint: "Probability - dürfen" },
      { id: 3, front: "Er muss den Fehler gemacht haben.", back: "He must have made the mistake.", hint: "Deduction - müssen" },
      { id: 4, front: "Er soll viel verdient haben.", back: "He is said to have earned a lot.", hint: "Hearsay - sollen" },
      { id: 5, front: "Er will das allein geschafft haben.", back: "He claims to have done it alone.", hint: "Self-claim - wollen" },
      { id: 6, front: "Modal + Partizip II + haben/sein", back: "Assumptions about past formula", hint: "Key pattern!" },
      { id: 7, front: "Sie muss krank gewesen sein.", back: "She must have been sick.", hint: "muss + gewesen sein" },
      { id: 8, front: "Das kann nicht passiert sein!", back: "That can't have happened!", hint: "Impossibility" },
    ],
  },
  {
    id: "question-words",
    title: "Question Words",
    description: "W-Fragen and prepositional questions",
    lessonId: "question-words",
    cards: [
      { id: 1, front: "was", back: "what", hint: "Basic W-question" },
      { id: 2, front: "wer", back: "who (nom)", hint: "Subject question" },
      { id: 3, front: "wen", back: "whom (acc)", hint: "Direct object question" },
      { id: 4, front: "wem", back: "whom (dat)", hint: "Indirect object question" },
      { id: 5, front: "worüber", back: "about what", hint: "For THINGS - wo + über" },
      { id: 6, front: "über wen", back: "about whom", hint: "For PEOPLE" },
      { id: 7, front: "womit", back: "with what", hint: "For THINGS" },
      { id: 8, front: "mit wem", back: "with whom", hint: "For PEOPLE" },
    ],
  },
  {
    id: "dative-verbs",
    title: "Dative Verbs",
    description: "Verbs that ALWAYS take Dative",
    lessonId: "cases-basics",
    cards: [
      { id: 1, front: "helfen + Dat", back: "to help", hint: "Ich helfe DIR" },
      { id: 2, front: "danken + Dat", back: "to thank", hint: "Ich danke DIR" },
      { id: 3, front: "gefallen + Dat", back: "to please", hint: "Es gefällt MIR" },
      { id: 4, front: "gehören + Dat", back: "to belong to", hint: "Das gehört MIR" },
      { id: 5, front: "folgen + Dat", back: "to follow", hint: "Ich folge DIR" },
      { id: 6, front: "antworten + Dat", back: "to answer", hint: "Ich antworte DIR" },
      { id: 7, front: "glauben + Dat", back: "to believe", hint: "Ich glaube DIR" },
      { id: 8, front: "schmecken + Dat", back: "to taste (good to)", hint: "Es schmeckt MIR" },
    ],
  },
  {
    id: "reflexive",
    title: "Reflexive Verbs",
    description: "Verbs that require reflexive pronouns",
    lessonId: "reflexive-verbs",
    cards: [
      { id: 1, front: "sich freuen auf + Akk", back: "to look forward to", hint: "Future event" },
      { id: 2, front: "sich freuen über + Akk", back: "to be happy about", hint: "Current/past event" },
      { id: 3, front: "sich interessieren für", back: "to be interested in", hint: "" },
      { id: 4, front: "sich erinnern an + Akk", back: "to remember", hint: "" },
      { id: 5, front: "sich treffen", back: "to meet (each other)", hint: "Wir treffen uns" },
      { id: 6, front: "sich vorstellen", back: "to imagine", hint: "Ich stelle mir vor (DAT)" },
      { id: 7, front: "sich beeilen", back: "to hurry", hint: "Beeil dich!" },
      { id: 8, front: "mich/dich/sich/uns/euch/sich", back: "Reflexive pronouns (Akk)", hint: "Most common" },
    ],
  },
]

interface CardsTabProps {
  selectedLesson?: string
  onLessonChange?: (lessonId: string) => void
}

export function CardsTab({ selectedLesson, onLessonChange }: CardsTabProps) {
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null)
  const [localLesson, setLocalLesson] = useState("all")
  const [cards, setCards] = useState<typeof cardDecks[0]["cards"]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const currentCard = cards[currentIndex]
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0
  const currentDeck = cardDecks.find(d => d.id === selectedDeck)

  const lessonValue = selectedLesson ?? localLesson
  const handleLessonValueChange = onLessonChange ?? setLocalLesson

  const filteredDecks = useMemo(() => {
    if (lessonValue === "all") {
      return cardDecks
    }

    return cardDecks.filter(deck => deck.lessonId === lessonValue)
  }, [lessonValue])

  const startDeck = (deckId: string) => {
    const deck = cardDecks.find(d => d.id === deckId)
    if (deck) {
      setSelectedDeck(deckId)
      setCards([...deck.cards])
      setCurrentIndex(0)
      setIsFlipped(false)
      setCorrect(0)
      setIncorrect(0)
      setShowResults(false)
    }
  }

  const handleFlip = () => setIsFlipped(!isFlipped)

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrect(prev => prev + 1)
    } else {
      setIncorrect(prev => prev + 1)
    }
    nextCard()
  }

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsFlipped(false)
    } else {
      setShowResults(true)
    }
  }

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setIsFlipped(false)
    }
  }

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
    setCorrect(0)
    setIncorrect(0)
    setShowResults(false)
  }

  const restart = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setCorrect(0)
    setIncorrect(0)
    setShowResults(false)
  }

  const backToDecks = () => {
    setSelectedDeck(null)
    setCards([])
    setShowResults(false)
  }

  // Deck Selection Screen
  if (!selectedDeck) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4 py-6">
          <h1 className="text-4xl font-bold text-foreground">Flashcards</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose a deck to practice. Includes all verb tenses and grammar topics.
          </p>
        </div>

        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">Lesson Filter</p>
                <p className="text-sm text-muted-foreground">Pick a lesson or study everything.</p>
              </div>
              <Select value={lessonValue} onValueChange={handleLessonValueChange}>
                <SelectTrigger className="w-full md:w-[320px]">
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
          </CardContent>
        </Card>

        {filteredDecks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No decks found for this lesson.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDecks.map((deck) => (
              <Card 
                key={deck.id}
                className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
                onClick={() => startDeck(deck.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{deck.title}</CardTitle>
                        <CardDescription className="text-xs">{deck.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{deck.cards.length} cards</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Results Screen
  if (showResults) {
    const percentage = Math.round((correct / cards.length) * 100)
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={backToDecks}>
          ← Back to Decks
        </Button>

        <div className="text-center space-y-4 py-6">
          <h1 className="text-4xl font-bold text-foreground">Session Complete!</h1>
          <p className="text-muted-foreground">{currentDeck?.title}</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="py-8 text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">{percentage}%</span>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">
                You got {correct} out of {cards.length} correct!
              </p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <Check className="w-4 h-4" /> {correct} correct
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <X className="w-4 h-4" /> {incorrect} incorrect
                </span>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={restart} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={shuffleCards}>
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle & Restart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Card Practice Screen
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={backToDecks}>
          ← Back to Decks
        </Button>
        <h2 className="font-semibold text-foreground">{currentDeck?.title}</h2>
        <div className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {cards.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center justify-center gap-6">
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
          <Check className="w-4 h-4" /> {correct}
        </span>
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
          <X className="w-4 h-4" /> {incorrect}
        </span>
      </div>

      {/* Flashcard */}
      <div className="max-w-md mx-auto perspective-1000">
        <div
          onClick={handleFlip}
          className={cn(
            "relative w-full h-64 cursor-pointer transition-transform duration-500 transform-style-preserve-3d"
          )}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <Card 
            className="absolute inset-0 backface-hidden flex items-center justify-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <CardContent className="text-center space-y-4">
              <p className="text-3xl font-bold text-foreground">{currentCard.front}</p>
              <p className="text-sm text-muted-foreground">{currentCard.hint}</p>
              <p className="text-xs text-primary">Click to flip</p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card 
            className="absolute inset-0 backface-hidden flex items-center justify-center bg-primary text-primary-foreground"
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
          >
            <CardContent className="text-center space-y-4">
              <p className="text-3xl font-bold">{currentCard.back}</p>
              <p className="text-sm opacity-80">Click to flip back</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={prevCard} disabled={currentIndex === 0}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => handleAnswer(false)}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <X className="w-5 h-5 mr-2" />
          Wrong
        </Button>
        
        <Button 
          size="lg"
          onClick={() => handleAnswer(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="w-5 h-5 mr-2" />
          Correct
        </Button>

        <Button variant="outline" size="icon" onClick={nextCard}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Shuffle Button */}
      <div className="flex justify-center">
        <Button variant="ghost" onClick={shuffleCards}>
          <Shuffle className="w-4 h-4 mr-2" />
          Shuffle Cards
        </Button>
      </div>
    </div>
  )
}
