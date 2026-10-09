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

function queryValueAsRole(role, sql) {
  if (!["authenticated", "service_role"].includes(role)) {
    throw new Error("Unsupported test role.");
  }

  return queryValue(`
    begin;
    set local role ${role};
    ${sql}
    rollback;
  `);
}

const dryRun = runContentImport({
  databaseUrl,
  document: fixture,
  dryRun: true,
  inactive: true,
});
assert.equal(dryRun.databaseReport.questionsInserted, 2);
assert.equal(dryRun.databaseReport.questionsSkipped, 0);
assert.equal(dryRun.databaseReport.inactive, true);
assert.equal(queryValue("select count(*) from public.questions;"), "0");

const firstApply = runContentImport({
  databaseUrl,
  document: fixture,
  dryRun: false,
  inactive: true,
});
assert.equal(firstApply.databaseReport.questionsInserted, 2);
assert.equal(firstApply.databaseReport.questionsSkipped, 0);
assert.equal(
  queryValue("select count(*) from public.questions where not is_active;"),
  "2",
);
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
  inactive: true,
});
assert.equal(secondApply.databaseReport.questionsInserted, 0);
assert.equal(secondApply.databaseReport.questionsSkipped, 2);
assert.equal(queryValue("select count(*) from public.question_options;"), "8");
assert.equal(
  queryValueAsRole(
    "authenticated",
    "select count(id) from public.questions;",
  ),
  "0",
);
assert.equal(
  queryValueAsRole(
    "authenticated",
    "select count(id) from public.question_options;",
  ),
  "0",
);
assert.equal(
  queryValueAsRole(
    "service_role",
    `select concat_ws(',', count(id), count(correct_answer), count(explanation))
     from public.questions;`,
  ),
  "2,2,2",
);
assert.equal(
  queryValueAsRole(
    "service_role",
    "select concat_ws(',', count(id), count(is_correct)) from public.question_options;",
  ),
  "8,8",
);

assert.throws(
  () =>
    runContentImport({
      databaseUrl,
      document: fixture,
      dryRun: false,
      inactive: false,
    }),
  /Existing question conflicts with the import payload/,
);

console.log("Content importer database checks passed.");
