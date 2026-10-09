export const CEFR_LEVELS = ["A1", "A2", "B1", "B2"];
export const DIFFICULTIES = [1, 2, 3];
export const QUESTION_TYPES = [
  "multiple_choice",
  "image_choice",
  "definition_choice",
  "opposite",
  "sentence_gap",
  "audio_choice",
];

export const GAME_DEFINITIONS = {
  "describe-it": {
    allowedQuestionTypes: [
      "multiple_choice",
      "definition_choice",
      "opposite",
      "sentence_gap",
    ],
    description: "Adjectives, opposites and descriptions in context.",
    name: "Describe It",
  },
  "verb-challenge": {
    allowedQuestionTypes: ["multiple_choice", "sentence_gap"],
    description: "Verb forms, tense selection and grammar in context.",
    name: "Verb Challenge",
  },
  "word-rush": {
    allowedQuestionTypes: [
      "multiple_choice",
      "definition_choice",
      "sentence_gap",
    ],
    description: "Vocabulary recognition, definitions and contextual choices.",
    name: "Word Rush",
  },
};

export const GAME_SLUGS = Object.keys(GAME_DEFINITIONS);
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeText(value) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
