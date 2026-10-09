import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CEFR_LEVELS,
  DIFFICULTIES,
  GAME_DEFINITIONS,
  GAME_SLUGS,
  QUESTION_TYPES,
  SLUG_PATTERN,
  normalizeText,
} from "./content-schema.mjs";

const HUMAN_REVIEW_CHECKS = [
  "Confirm CEFR suitability and difficulty through qualified human review.",
  "Review grammar, naturalness and distractor plausibility in context.",
  "Check explanations for pedagogical accuracy, clarity and unnecessary jargon.",
  "Review cultural assumptions, ambiguity and regional English variants.",
];

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function addIssue(collection, code, message, sourceId = null) {
  collection.push({ code, message, sourceId });
}

function validateNamedSlug(value, label, errors, sourceId) {
  if (!isPlainObject(value)) {
    addIssue(errors, "schema", `${label} must be an object.`, sourceId);
    return;
  }

  if (typeof value.name !== "string" || value.name.trim().length === 0) {
    addIssue(errors, "schema", `${label}.name is required.`, sourceId);
  }

  if (typeof value.slug !== "string" || !SLUG_PATTERN.test(value.slug)) {
    addIssue(errors, "schema", `${label}.slug must be a kebab-case slug.`, sourceId);
  }
}

function tokenSimilarity(left, right) {
  const leftTokens = new Set(normalizeText(left).split(" ").filter(Boolean));
  const rightTokens = new Set(normalizeText(right).split(" ").filter(Boolean));
  const union = new Set([...leftTokens, ...rightTokens]);

  if (union.size === 0) {
    return 0;
  }

  let intersectionSize = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersectionSize += 1;
    }
  }

  return intersectionSize / union.size;
}

