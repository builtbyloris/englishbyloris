import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  getPostgresEnvironment,
  runContentImport,
} from "./import-content.mjs";
import { readContentDocument } from "./validate-content.mjs";

const databaseUrl = process.env.CONTENT_DATABASE_URL;
if (!databaseUrl) {
  throw new Error("CONTENT_DATABASE_URL is required for database integration tests.");
}

const fixture = readContentDocument(
  path.resolve("supabase/tests/fixtures/content-valid.synthetic.json"),
);
const postgresEnvironment = getPostgresEnvironment(databaseUrl);

function queryValue(sql) {
  const result = spawnSync("psql", ["-X", "-qAt", "--set", "ON_ERROR_STOP=1"], {
    encoding: "utf8",
    env: { ...process.env, ...postgresEnvironment },
    input: sql,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || "Database assertion query failed.");
  }
  return result.stdout.trim();
}

const dryRun = runContentImport({
  databaseUrl,
  document: fixture,
  dryRun: true,
});
assert.equal(dryRun.databaseReport.questionsInserted, 2);
assert.equal(dryRun.databaseReport.questionsSkipped, 0);
assert.equal(queryValue("select count(*) from public.questions;"), "0");

const firstApply = runContentImport({
  databaseUrl,
  document: fixture,
  dryRun: false,
});
assert.equal(firstApply.databaseReport.questionsInserted, 2);
assert.equal(firstApply.databaseReport.questionsSkipped, 0);
assert.equal(
  queryValue(`
    select concat_ws(',',
      (select count(*) from public.games),
      (select count(*) from public.topics),
      (select count(*) from public.concepts),
      (select count(*) from public.questions),
      (select count(*) from public.question_options)
    );
  `),
  "1,1,1,2,8",
);

const secondApply = runContentImport({
  databaseUrl,
  document: fixture,
  dryRun: false,
});
assert.equal(secondApply.databaseReport.questionsInserted, 0);
assert.equal(secondApply.databaseReport.questionsSkipped, 2);
assert.equal(queryValue("select count(*) from public.question_options;"), "8");

console.log("Content importer database checks passed.");
