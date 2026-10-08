import type { CefrLevel } from "@/lib/onboarding/validation";

export type GameSlug = "describe-it" | "verb-challenge" | "word-rush";

export type GameDefinition = {
  category: string;
  duration: string;
  exerciseTypes: readonly string[];
  homeDescription: string;
  levelFocus: Record<CefrLevel, string>;
  objective: string;
  questionCount: 10;
  slug: GameSlug;
  title: string;
};

export const gameCatalog: readonly GameDefinition[] = [
  {
    category: "Vocabulary",
    duration: "2–3 min",
    exerciseTypes: [
      "Image to word",
      "Word to image",
      "Definition to word",
      "Complete the sentence",
      "Audio to word, where supported",
    ],
    homeDescription:
      "Build quick recognition and choose words in context.",
    levelFocus: {
      A1: "Basic vocabulary and simple everyday nouns and adjectives.",
      A2: "Common vocabulary for travel, shopping, cities, weather and hobbies.",
      B1: "Definitions and contextual vocabulary for work, media and everyday life.",
      B2: "Precise vocabulary, nuanced choices and abstract concepts in context.",
    },
    objective:
      "Strengthen vocabulary through quick recognition, definitions and contextual choices.",
    questionCount: 10,
    slug: "word-rush",
    title: "Word Rush",
  },
  {
    category: "Grammar in context",
    duration: "3–4 min",
    exerciseTypes: [
      "Choose the correct form",
      "Fill the gap",
      "Choose the correct tense",
      "Irregular verbs",
      "Sentence correction",
    ],
    homeDescription:
      "Strengthen verb forms and make confident tense choices.",
    levelFocus: {
      A1: "To be, to have, present simple, can and common everyday verbs.",
      A2: "Past simple, present continuous, future forms and common irregular verbs.",
      B1: "Present perfect, modal verbs, conditionals and common phrasal verbs.",
      B2: "Advanced tenses, passive voice, reported speech and modal deduction.",
    },
    objective:
      "Build confidence with verb forms, tense selection and grammar in context.",
    questionCount: 10,
    slug: "verb-challenge",
    title: "Verb Challenge",
  },
  {
    category: "Adjectives",
    duration: "2–3 min",
    exerciseTypes: [
      "Image to adjective",
      "Adjective to opposite",
      "Definition to adjective",
      "Complete the sentence",
      "Synonym or meaning",
    ],
    homeDescription:
      "Use precise descriptions, opposites and nuanced choices.",
    levelFocus: {
      A1: "Colours, size, age, basic emotions and simple opposites.",
      A2: "Personality, weather, feelings, appearance and basic comparisons.",
      B1: "Personality, emotions, quality, intensity and context-based adjectives.",
      B2: "Nuance, abstract qualities, opinions, strong adjectives and synonyms.",
    },
    objective:
      "Expand descriptive language through adjectives, opposites and meaning in context.",
    questionCount: 10,
    slug: "describe-it",
    title: "Describe It",
  },
];
