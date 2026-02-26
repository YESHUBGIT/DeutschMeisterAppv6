"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, BookOpen, Target, Lightbulb, GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"

const coreTopics = [
  {
    id: 1,
    title: "WERDEN - The Multi-Purpose Verb",
    description: "Full verb, future, passive, and Konjunktiv II - all in one",
    featured: true,
    content: {
      explanation: "WERDEN is one of the most important verbs in German. It has four distinct uses: 1) Full verb meaning 'to become', 2) Auxiliary for future tense, 3) Auxiliary for passive voice, 4) würde-form for Konjunktiv II. Master werden and you unlock much of German grammar!",
      tables: [
        {
          title: "WERDEN Overview - 4 Functions",
          headers: ["Function", "Formula", "Example", "English"],
          rows: [
            ["Full verb (to become)", "werden alone", "Er wird müde.", "He becomes tired."],
            ["Future (Active)", "werden + Infinitiv", "Ich werde lernen.", "I will learn."],
            ["Passive Voice", "werden + Partizip II", "Es wird gemacht.", "It is being done."],
            ["Konjunktiv II", "würde + Infinitiv", "Ich würde gehen.", "I would go."],
          ],
        },
        {
          title: "WERDEN as Full Verb (to become) - All Tenses",
          headers: ["Tense", "German Form", "Example", "English"],
          rows: [
            ["Präsens", "werden", "Er wird müde.", "He becomes tired."],
            ["Präteritum", "wurden", "Er wurde müde.", "He became tired."],
            ["Perfekt", "sein + geworden", "Er ist müde geworden.", "He has become tired."],
            ["Plusquamperfekt", "war + geworden", "Er war müde geworden.", "He had become tired."],
            ["Futur I", "werden + Infinitiv", "Er wird müde werden.", "He will become tired."],
          ],
        },
        {
          title: "WERDEN as Auxiliary - Future (Active)",
          headers: ["Tense", "Formula", "Example", "English"],
          rows: [
            ["Präsens Futur I", "werden + Infinitiv", "Ich werde lernen.", "I will learn."],
            ["Präteritum Futur I (Konj II)", "würde + Infinitiv", "Ich würde lernen.", "I would learn."],
          ],
        },
      ],
    },
  },
  {
    id: 2,
    title: "Active Voice - Formula Table (All Tenses)",
    description: "Complete tense formulas for normal verbs and modal verbs",
    featured: true,
    content: {
      explanation: "Active voice is when the subject DOES the action. Here are the complete formulas for forming every tense in German, for both normal verbs and when combined with modal verbs.",
      tables: [
        {
          title: "Active Voice - Normal Verbs (lesen = to read)",
          headers: ["Tense", "Formula", "Example", "English"],
          rows: [
            ["Präsens", "verb stem + ending", "Ich lese ein Buch.", "I read / am reading a book."],
            ["Präteritum", "verb stem + Prät. ending", "Ich las ein Buch.", "I read a book. (past)"],
            ["Perfekt", "haben/sein + Partizip II", "Ich habe ein Buch gelesen.", "I have read a book."],
            ["Plusquamperfekt", "hatte/war + Partizip II", "Ich hatte ein Buch gelesen.", "I had read a book."],
            ["Futur I", "werden + Infinitiv", "Ich werde ein Buch lesen.", "I will read a book."],
            ["Futur II", "werden + P.II + haben/sein", "Ich werde ein Buch gelesen haben.", "I will have read a book."],
            ["Konjunktiv II Präsens", "würde + Infinitiv", "Ich würde ein Buch lesen.", "I would read a book."],
            ["Konjunktiv II Vergangen.", "hätte/wäre + Partizip II", "Ich hätte ein Buch gelesen.", "I would have read a book."],
          ],
        },
        {
          title: "Active Voice - With Modal Verbs (müssen + lesen)",
          headers: ["Tense", "Formula", "Example", "English"],
          rows: [
            ["Präsens", "modal (Präs.) + Infinitiv", "Ich muss ein Buch lesen.", "I must read a book."],
            ["Präteritum", "modal (Prät.) + Infinitiv", "Ich musste ein Buch lesen.", "I had to read a book."],
            ["Perfekt", "haben + Infinitiv + Modal (Inf.)", "Ich habe ein Buch lesen müssen.", "I have had to read a book."],
            ["Plusquamperfekt", "hatte + Infinitiv + Modal (Inf.)", "Ich hatte ein Buch lesen müssen.", "I had had to read a book."],
            ["Futur I", "werden + Infinitiv + Modal (Inf.)", "Ich werde ein Buch lesen müssen.", "I will have to read a book."],
            ["Futur II", "werden + Inf. + Modal + haben", "Ich werde ein Buch haben lesen müssen.", "I will have had to read a book."],
            ["Konjunktiv II Präsens", "modal (Konj. II) + Infinitiv", "Ich müsste ein Buch lesen.", "I would have to read a book."],
            ["Konjunktiv II Vergangen.", "hätte + Infinitiv + Modal (Inf.)", "Ich hätte ein Buch lesen müssen.", "I would have had to read a book."],
          ],
        },
      ],
    },
  },
  {
    id: 3,
    title: "Passive Voice - Formula Table (All Tenses)",
    description: "Complete passive formulas for normal verbs and modal verbs",
    featured: true,
    content: {
      explanation: "Passive voice is when the subject RECEIVES the action. German uses werden + Partizip II for passive. In Perfekt passive, use 'worden' NOT 'geworden'! Here are all the passive tense formulas.",
      tables: [
        {
          title: "Passive Voice - Normal Verbs (lesen = to read)",
          headers: ["Tense", "Formula", "Example", "English"],
          rows: [
            ["Präsens", "werden + Partizip II", "Das Buch wird gelesen.", "The book is (being) read."],
            ["Präteritum", "wurde + Partizip II", "Das Buch wurde gelesen.", "The book was read."],
            ["Perfekt", "sein + P.II + worden", "Das Buch ist gelesen worden.", "The book has been read."],
            ["Plusquamperfekt", "war + P.II + worden", "Das Buch war gelesen worden.", "The book had been read."],
            ["Futur I", "werden + P.II + werden", "Das Buch wird gelesen werden.", "The book will be read."],
            ["Futur II", "werden + P.II + worden + sein", "Das Buch wird gelesen worden sein.", "The book will have been read."],
            ["Konjunktiv II Präsens", "würde + P.II + werden", "Das Buch würde gelesen werden.", "The book would be read."],
            ["Konjunktiv II Vergangen.", "wäre + P.II + worden", "Das Buch wäre gelesen worden.", "The book would have been read."],
          ],
        },
        {
          title: "Passive Voice - With Modal Verbs (müssen + lesen)",
          headers: ["Tense", "Formula", "Example", "English"],
          rows: [
            ["Präsens", "modal + Infinitiv + werden", "Das Buch muss gelesen werden.", "The book must be read."],
            ["Präteritum", "modal (Prät.) + Inf. + werden", "Das Buch musste gelesen werden.", "The book had to be read."],
            ["Perfekt", "haben + Inf. + werden + Modal", "Das Buch hat gelesen werden müssen.", "The book has had to be read."],
            ["Plusquamperfekt", "hatte + Inf. + werden + Modal", "Das Buch hatte gelesen werden müssen.", "The book had had to be read."],
            ["Futur I", "wird + Inf. + werden + Modal", "Das Buch wird gelesen werden müssen.", "The book will have to be read."],
            ["Konjunktiv II Präsens", "müsste + Inf. + werden", "Das Buch müsste gelesen werden.", "The book would have to be read."],
            ["Konjunktiv II Vergangen.", "hätte + Inf. + werden + Modal", "Das Buch hätte gelesen werden müssen.", "The book would have had to be read."],
          ],
        },
      ],
    },
  },
  {
    id: 4,
    title: "Active vs Passive - Side by Side Comparison",
    description: "Direct comparison of active and passive in all tenses",
    featured: true,
    content: {
      explanation: "See active and passive side by side to understand how they relate. Active focuses on WHO does it, passive focuses on WHAT is done.",
      tables: [
        {
          title: "Active vs Passive (Normal Verbs only)",
          headers: ["Tense", "Active (lesen)", "Passive (lesen)"],
          rows: [
            ["Präsens", "Ich lese ein Buch. (I read a book)", "Das Buch wird gelesen. (The book is read)"],
            ["Präteritum", "Ich las ein Buch. (I read a book)", "Das Buch wurde gelesen. (The book was read)"],
            ["Perfekt", "Ich habe ein Buch gelesen. (I have read)", "Das Buch ist gelesen worden. (has been read)"],
            ["Plusquamperfekt", "Ich hatte ein Buch gelesen. (I had read)", "Das Buch war gelesen worden. (had been read)"],
            ["Futur I", "Ich werde ein Buch lesen. (I will read)", "Das Buch wird gelesen werden. (will be read)"],
            ["Konjunktiv II Präsens", "Ich würde ein Buch lesen. (I would read)", "Das Buch würde gelesen werden. (would be read)"],
            ["Konjunktiv II Vergangen.", "Ich hätte ein Buch gelesen. (would have read)", "Das Buch wäre gelesen worden. (would have been)"],
          ],
        },
      ],
    },
  },
  {
    id: 5,
    title: "Modal Verbs - Present & Konjunktiv II",
    description: "Complete modal verb tables with polite/hypothetical forms",
    featured: true,
    content: {
      explanation: "Modal verbs express ability, permission, obligation, desire. Present tense expresses facts, while Konjunktiv II expresses hypothetical/polite situations. The main verb goes in INFINITIVE at the END!",
      tables: [
        {
          title: "Modal Verbs - Present (Facts/Permission/Ability)",
          headers: ["English", "German", "Formula", "Example"],
          rows: [
            ["I can do it", "Ich kann es machen", "können + Infinitiv", "Ich kann Deutsch sprechen."],
            ["I may do it (allowed)", "Ich darf es machen", "dürfen + Infinitiv", "Ich darf hier parken."],
            ["I must / have to do it", "Ich muss es machen", "müssen + Infinitiv", "Ich muss morgen arbeiten."],
            ["I shall / am supposed to", "Ich soll es machen", "sollen + Infinitiv", "Ich soll das Projekt beenden."],
            ["I want to do it", "Ich will es machen", "wollen + Infinitiv", "Ich will nach Berlin fahren."],
            ["I like to do it", "Ich mag es / mache es gern", "mögen / gern machen", "Ich mache das gern."],
          ],
        },
        {
          title: "Modal Verbs - Konjunktiv II (Hypothetical/Polite)",
          headers: ["English", "German", "Example"],
          rows: [
            ["I could do it", "Ich könnte es machen", "Ich könnte morgen kommen."],
            ["I might be allowed to", "Ich dürfte es machen", "Ich dürfte länger bleiben."],
            ["I would have to do it", "Ich müsste es machen", "Ich müsste mehr lernen."],
            ["I should do it", "Ich sollte es machen", "Ich sollte früher ins Bett gehen."],
            ["I would want to do it", "Ich wollte es machen", "Ich wollte dir helfen."],
            ["I would like to do it", "Ich möchte es machen", "Ich möchte einen Kaffee."],
          ],
        },
      ],
    },
  },
  {
    id: 6,
    title: "Past Conditional (Would Have Done)",
    description: "hätte/wäre + Infinitiv + Modal - for counterfactual past",
    content: {
      explanation: "Past conditional expresses 'would have done' - things that didn't happen. Formula: hätte/wäre + Infinitiv + Modal (Infinitiv). This is the 'missed/counterfactual past' chapter!",
      tables: [
        {
          title: "Past Conditional with Modals",
          headers: ["English", "German", "Example"],
          rows: [
            ["I could have done it", "Ich hätte es machen können", "Ich hätte das machen können."],
            ["I may have been allowed", "Ich hätte es machen dürfen", "Ich hätte länger bleiben dürfen."],
            ["I would have had to do it", "Ich hätte es machen müssen", "Ich hätte gestern arbeiten müssen."],
            ["I should have done it", "Ich hätte es machen sollen", "Ich hätte mehr lernen sollen."],
            ["I would have wanted to", "Ich hätte es machen wollen", "Ich hätte helfen wollen."],
            ["I would have liked it", "Ich hätte es gemocht", "Ich hätte das gemocht."],
          ],
        },
      ],
    },
  },
  {
    id: 7,
    title: "Modal + Perfect Infinitive (Assumptions)",
    description: "Expressing 'may/might/must have done' - assumptions about the past",
    content: {
      explanation: "Modal (often Konjunktiv II) + Partizip II + haben/sein expresses assumptions about the past: possibility, probability, deduction, hearsay, or self-claims.",
      tables: [
        {
          title: "Modal + Perfect Infinitive (Epistemic)",
          headers: ["Meaning", "German Pattern", "Example"],
          rows: [
            ["Possibility ('may/might have')", "kann/könnte + P.II + haben", "Er könnte das gesagt haben."],
            ["Probability ('is likely to have')", "dürfte + P.II + haben", "Er dürfte schon angekommen sein."],
            ["Deduction ('must have')", "muss + P.II + haben", "Er muss den Fehler gemacht haben."],
            ["Hearsay ('is said to have')", "soll + P.II + haben", "Er soll viel verdient haben."],
            ["Self-claim ('claims to have')", "will + P.II + haben", "Er will das allein geschafft haben."],
          ],
        },
      ],
    },
  },
  {
    id: 8,
    title: "German Cases Overview",
    description: "Nominative, Accusative, Dative, Genitive - what they mean",
    content: {
      explanation: "Cases show the ROLE of a noun in a sentence. Nominative = subject (who/what does it). Accusative = direct object (who/what receives the action). Dative = indirect object (to/for whom). Genitive = possession (whose). Prepositions and some verbs FORCE specific cases.",
      tables: [
        {
          title: "When to Use Each Case",
          headers: ["Case", "Function", "Question", "Example"],
          rows: [
            ["Nominative", "Subject", "Wer? Was?", "DER Mann liest."],
            ["Accusative", "Direct object", "Wen? Was?", "Ich sehe DEN Mann."],
            ["Dative", "Indirect object", "Wem?", "Ich gebe DEM Mann das Buch."],
            ["Genitive", "Possession", "Wessen?", "Das Buch DES Mannes."],
          ],
        },
        {
          title: "Definite Article Changes",
          headers: ["Case", "Masculine", "Feminine", "Neuter", "Plural"],
          rows: [
            ["Nominative", "der", "die", "das", "die"],
            ["Accusative", "den", "die", "das", "die"],
            ["Dative", "dem", "der", "dem", "den (+n)"],
            ["Genitive", "des (+s)", "der", "des (+s)", "der"],
          ],
        },
      ],
    },
  },
  {
    id: 9,
    title: "Prepositions by Case",
    description: "Which prepositions take which case",
    content: {
      explanation: "Each preposition DEMANDS a specific case. Accusative prepositions (DOGFU): durch, ohne, gegen, für, um. Dative prepositions: aus, bei, mit, nach, seit, von, zu. Two-way prepositions take Accusative for motion/direction, Dative for location/state.",
      tables: [
        {
          title: "Accusative Prepositions (DOGFU)",
          headers: ["Preposition", "Meaning", "Example"],
          rows: [
            ["durch", "through", "durch den Park"],
            ["ohne", "without", "ohne mich"],
            ["gegen", "against", "gegen die Wand"],
            ["für", "for", "für meinen Vater"],
            ["um", "around / at (time)", "um den Tisch / um 8 Uhr"],
          ],
        },
        {
          title: "Dative Prepositions",
          headers: ["Preposition", "Meaning", "Example"],
          rows: [
            ["aus", "out of / from", "aus dem Haus"],
            ["bei", "at / near / with", "bei mir"],
            ["mit", "with", "mit dem Bus"],
            ["nach", "after / to (places)", "nach Hause"],
            ["seit", "since / for (time)", "seit einem Jahr"],
            ["von", "from / of", "von der Arbeit"],
            ["zu", "to", "zum Bahnhof (zu + dem)"],
          ],
        },
        {
          title: "Two-Way Prepositions",
          headers: ["Preposition", "Accusative (motion)", "Dative (location)"],
          rows: [
            ["in", "Ich gehe in DEN Park.", "Ich bin in DEM Park."],
            ["an", "Ich gehe an DIE Tafel.", "Ich stehe an DER Tafel."],
            ["auf", "Ich lege es auf DEN Tisch.", "Es liegt auf DEM Tisch."],
            ["über", "Das Flugzeug fliegt über DIE Stadt.", "Das Bild hängt über DEM Sofa."],
            ["unter", "Ich stelle es unter DEN Tisch.", "Es steht unter DEM Tisch."],
          ],
        },
      ],
    },
  },
  {
    id: 10,
    title: "Dative Verbs",
    description: "Verbs that ALWAYS take Dative",
    content: {
      explanation: "Some verbs always require the Dative case for their object, even though in English they take a direct object. These must be memorized! Key ones: helfen (help), danken (thank), gefallen (please), gehören (belong to), folgen (follow).",
      tables: [
        {
          title: "Common Dative Verbs",
          headers: ["Verb", "Meaning", "Example", "Translation"],
          rows: [
            ["helfen", "to help", "Ich helfe DIR.", "I help you."],
            ["danken", "to thank", "Ich danke DIR.", "I thank you."],
            ["gefallen", "to please", "Es gefällt MIR.", "I like it. (It pleases me)"],
            ["gehören", "to belong to", "Das gehört MIR.", "That belongs to me."],
            ["folgen", "to follow", "Ich folge DIR.", "I follow you."],
            ["antworten", "to answer", "Ich antworte DIR.", "I answer you."],
            ["glauben", "to believe", "Ich glaube DIR.", "I believe you."],
            ["passen", "to fit / suit", "Das passt MIR.", "That fits me."],
            ["schmecken", "to taste good", "Es schmeckt MIR.", "It tastes good to me."],
          ],
        },
      ],
    },
  },
{
  id: 11,
  title: "Connectors & Verb Position",
  description: "How different connectors change word order",
  content: {
    explanation:
      "Connectors glue ideas together. In German, the big effect is where the conjugated verb goes (BIN / IST / GEHST / KAM / BLEIBE…).\n\n" +

      "Type 0 = coordinating conjunctions: they connect two equal sentences. Verb order stays normal on both sides.\n" +
      "Type 1 = subordinating conjunctions: they start a dependent clause. In that clause, the conjugated verb goes to the END.\n" +
      "Type 2 = conjunctive adverbs: they act like 'sentence connectors' (therefore/however/then). They take position 1, so the verb comes immediately AFTER them.\n\n" +

      "Quick memory trick:\n" +
      "- Type 1 feels like: because / that / if / although / before / after / until… → verb at END.\n" +
      "- Type 2 feels like: therefore / however / then / besides… → verb right after.\n" +
      "- Type 0 feels like: and / or / but / because (denn) → normal order.\n\n" +

      "Common mistake: 'denn' vs 'weil'\n" +
      "- denn = Type 0 (no verb-to-end)\n" +
      "- weil = Type 1 (verb-to-end)",

    tables: [
      {
        title: "Type 0 - Coordinating (No Change)",
        headers: ["Connector", "Meaning", "Example"],
        rows: [
          ["und", "and", "Ich lerne, UND er arbeitet."],
          ["oder", "or", "Kommst du, ODER bleibst du?"],
          ["aber", "but", "Es regnet, ABER ich gehe."],
          ["denn", "because (coordinating)", "Ich bleibe, DENN ich bin müde."],
          ["sondern", "but rather (after negation)", "Nicht Tee, SONDERN Kaffee."],
          ["doch", "but / however (often after negation; also a particle)", "Er ist nicht krank, DOCH er bleibt zu Hause."],
        ],
      },

      {
        title: "Type 1 - Subordinating (Verb to END) — Core + Common",
        headers: ["Connector", "Meaning", "Example - verb at END"],
        rows: [
          // cause / reason
          ["weil", "because", "Ich bleibe zu Hause, weil ich müde BIN."],
          ["da", "since / because", "Da ich müde BIN, bleibe ich zu Hause."],

          // content / reported speech
          ["dass", "that", "Ich glaube, dass er krank IST."],

          // condition / alternative
          ["wenn", "if / when / whenever", "Ich rufe dich an, wenn du kommst."],
          ["falls", "in case", "Falls du Zeit HAST, komm vorbei."],
          ["sofern", "provided that", "Sofern alles klappt, kommen wir."],

          // concession
          ["obwohl", "although", "Ich gehe raus, obwohl es regnet."],
          ["obgleich", "although (formal)", "Er kam, obgleich er müde WAR."],
          ["obschon", "although (formal/rare)", "Obschon es spät WAR, blieb er."],

          // time
          ["als", "when (past, one-time)", "Als ich jung WAR, spielte ich viel."],
          ["wenn", "when (present/future/repeated)", "Wenn ich Zeit HABE, lese ich."],
          ["bevor", "before", "Ruf mich an, bevor du GEHST."],
          ["ehe", "before (formal)", "Ehe du GEHST, sag Bescheid."],
          ["nachdem", "after", "Nachdem er KAM, haben wir gegessen."],
          ["seit", "since", "Seit ich hier WOHNE, bin ich glücklich."],
          ["seitdem", "since (then)", "Seitdem ich hier WOHNE, bin ich glücklich."],
          ["sobald", "as soon as", "Sobald du da BIST, ruf an."],
          ["solange", "as long as", "Solange du lernst, wirst du besser."],
          ["während", "while", "Während ich koche, hört er Musik."],
          ["bis", "until", "Warte, bis ich fertig BIN."],
          ["sowie", "as soon as / once (sometimes)", "Sowie er da IST, starten wir."],

          // purpose / goal
          ["damit", "so that / in order that", "Ich spreche langsam, damit du mich verstehst."],

          // manner / method
          ["indem", "by doing", "Du lernst schneller, indem du übst."],

          // comparison / unreal
          ["als ob", "as if", "Er tut so, als ob er alles wüsste."],
          ["als wenn", "as if (colloquial)", "Er tut so, als wenn er alles wüsste."],

          // whether / indirect question starter (conjunction)
          ["ob", "whether / if", "Ich weiß nicht, ob er kommt."]
        ],
      },

      {
        title: "Type 1 - Subordinating (Verb to END) — Multi-word (Very Common)",
        headers: ["Connector", "Meaning", "Example - verb at END"],
        rows: [
          ["auch wenn", "even if", "Ich gehe, auch wenn es regnet."],
          ["nur wenn", "only if", "Ich komme nur, wenn du auch kommst."],
          ["außer wenn", "except if", "Ich helfe, außer wenn ich keine Zeit habe."],
          ["ohne dass", "without (doing)", "Er ging, ohne dass er etwas sagte."],
          ["statt dass / anstatt dass", "instead of (doing)", "Er spielt, statt dass er lernt."],
          ["so dass / sodass", "so that / so ... that", "Er war müde, sodass er einschlief."],
          ["je nachdem, ob", "depending on whether", "Je nachdem, ob es regnet, bleiben wir drin."],
        ],
      },

      {
        title: "Type 2 - Conjunctive Adverbs (Verb right after) — Most Common Set",
        headers: ["Connector", "Meaning", "Example - verb right after"],
        rows: [
          // result / consequence
          ["deshalb", "therefore", "Deshalb BLEIBE ich."],
          ["deswegen", "for that reason", "Deswegen GEHE ich nicht."],
          ["daher", "therefore", "Daher KOMMT er später."],
          ["darum", "therefore", "Darum MACHE ich das."],
          ["also", "so / therefore", "Also GEHEN wir."],
          ["folglich", "consequently", "Folglich MÜSSEN wir warten."],
          ["somit", "thus", "Somit IST es klar."],

          // contrast / concession
          ["trotzdem", "nevertheless", "Trotzdem GEHE ich."],
          ["dennoch", "nevertheless (slightly formal)", "Dennoch BLEIBE ich ruhig."],
          ["allerdings", "however / admittedly", "Allerdings BRAUCHT das Zeit."],
          ["hingegen", "in contrast", "Hingegen IST das leichter."],
          ["dagegen", "on the other hand", "Dagegen SAGT er nichts."],

          // addition
          ["außerdem", "besides / moreover", "Außerdem BRAUCHE ich Hilfe."],
          ["ebenfalls", "likewise", "Ebenfalls KOMMT sie."],
          ["auch", "also / too (as connector)", "Auch KOMMT er morgen."],
          ["dazu", "in addition", "Dazu BRAUCHE ich noch Zeit."],

          // sequence / time
          ["dann", "then", "Dann MACHE ich weiter."],
          ["danach", "after that", "Danach FAHRE ich nach Hause."],
          ["später", "later", "Später RUF ich dich an."],
          ["zuerst", "first", "Zuerst ESSE ich."],
          ["anschließend", "afterwards", "Anschließend GEHEN wir."],
          ["inzwischen", "meanwhile", "Inzwischen WARTE ich."],
          ["schließlich", "finally / after all", "Schließlich HAT er recht."],

          // example / clarification / summary
          ["zum Beispiel", "for example", "Zum Beispiel KANNST du das so sagen."],
          ["nämlich", "namely / because (explains)", "Er ist müde, nämlich HAT er wenig geschlafen."],
          ["kurz gesagt", "in short", "Kurz gesagt IST es schwierig."],
          ["tatsächlich", "actually / in fact", "Tatsächlich STIMMT das."],

          // alternative
          ["sonst", "otherwise / else", "Sonst VERLIERST du Zeit."]
        ],
      },
    ],
  },
},
  {
    id: 12,
    title: "Question Words",
    description: "W-Fragen and prepositional questions",
    content: {
      explanation: "Most question words start with W. For questions with prepositions: use wo+prep for THINGS (worüber = about what), and prep+wem/wen for PEOPLE (über wen = about whom). If preposition starts with vowel, add 'r': wo + auf = worauf.",
      tables: [
        {
          title: "Basic Question Words",
          headers: ["German", "English", "Case/Usage"],
          rows: [
            ["was", "what", "General questions"],
            ["wer", "who", "Nominative (subject)"],
            ["wen", "whom", "Accusative (object)"],
            ["wem", "whom", "Dative (indirect object)"],
            ["wessen", "whose", "Genitive (possession)"],
            ["wo", "where", "Location"],
            ["wann", "when", "Time"],
            ["warum", "why", "Reason"],
            ["wie", "how", "Manner"],
          ],
        },
        {
          title: "Prepositional Questions - Things vs People",
          headers: ["For THINGS", "For PEOPLE", "Meaning"],
          rows: [
            ["worüber", "über wen", "about what/whom"],
            ["wofür", "für wen", "for what/whom"],
            ["womit", "mit wem", "with what/whom"],
            ["worauf", "auf wen", "on/for what/whom"],
            ["wovon", "von wem", "from what/whom"],
            ["wozu", "zu wem", "to what/whom"],
          ],
        },
      ],
    },
  },
  {
    id: 13,
    title: "Reflexive Pronouns & Verbs",
    description: "myself, yourself, etc. - and which verbs need them",
    content: {
      explanation: "Reflexive pronouns refer back to the subject. Many German verbs REQUIRE reflexives even when English doesn't. Example: 'sich freuen' = to be happy (literally 'to happy oneself'). Always learn if a verb is reflexive!",
      tables: [
        {
          title: "Reflexive Pronouns by Case",
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
        {
          title: "Common Reflexive Verbs",
          headers: ["Verb + Prep + Case", "Meaning", "Example"],
          rows: [
            ["sich freuen auf + Akk", "look forward to", "Ich freue mich auf die Party."],
            ["sich freuen über + Akk", "be happy about", "Sie freut sich über das Geschenk."],
            ["sich interessieren für", "be interested in", "Er interessiert sich für Kunst."],
            ["sich erinnern an + Akk", "remember", "Ich erinnere mich an dich."],
            ["sich vorstellen (Dat)", "imagine", "Ich stelle mir das vor."],
          ],
        },
      ],
    },
  },
  {
    id: 14,
    title: "Separable Verbs",
    description: "Verbs that split in main clauses",
    content: {
      explanation: "Separable verbs split in present/simple past main clauses - prefix goes to END. In Perfekt, ge- goes between prefix and stem. In subordinate clauses, verbs stay together at the end.",
      tables: [
        {
          title: "Separable Verb Patterns",
          headers: ["Infinitive", "Present", "Perfekt", "Meaning"],
          rows: [
            ["aufstehen", "Ich stehe auf.", "Ich bin aufgestanden.", "to get up"],
            ["anfangen", "Es fängt an.", "Es hat angefangen.", "to begin"],
            ["mitkommen", "Kommst du mit?", "Bist du mitgekommen?", "to come along"],
            ["einkaufen", "Ich kaufe ein.", "Ich habe eingekauft.", "to shop"],
            ["anrufen", "Ich rufe an.", "Ich habe angerufen.", "to call"],
          ],
        },
        {
          title: "In Subordinate Clauses (Stay Together)",
          headers: ["Main Clause", "Subordinate Clause"],
          rows: [
            ["Ich stehe früh auf.", "...weil ich früh aufstehe."],
            ["Er fängt an.", "...wenn er anfängt."],
            ["Sie kauft ein.", "...obwohl sie einkauft."],
          ],
        },
      ],
    },
  },
  {
    id: 15,
    title: "Noun Gender Patterns",
    description: "Endings that predict gender",
    content: {
      explanation: "While noun gender often seems random, certain endings reliably predict gender. -ung, -keit, -heit, -ion, -schaft = feminine. -chen, -lein, -um, -ment = neuter. -er (for people), -ling, -ismus = masculine. Always learn nouns WITH their article!",
      tables: [
        {
          title: "Feminine Endings (die)",
          headers: ["Ending", "Examples", "Translation"],
          rows: [
            ["-ung", "die Zeitung, die Übung", "newspaper, exercise"],
            ["-keit", "die Möglichkeit, die Freundlichkeit", "possibility, friendliness"],
            ["-heit", "die Freiheit, die Gesundheit", "freedom, health"],
            ["-ion", "die Nation, die Information", "nation, information"],
            ["-schaft", "die Freundschaft, die Wirtschaft", "friendship, economy"],
            ["-tät", "die Universität, die Qualität", "university, quality"],
          ],
        },
        {
          title: "Neuter Endings (das)",
          headers: ["Ending", "Examples", "Translation"],
          rows: [
            ["-chen", "das Mädchen, das Brötchen", "girl, bread roll"],
            ["-lein", "das Fräulein, das Büchlein", "miss, little book"],
            ["-um", "das Museum, das Zentrum", "museum, center"],
            ["-ment", "das Dokument, das Instrument", "document, instrument"],
          ],
        },
        {
          title: "Masculine Endings (der)",
          headers: ["Ending", "Examples", "Translation"],
          rows: [
            ["-er (person)", "der Lehrer, der Arbeiter", "teacher, worker"],
            ["-ling", "der Frühling, der Schmetterling", "spring, butterfly"],
            ["-ismus", "der Tourismus, der Kapitalismus", "tourism, capitalism"],
          ],
        },
      ],
    },
  },
  {
    id: 16,
    title: "Adjective Endings",
    description: "When and how adjectives change",
    content: {
      explanation: "Adjectives before nouns need endings based on: 1) gender, 2) case, 3) what comes before. Key insight: SOMETHING must show gender - either the article or the adjective. After der/die/das: weak endings. After ein/eine/mein: mixed. No article: strong endings.",
      tables: [
        {
          title: "After Definite Articles (Weak Endings)",
          headers: ["Case", "Masculine", "Feminine", "Neuter", "Plural"],
          rows: [
            ["Nominative", "-e", "-e", "-e", "-en"],
            ["Accusative", "-en", "-e", "-e", "-en"],
            ["Dative", "-en", "-en", "-en", "-en"],
            ["Genitive", "-en", "-en", "-en", "-en"],
          ],
        },
        {
          title: "After Indefinite Articles (Mixed Endings)",
          headers: ["Case", "Masculine", "Feminine", "Neuter"],
          rows: [
            ["Nominative", "-er", "-e", "-es"],
            ["Accusative", "-en", "-e", "-es"],
            ["Dative", "-en", "-en", "-en"],
            ["Genitive", "-en", "-en", "-en"],
          ],
        },
        {
          title: "Examples",
          headers: ["Context", "Example", "Why"],
          rows: [
            ["After der", "der große Mann", "der shows masc, adj = -e"],
            ["After ein (masc)", "ein großer Mann", "ein doesn't show masc, adj = -er"],
            ["After das", "das kleine Kind", "das shows neuter, adj = -e"],
            ["After ein (neut)", "ein kleines Kind", "ein doesn't show neuter, adj = -es"],
          ],
        },
      ],
    },
  },
]

export function CoreTab() {
  const getCoreTopicFromHash = () => {
    if (typeof window === "undefined") {
      return null
    }

    const hash = window.location.hash
    if (!hash.startsWith("#core-topic-")) {
      return null
    }

    const id = Number(hash.replace("#core-topic-", ""))
    return Number.isNaN(id) ? null : id
  }

  const [expandedTopic, setExpandedTopic] = useState<number | null>(() => {
    return getCoreTopicFromHash() ?? 1
  })

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const id = getCoreTopicFromHash()
    if (id === null) {
      return
    }
    window.requestAnimationFrame(() => {
      const target = document.getElementById(`core-topic-${id}`)
      target?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }, [])

  const toggleTopic = (id: number) => {
    setExpandedTopic(expandedTopic === id ? null : id)
  }

  const featuredTopics = coreTopics.filter(t => t.featured)
  const regularTopics = coreTopics.filter(t => !t.featured)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 py-6">
        <h1 className="text-4xl font-bold text-foreground">Core Grammar Reference</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Comprehensive reference tables for all tenses, passive voice, modal verbs, and more
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <Card>
          <CardContent className="py-4 text-center">
            <Target className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{coreTopics.length}</p>
            <p className="text-sm text-muted-foreground">Core Topics</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {coreTopics.reduce((acc, t) => acc + t.content.tables.length, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Reference Tables</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Insight */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Key Insight: Verb Formulas</p>
              <p className="text-sm text-amber-800 mt-1">
                Active = Subject does action. Passive = Subject receives action. 
                In Perfekt passive, use <strong>worden</strong> NOT geworden!
                Modal + Infinitiv at END. Master these patterns and you&apos;ll understand 90% of German sentences!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Verb Topics */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          Featured: Verb System Tables
        </h2>
        <div className="space-y-4">
          {featuredTopics.map((topic) => (
            <Card key={topic.id} id={`core-topic-${topic.id}`} className="border-primary/30">
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleTopic(topic.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                        {topic.id}
                      </span>
                      {topic.title}
                    </CardTitle>
                    <CardDescription className="mt-1 ml-10">
                      {topic.description}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    {expandedTopic === topic.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {expandedTopic === topic.id && (
                <CardContent className="pt-0">
                  {/* Explanation */}
                  <div className="bg-primary/5 rounded-lg p-4 mb-6 border-l-4 border-primary">
                    <p className="text-foreground/80">{topic.content.explanation}</p>
                  </div>

                  {/* Tables */}
                  <div className="space-y-6">
                    {topic.content.tables.map((table, tableIndex) => (
                      <div key={tableIndex}>
                        <h4 className="font-semibold mb-3 text-primary">{table.title}</h4>
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
                              {table.rows.map((row, rowIndex) => (
                                <tr
                                  key={rowIndex}
                                  className={rowIndex % 2 === 0 ? "bg-background" : "bg-muted/30"}
                                >
                                  {row.map((cell, cellIndex) => (
                                    <td
                                      key={cellIndex}
                                      className="border border-border px-3 py-2"
                                    >
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
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Regular Topics */}
      <div>
        <h2 className="text-xl font-bold mb-4">Additional Grammar Topics</h2>
        <div className="space-y-4">
          {regularTopics.map((topic) => (
            <Card key={topic.id} id={`core-topic-${topic.id}`}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleTopic(topic.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                        {topic.id}
                      </span>
                      {topic.title}
                    </CardTitle>
                    <CardDescription className="mt-1 ml-10">
                      {topic.description}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    {expandedTopic === topic.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {expandedTopic === topic.id && (
                <CardContent className="pt-0">
                  <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <p className="text-foreground/80">{topic.content.explanation}</p>
                  </div>

                  <div className="space-y-6">
                    {topic.content.tables.map((table, tableIndex) => (
                      <div key={tableIndex}>
                        <h4 className="font-semibold mb-3">{table.title}</h4>
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
                              {table.rows.map((row, rowIndex) => (
                                <tr
                                  key={rowIndex}
                                  className={rowIndex % 2 === 0 ? "bg-background" : "bg-muted/30"}
                                >
                                  {row.map((cell, cellIndex) => (
                                    <td
                                      key={cellIndex}
                                      className="border border-border px-3 py-2"
                                    >
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
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
