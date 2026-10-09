import assert from "node:assert/strict";
import path from "node:path";

import {
  buildImportSql,
  getPostgresEnvironment,
  parseArguments,
} from "./import-content.mjs";
import {
  readContentDocument,
  validateContentDocument,
} from "./validate-content.mjs";

const fixturePath = path.resolve(
  "supabase/tests/fixtures/content-valid.synthetic.json",
);
const validFixture = readContentDocument(fixturePath);
const validReport = validateContentDocument(validFixture);

assert.equal(validReport.valid, true, "Synthetic fixture must be valid");
assert.equal(validReport.questionCount, 2);
assert.deepEqual(validReport.difficultyCounts, { 1: 1, 2: 1 });
assert.equal(validReport.taxonomyCounts.concepts, 1);
assert.deepEqual(validReport.taxonomyReuse, {
  conceptsWithMultipleQuestions: 1,
  singleQuestionConcepts: 0,
  variantDistribution: { 2: 1 },
});

const invalidLevel = structuredClone(validFixture);
invalidLevel.questions[0].cefrLevel = "C1";
assert.equal(validateContentDocument(invalidLevel).valid, false);

const emptyOptions = structuredClone(validFixture);
emptyOptions.questions[0].options = [];
assert.equal(validateContentDocument(emptyOptions).valid, false);

const duplicateCorrect = structuredClone(validFixture);
duplicateCorrect.questions[0].options[1].isCorrect = true;
assert.equal(validateContentDocument(duplicateCorrect).valid, false);

const mismatchedAnswer = structuredClone(validFixture);
mismatchedAnswer.questions[0].correctAnswer = "not-an-option";
assert.equal(validateContentDocument(mismatchedAnswer).valid, false);

const duplicatePrompt = structuredClone(validFixture);
duplicatePrompt.questions.push({
  ...structuredClone(duplicatePrompt.questions[0]),
  sourceId: "synthetic-word-a1-003",
});
assert.equal(validateContentDocument(duplicatePrompt).valid, false);

const normalizedDuplicate = structuredClone(validFixture);
normalizedDuplicate.questions.push({
  ...structuredClone(normalizedDuplicate.questions[0]),
  prompt: `${normalizedDuplicate.questions[0].prompt}!!!`,
  sourceId: "synthetic-word-a1-004",
});
assert.equal(
  validateContentDocument(normalizedDuplicate).errors.some(
    (error) => error.code === "normalized_duplicate",
  ),
  true,
);

const invalidTaxonomy = structuredClone(validFixture);
invalidTaxonomy.questions[0].game.name = "Wrong Game Name";
assert.equal(validateContentDocument(invalidTaxonomy).valid, false);

const splitConcept = structuredClone(validFixture);
splitConcept.questions[1].topic = {
  name: "Another Synthetic Topic",
  slug: "another-synthetic-topic",
};
assert.equal(
  validateContentDocument(splitConcept).errors.some(
    (error) => error.code === "taxonomy",
  ),
  true,
);

const nonReusableConcepts = structuredClone(validFixture);
nonReusableConcepts.questions[1].concept = {
  name: "Another Synthetic Concept",
  slug: "another-synthetic-concept",
};
assert.equal(
  validateContentDocument(nonReusableConcepts, {
    expectSampleMatrix: true,
  }).errors.some((error) => error.code === "concept_reuse"),
  true,
);

const sql = buildImportSql(validFixture, { dryRun: true });
assert.match(sql, /begin;/);
assert.match(sql, /pg_advisory_xact_lock/);
assert.match(sql, /on conflict .* do nothing/i);
assert.match(sql, /set constraints all immediate;/);
assert.match(sql, /rollback;/);
assert.match(sql, /true::boolean as is_active/);
assert.doesNotMatch(sql, /delete from public\./i);

const inactiveSql = buildImportSql(validFixture, {
  dryRun: false,
  inactive: true,
});
assert.match(inactiveSql, /false::boolean as is_active/);
assert.match(inactiveSql, /questions\.is_active <> stage\.is_active/);
assert.match(inactiveSql, /'inactive', true/);
assert.match(inactiveSql, /commit;/);

assert.deepEqual(
  parseArguments([
    "--file",
    "private-sample.json",
    "--dry-run",
    "--inactive",
  ]),
  {
    allowRemote: false,
    file: "private-sample.json",
    inactive: true,
    mode: "dry-run",
  },
);

assert.throws(
  () =>
    getPostgresEnvironment(
      "postgresql://postgres@example.supabase.co:5432/postgres",
    ),
  /Remote imports are blocked/,
);
assert.equal(
  getPostgresEnvironment(
    "postgresql://postgres@example.supabase.co:5432/postgres",
    true,
  ).PGHOST,
  "example.supabase.co",
);

console.log("Content validation and importer unit checks passed.");
