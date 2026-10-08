import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);

function loadTypeScriptModule(relativePath, aliases = {}) {
  const source = fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: relativePath,
  }).outputText;
  const loadedModule = { exports: {} };
  const localRequire = (specifier) =>
    aliases[specifier] ?? nodeRequire(specifier);

  new Function("require", "module", "exports", output)(
    localRequire,
    loadedModule,
    loadedModule.exports,
  );

  return loadedModule.exports;
}

const onboarding = loadTypeScriptModule("lib/onboarding/validation.ts");
const profile = loadTypeScriptModule("lib/profile/validation.ts", {
  "@/lib/onboarding/validation": onboarding,
});

assert.equal(
  profile.validateProfilePreferences("B1", [], "").success,
  false,
  "At least one interest must be required",
);
assert.equal(
  profile.validateProfilePreferences("C1", ["Vocabulary"], "light").success,
  false,
  "Only A1-B2 levels must be accepted",
);
assert.equal(
  profile.validateProfilePreferences("B1", ["Vocabulary"], "system").success,
  false,
  "System theme must not be accepted",
);
assert.equal(
  profile.validateProfilePreferences(
    "B1",
    ["Vocabulary", "Vocabulary"],
    "dark",
  ).success,
  false,
  "Duplicate interests must not be accepted",
);

const nullableTheme = profile.validateProfilePreferences(
  "B1",
  ["Verbs", "Vocabulary"],
  "",
);
assert.equal(nullableTheme.success, true);
assert.deepEqual(nullableTheme.data, {
  interests: ["Vocabulary", "Verbs"],
  level: "B1",
  theme: null,
});

const themeOnly = profile.buildProfilePreferenceUpdate(
  { interests: ["Vocabulary", "Verbs"], level: "B1", theme: null },
  { interests: ["Vocabulary", "Verbs"], level: "B1", theme: "dark" },
);
assert.deepEqual(themeOnly.updates, { theme: "dark" });

const editableFields = profile.buildProfilePreferenceUpdate(
  { interests: ["Vocabulary", "Verbs"], level: "B1", theme: "dark" },
  { interests: ["Adjectives"], level: "B2", theme: null },
);
assert.deepEqual(editableFields.updates, {
  english_level: "B2",
  learning_interests: ["Adjectives"],
});
assert.equal(
  editableFields.resultingPreferences.theme,
  "dark",
  "An existing theme must not be cleared by a null submission",
);
assert.deepEqual(Object.keys(editableFields.updates).sort(), [
  "english_level",
  "learning_interests",
]);

console.log("Profile preference validation checks passed.");