export function validateContentDocument(
  document,
  { expectSampleMatrix = false } = {},
) {
  const errors = [];
  const warnings = [];
  const questions = Array.isArray(document?.questions) ? document.questions : [];

  if (!isPlainObject(document) || document.version !== 1) {
    addIssue(errors, "schema", "Document version must be 1.");
  }

  if (!Array.isArray(document?.questions)) {
    addIssue(errors, "schema", "questions must be an array.");
  }

  const sourceIds = new Set();
  const exactPrompts = new Map();
  const normalizedPrompts = new Map();
  const taxonomy = new Map();
  const conceptLocations = new Map();
  const conceptVariantCounts = new Map();
  const matrix = new Map();
  const difficultyCounts = new Map();
  const questionTypeCounts = new Map();
  const topicKeys = new Set();
  const conceptKeys = new Set();

  for (const [index, question] of questions.entries()) {
    const sourceId =
      typeof question?.sourceId === "string" ? question.sourceId : `index:${index}`;

    if (!isPlainObject(question)) {
      addIssue(errors, "schema", "Question must be an object.", sourceId);
      continue;
    }

    if (!SLUG_PATTERN.test(question.sourceId ?? "")) {
      addIssue(errors, "schema", "sourceId must be a kebab-case identifier.", sourceId);
    } else if (sourceIds.has(question.sourceId)) {
      addIssue(errors, "duplicate_source_id", "sourceId must be unique.", sourceId);
    } else {
      sourceIds.add(question.sourceId);
    }

    const gameSlug = question.game?.slug;
    const gameDefinition = GAME_DEFINITIONS[gameSlug];
    validateNamedSlug(question.game, "game", errors, sourceId);

    if (!GAME_SLUGS.includes(gameSlug)) {
      addIssue(errors, "game", "Unsupported game slug.", sourceId);
    } else {
      if (question.game.name !== gameDefinition.name) {
        addIssue(errors, "taxonomy", "Game name does not match its slug.", sourceId);
      }
      if (question.game.description !== gameDefinition.description) {
        addIssue(
          errors,
          "taxonomy",
          "Game description does not match the shared definition.",
          sourceId,
        );
      }
    }

    validateNamedSlug(question.topic, "topic", errors, sourceId);
    validateNamedSlug(question.concept, "concept", errors, sourceId);

    if (!CEFR_LEVELS.includes(question.cefrLevel)) {
      addIssue(errors, "cefr", "cefrLevel must be A1, A2, B1 or B2.", sourceId);
    }

    if (!DIFFICULTIES.includes(question.difficulty)) {
      addIssue(errors, "difficulty", "difficulty must be 1, 2 or 3.", sourceId);
    }

    if (!QUESTION_TYPES.includes(question.questionType)) {
      addIssue(errors, "question_type", "Unsupported question type.", sourceId);
    } else if (
      gameDefinition &&
      !gameDefinition.allowedQuestionTypes.includes(question.questionType)
    ) {
      addIssue(
        errors,
        "question_type",
        "Question type is not supported by this game.",
        sourceId,
      );
    }

    if (
      ["image_choice", "audio_choice"].includes(question.questionType) ||
      question.imagePath !== null ||
      question.audioPath !== null
    ) {
      addIssue(
        errors,
        "media",
        "This sample must not reference unavailable image or audio media.",
        sourceId,
      );
    }

    if (typeof question.prompt !== "string" || question.prompt.trim().length < 8) {
      addIssue(errors, "quality", "Prompt must contain at least 8 characters.", sourceId);
    }

    if (
      typeof question.correctAnswer !== "string" ||
      question.correctAnswer.trim().length === 0
    ) {
      addIssue(errors, "schema", "correctAnswer is required.", sourceId);
    }

    if (
      typeof question.explanation !== "string" ||
      question.explanation.trim().length < 24 ||
      !/[.!?]$/.test(question.explanation.trim())
    ) {
      addIssue(
        errors,
        "explanation",
        "Explanation must be at least 24 characters and end with punctuation.",
        sourceId,
      );
    } else if (question.explanation.trim().length < 45) {
      addIssue(
        warnings,
        "explanation_review",
        "Explanation is concise and should receive human clarity review.",
        sourceId,
      );
    }

    if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 6) {
      addIssue(errors, "options", "Questions require between 2 and 6 options.", sourceId);
    } else {
      const positions = question.options.map((option) => option?.position);
      const expectedPositions = question.options.map((_, optionIndex) => optionIndex + 1);
      if (positions.some((position, optionIndex) => position !== expectedPositions[optionIndex])) {
        addIssue(errors, "options", "Option positions must be contiguous from 1.", sourceId);
      }

      const normalizedOptions = question.options.map((option) =>
        normalizeText(typeof option?.text === "string" ? option.text : ""),
      );
      if (normalizedOptions.some((option) => option.length === 0)) {
        addIssue(errors, "options", "Every option requires non-empty text.", sourceId);
      }
      if (new Set(normalizedOptions).size !== normalizedOptions.length) {
        addIssue(errors, "options", "Options must be unique after normalization.", sourceId);
      }

      const correctOptions = question.options.filter(
        (option) => option?.isCorrect === true,
      );
      if (correctOptions.length !== 1) {
        addIssue(errors, "options", "Exactly one option must be correct.", sourceId);
      } else if (
        normalizeText(correctOptions[0].text) !== normalizeText(question.correctAnswer)
      ) {
        addIssue(
          errors,
          "answer_mismatch",
          "correctAnswer must match the correct option.",
          sourceId,
        );
      }
    }

    const taxonomyEntries = [
      [`game:${gameSlug}`, question.game?.name],
      [`topic:${gameSlug}:${question.cefrLevel}:${question.topic?.slug}`, question.topic?.name],
      [
        `concept:${gameSlug}:${question.cefrLevel}:${question.topic?.slug}:${question.concept?.slug}`,
        question.concept?.name,
      ],
    ];
    for (const [key, name] of taxonomyEntries) {
      if (taxonomy.has(key) && taxonomy.get(key) !== name) {
        addIssue(errors, "taxonomy", `Inconsistent name for ${key}.`, sourceId);
      } else if (typeof name === "string") {
        taxonomy.set(key, name);
      }
    }

    const conceptIdentity = `${gameSlug}:${question.cefrLevel}:${question.concept?.slug}`;
    const conceptLocation = question.topic?.slug;
    if (
      conceptLocations.has(conceptIdentity) &&
      conceptLocations.get(conceptIdentity) !== conceptLocation
    ) {
      addIssue(
        errors,
        "taxonomy",
        "A concept slug must belong to one topic within a game and CEFR level.",
        sourceId,
      );
    } else if (typeof conceptLocation === "string") {
      conceptLocations.set(conceptIdentity, conceptLocation);
    }

    const conceptKey = `${gameSlug}:${question.cefrLevel}:${question.topic?.slug}:${question.concept?.slug}`;
    conceptVariantCounts.set(
      conceptKey,
      (conceptVariantCounts.get(conceptKey) ?? 0) + 1,
    );

    if (typeof question.prompt === "string") {
      const exactKey = `${gameSlug}|${question.cefrLevel}|${question.prompt.trim()}`;
      const normalizedKey = `${gameSlug}|${question.cefrLevel}|${normalizeText(question.prompt)}`;
      if (exactPrompts.has(exactKey)) {
        addIssue(
          errors,
          "exact_duplicate",
          `Exact duplicate of ${exactPrompts.get(exactKey)}.`,
          sourceId,
        );
      } else {
        exactPrompts.set(exactKey, sourceId);
      }
      if (normalizedPrompts.has(normalizedKey)) {
        addIssue(
          errors,
          "normalized_duplicate",
          `Normalized duplicate of ${normalizedPrompts.get(normalizedKey)}.`,
          sourceId,
        );
      } else {
        normalizedPrompts.set(normalizedKey, sourceId);
      }
    }

    const matrixKey = `${gameSlug}:${question.cefrLevel}`;
    matrix.set(matrixKey, (matrix.get(matrixKey) ?? 0) + 1);
    difficultyCounts.set(
      String(question.difficulty),
      (difficultyCounts.get(String(question.difficulty)) ?? 0) + 1,
    );
    questionTypeCounts.set(
      String(question.questionType),
      (questionTypeCounts.get(String(question.questionType)) ?? 0) + 1,
    );
    topicKeys.add(`${gameSlug}:${question.cefrLevel}:${question.topic?.slug}`);
    conceptKeys.add(conceptKey);
  }

  for (let leftIndex = 0; leftIndex < questions.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < questions.length; rightIndex += 1) {
      const left = questions[leftIndex];
      const right = questions[rightIndex];
      if (
        left?.game?.slug === right?.game?.slug &&
        left?.cefrLevel === right?.cefrLevel &&
        typeof left.prompt === "string" &&
        typeof right.prompt === "string" &&
        tokenSimilarity(left.prompt, right.prompt) >= 0.9
      ) {
        addIssue(
          warnings,
          "potential_duplicate",
          `Prompts are highly similar to ${left.sourceId}.`,
          right.sourceId,
        );
      }
    }
  }

  if (expectSampleMatrix) {
    for (const gameSlug of GAME_SLUGS) {
      for (const cefrLevel of CEFR_LEVELS) {
        const matrixKey = `${gameSlug}:${cefrLevel}`;
        if (matrix.get(matrixKey) !== 5) {
          addIssue(
            errors,
            "sample_matrix",
            `${matrixKey} must contain exactly 5 questions.`,
          );
        }
      }
    }
    if (questions.length !== 60) {
      addIssue(errors, "sample_matrix", "The sample must contain 60 questions.");
    }

    for (const [conceptKey, variantCount] of conceptVariantCounts) {
      if (variantCount < 2) {
        addIssue(
          errors,
          "concept_reuse",
          `${conceptKey} must contain at least two question variants.`,
        );
      }
    }
  }

  const variantDistribution = new Map();
  for (const variantCount of conceptVariantCounts.values()) {
    variantDistribution.set(
      String(variantCount),
      (variantDistribution.get(String(variantCount)) ?? 0) + 1,
    );
  }

  return {
    counts: Object.fromEntries([...matrix.entries()].sort()),
    difficultyCounts: Object.fromEntries([...difficultyCounts.entries()].sort()),
    errors,
    humanReviewChecks: HUMAN_REVIEW_CHECKS,
    invalidQuestionCount: new Set(
      errors.map((error) => error.sourceId).filter(Boolean),
    ).size,
    questionCount: questions.length,
    questionTypeCounts: Object.fromEntries([...questionTypeCounts.entries()].sort()),
    taxonomyCounts: {
      concepts: conceptKeys.size,
      topics: topicKeys.size,
    },
    taxonomyReuse: {
      conceptsWithMultipleQuestions: [...conceptVariantCounts.values()].filter(
        (count) => count > 1,
      ).length,
      singleQuestionConcepts: [...conceptVariantCounts.values()].filter(
        (count) => count === 1,
      ).length,
      variantDistribution: Object.fromEntries([...variantDistribution.entries()].sort()),
    },
    valid: errors.length === 0,
    warnings,
  };
}

export function readContentDocument(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseArguments(argumentsList) {
  const options = { expectSampleMatrix: false, file: null };
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--expect-sample-matrix") {
      options.expectSampleMatrix = true;
    } else if (argument === "--file") {
      options.file = argumentsList[index + 1] ?? null;
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  if (!options.file) {
    throw new Error("Use --file <path>.");
  }
  return options;
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  try {
    const options = parseArguments(process.argv.slice(2));
    const document = readContentDocument(path.resolve(options.file));
    const report = validateContentDocument(document, options);
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.valid ? 0 : 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
