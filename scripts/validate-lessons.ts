import { lessonCatalog } from "../lib/lesson-catalog"
import { getLessonContent } from "../lib/lesson-content"

type Purpose = "work" | "travel" | "study" | "relocation" | "exams" | "daily"
type LearningStyle = "balanced" | "speaking" | "grammar"

const purposes: Purpose[] = ["work", "travel", "study", "relocation", "exams", "daily"]
const learningStyles: LearningStyle[] = ["balanced", "speaking", "grammar"]

const abilityVerbs = [
  "introduce", "describe", "handle", "ask", "talk", "express", "use", "name",
  "write", "read", "order", "compare", "present", "contribute", "navigate",
  "shop", "make", "build", "tell", "report", "understand", "plan", "get",
  "say", "learn", "discuss", "register", "master", "explain",
]

const grammarKeywords = [
  "case", "tense", "pronoun", "pronouns", "article", "articles", "preposition",
  "prepositions", "passive", "konjunktiv", "genitive", "dative", "accusative",
]

function hasAbilityVerb(title: string) {
  const lower = title.toLowerCase()
  return abilityVerbs.some((v) => lower.includes(v))
}

function looksGrammarLabeled(title: string) {
  const lower = title.toLowerCase()
  const hasGrammarWord = grammarKeywords.some((k) => lower.includes(k))
  return hasGrammarWord && !hasAbilityVerb(title)
}

function normalizeSpaces(input: string) {
  return input.replace(/\s+/g, " ").trim()
}

function normalizePunctuation(input: string) {
  return normalizeSpaces(input)
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/([.,!?;:])\s*/g, "$1")
    .trim()
}

const errors: string[] = []
const warnings: string[] = []

for (const lesson of lessonCatalog) {
  if (!lesson.title || !lesson.title.trim()) {
    errors.push(`[catalog] ${lesson.id}: missing title`)
  }

  if (looksGrammarLabeled(lesson.title)) {
    errors.push(`[catalog] ${lesson.id}: title looks grammar-labeled: "${lesson.title}"`)
  }

  const applicablePurposes = lesson.contexts === "all"
    ? purposes
    : purposes.filter(purpose => lesson.contexts.includes(purpose))

  for (const purpose of applicablePurposes) {
    const content = getLessonContent(lesson.id, {
      purpose,
      timeCommitment: "20",
      learningStyle: "balanced",
    })

    if (!content) {
      errors.push(`[content] ${lesson.id}: missing content for purpose "${purpose}"`)
      continue
    }

    if (!content.title || !content.abilityObjective) {
      errors.push(`[content] ${lesson.id}: missing title or abilityObjective (${purpose})`)
    }

    if (content.exercises.length === 0) {
      errors.push(`[content] ${lesson.id}: no exercises (${purpose})`)
    }

    for (const [index, ex] of content.exercises.entries()) {
      const exKey = `[exercise] ${lesson.id} (${purpose}) #${index + 1}`

      if (!ex.prompt || !ex.prompt.trim()) {
        errors.push(`${exKey}: missing prompt`)
      }

      if (ex.kind !== "production" && (!ex.answer || !ex.answer.trim())) {
        errors.push(`${exKey}: missing answer for ${ex.kind}`)
      }

      if (ex.kind === "multiple-choice" || ex.kind === "fill-blank") {
        if (!ex.options || ex.options.length < 2) {
          errors.push(`${exKey}: missing options for ${ex.kind}`)
        } else if (!ex.options.includes(ex.answer)) {
          errors.push(`${exKey}: answer not in options (${ex.answer})`)
        }
      }

      if (ex.kind === "reorder") {
        if (!ex.words || ex.words.length < 2) {
          errors.push(`${exKey}: missing words for reorder`)
        } else {
          const joined = normalizePunctuation(ex.words.join(" "))
          const answer = normalizePunctuation(ex.answer)
          if (joined !== answer) {
            warnings.push(`${exKey}: reorder answer doesn't match words join`)
          }
        }
      }

      if (ex.kind === "production") {
        if (!ex.sampleAnswer || !ex.sampleAnswer.trim()) {
          warnings.push(`${exKey}: missing sampleAnswer`)
        }
        if (!ex.mode || (ex.mode !== "speaking" && ex.mode !== "writing")) {
          errors.push(`${exKey}: production mode must be "speaking" or "writing"`)
        }
      }
    }
  }
}

for (const lesson of lessonCatalog) {
  const applicablePurposes = lesson.contexts === "all"
    ? purposes
    : purposes.filter(purpose => lesson.contexts.includes(purpose))

  for (const purpose of applicablePurposes) {
    for (const learningStyle of learningStyles) {
      const content = getLessonContent(lesson.id, {
        purpose,
        timeCommitment: "10",
        learningStyle,
      })

      if (!content) continue

      const key = `[rules] ${lesson.id} (${purpose}, ${learningStyle})`

      if (learningStyle === "speaking") {
        const hasSpeaking = content.exercises.some(
          (ex) => ex.kind === "production" && ex.mode === "speaking"
        )
        if (!hasSpeaking) {
          errors.push(`${key}: missing speaking production exercise`)
        }
      }

      if (learningStyle === "grammar") {
        const hasSnapshot = content.grammarPoints.some((gp) => gp.rule.includes("Grammar snapshot"))
        if (!hasSnapshot) {
          warnings.push(`${key}: missing grammar snapshot rule`)
        }
      }

      if (purpose === "exams") {
        const hasTimed = content.exercises.some((ex) => ex.prompt.toLowerCase().includes("timed"))
        if (!hasTimed) {
          warnings.push(`${key}: missing timed-style exercise prompt`)
        }
      }
    }
  }
}

if (warnings.length > 0) {
  console.warn("Lesson validation warnings:")
  for (const warning of warnings) console.warn(`- ${warning}`)
}

if (errors.length > 0) {
  console.error("Lesson validation errors:")
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log("Lesson validation passed.")
