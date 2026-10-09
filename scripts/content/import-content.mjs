import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  readContentDocument,
  validateContentDocument,
} from "./validate-content.mjs";

const REPORT_PREFIX = "CONTENT_IMPORT_REPORT:";

function parseArguments(argumentsList) {
  const options = {
    allowRemote: false,
    file: null,
    mode: "validate-only",
  };

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--file") {
      options.file = argumentsList[index + 1] ?? null;
      index += 1;
    } else if (argument === "--dry-run") {
      options.mode = "dry-run";
    } else if (argument === "--apply") {
      options.mode = "apply";
    } else if (argument === "--validate-only") {
      options.mode = "validate-only";
    } else if (argument === "--allow-remote") {
      options.allowRemote = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!options.file) {
    throw new Error("Use --file <path>.");
  }

  return options;
}

export function getPostgresEnvironment(databaseUrl, allowRemote = false) {
  let parsedUrl;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error("CONTENT_DATABASE_URL must be a valid PostgreSQL URL.");
  }

  if (!["postgres:", "postgresql:"].includes(parsedUrl.protocol)) {
    throw new Error("CONTENT_DATABASE_URL must use postgres:// or postgresql://.");
  }

  const localHosts = new Set(["127.0.0.1", "::1", "localhost"]);
  if (!localHosts.has(parsedUrl.hostname) && !allowRemote) {
    throw new Error(
      "Remote imports are blocked. Use --allow-remote only after explicit authorization.",
    );
  }

  const databaseName = decodeURIComponent(parsedUrl.pathname.replace(/^\//, ""));
  if (!databaseName) {
    throw new Error("CONTENT_DATABASE_URL must include a database name.");
  }

  return {
    PGDATABASE: databaseName,
    PGHOST: parsedUrl.hostname,
    PGPASSWORD: decodeURIComponent(parsedUrl.password),
    PGPORT: parsedUrl.port || "5432",
    PGSSLMODE: parsedUrl.searchParams.get("sslmode") ?? "prefer",
    PGUSER: decodeURIComponent(parsedUrl.username || process.env.USER || "postgres"),
  };
}

export function buildImportSql(document, { dryRun }) {
  const payload = Buffer.from(JSON.stringify(document), "utf8").toString("base64");
  const finishTransaction = dryRun ? "rollback;" : "commit;";

  return `
begin;
select pg_advisory_xact_lock(hashtextextended('englishbyloris-content-import', 0));

create temporary table content_import_payload (payload jsonb not null) on commit drop;
insert into content_import_payload (payload)
values (convert_from(decode('${payload}', 'base64'), 'UTF8')::jsonb);

create temporary table content_import_stage on commit drop as
select
  item.ordinality::integer as source_order,
  item.question ->> 'sourceId' as source_id,
  item.question #>> '{game,slug}' as game_slug,
  item.question #>> '{game,name}' as game_name,
  item.question #>> '{game,description}' as game_description,
  item.question #>> '{topic,slug}' as topic_slug,
  item.question #>> '{topic,name}' as topic_name,
  item.question #>> '{concept,slug}' as concept_slug,
  item.question #>> '{concept,name}' as concept_name,
  item.question ->> 'cefrLevel' as cefr_level,
  (item.question ->> 'difficulty')::smallint as difficulty,
  item.question ->> 'questionType' as question_type,
  item.question ->> 'prompt' as prompt,
  item.question ->> 'correctAnswer' as correct_answer,
  item.question ->> 'explanation' as explanation,
  nullif(item.question ->> 'imagePath', '') as image_path,
  nullif(item.question ->> 'audioPath', '') as audio_path,
  item.question -> 'options' as options
from content_import_payload,
jsonb_array_elements(payload -> 'questions') with ordinality
  as item(question, ordinality);

create temporary table content_import_report (
  metric text primary key,
  value integer not null
) on commit drop;

with inserted as (
  insert into public.games (slug, name, description)
  select distinct game_slug, game_name, game_description
  from content_import_stage
  on conflict (slug) do nothing
  returning id
)
insert into content_import_report values ('games_inserted', (select count(*) from inserted));

do $$
begin
  if exists (
    select 1
    from content_import_stage stage
    join public.games on games.slug = stage.game_slug
    where games.name <> stage.game_name
      or games.description <> stage.game_description
  ) then
    raise exception 'Existing game taxonomy conflicts with the import payload';
  end if;
end;
$$;

with inserted as (
  insert into public.topics (game_id, name, slug, cefr_level)
  select distinct games.id, stage.topic_name, stage.topic_slug,
    stage.cefr_level::public.cefr_level
  from content_import_stage stage
  join public.games on games.slug = stage.game_slug
  on conflict (game_id, cefr_level, slug) do nothing
  returning id
)
insert into content_import_report values ('topics_inserted', (select count(*) from inserted));

do $$
begin
  if exists (
    select 1
    from content_import_stage stage
    join public.games on games.slug = stage.game_slug
    join public.topics on topics.game_id = games.id
      and topics.cefr_level = stage.cefr_level::public.cefr_level
      and topics.slug = stage.topic_slug
    where topics.name <> stage.topic_name
  ) then
    raise exception 'Existing topic taxonomy conflicts with the import payload';
  end if;
end;
$$;

with inserted as (
  insert into public.concepts (
    game_id,
    topic_id,
    name,
    slug,
    cefr_level
  )
  select distinct games.id, topics.id, stage.concept_name, stage.concept_slug,
    stage.cefr_level::public.cefr_level
  from content_import_stage stage
  join public.games on games.slug = stage.game_slug
  join public.topics on topics.game_id = games.id
    and topics.cefr_level = stage.cefr_level::public.cefr_level
    and topics.slug = stage.topic_slug
  on conflict (topic_id, slug) do nothing
  returning id
)
insert into content_import_report values ('concepts_inserted', (select count(*) from inserted));

do $$
begin
  if exists (
    select 1
    from content_import_stage stage
    join public.games on games.slug = stage.game_slug
    join public.topics on topics.game_id = games.id
      and topics.cefr_level = stage.cefr_level::public.cefr_level
      and topics.slug = stage.topic_slug
    join public.concepts on concepts.topic_id = topics.id
      and concepts.slug = stage.concept_slug
    where concepts.name <> stage.concept_name
      or concepts.game_id <> games.id
      or concepts.cefr_level <> stage.cefr_level::public.cefr_level
  ) then
    raise exception 'Existing concept taxonomy conflicts with the import payload';
  end if;
end;
$$;

create temporary table content_import_existing on commit drop as
select stage.source_id, questions.id as question_id
from content_import_stage stage
join public.games on games.slug = stage.game_slug
join public.topics on topics.game_id = games.id
  and topics.cefr_level = stage.cefr_level::public.cefr_level
  and topics.slug = stage.topic_slug
join public.concepts on concepts.topic_id = topics.id
  and concepts.slug = stage.concept_slug
join public.questions on questions.concept_id = concepts.id
  and questions.prompt = stage.prompt;

do $$
begin
  if exists (
    select 1
    from content_import_existing existing
    join content_import_stage stage using (source_id)
    join public.questions on questions.id = existing.question_id
    where questions.difficulty <> stage.difficulty
      or questions.question_type <> stage.question_type::public.question_type
      or questions.correct_answer <> stage.correct_answer
      or questions.explanation is distinct from stage.explanation
      or questions.image_path is distinct from stage.image_path
      or questions.audio_path is distinct from stage.audio_path
      or coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'text', question_options.text,
            'isCorrect', question_options.is_correct,
            'position', question_options.position
          ) order by question_options.position
        )
        from public.question_options
        where question_options.question_id = questions.id
      ), '[]'::jsonb) <> stage.options
  ) then
    raise exception 'Existing question conflicts with the import payload';
  end if;
end;
$$;

with inserted as (
  insert into public.questions (
    game_id,
    topic_id,
    concept_id,
    cefr_level,
    difficulty,
    question_type,
    prompt,
    correct_answer,
    explanation,
    image_path,
    audio_path
  )
  select
    games.id,
    topics.id,
    concepts.id,
    stage.cefr_level::public.cefr_level,
    stage.difficulty,
    stage.question_type::public.question_type,
    stage.prompt,
    stage.correct_answer,
    stage.explanation,
    stage.image_path,
    stage.audio_path
  from content_import_stage stage
  join public.games on games.slug = stage.game_slug
  join public.topics on topics.game_id = games.id
    and topics.cefr_level = stage.cefr_level::public.cefr_level
    and topics.slug = stage.topic_slug
  join public.concepts on concepts.topic_id = topics.id
    and concepts.slug = stage.concept_slug
  where not exists (
    select 1
    from content_import_existing existing
    where existing.source_id = stage.source_id
  )
  returning id
)
insert into content_import_report values ('questions_inserted', (select count(*) from inserted));

create temporary table content_import_resolved on commit drop as
select stage.source_id, questions.id as question_id,
  (existing.question_id is not null) as was_existing
from content_import_stage stage
join public.games on games.slug = stage.game_slug
join public.topics on topics.game_id = games.id
  and topics.cefr_level = stage.cefr_level::public.cefr_level
  and topics.slug = stage.topic_slug
join public.concepts on concepts.topic_id = topics.id
  and concepts.slug = stage.concept_slug
join public.questions on questions.concept_id = concepts.id
  and questions.prompt = stage.prompt
left join content_import_existing existing using (source_id);

with inserted as (
  insert into public.question_options (question_id, text, is_correct, position)
  select
    resolved.question_id,
    option_values.text,
    option_values."isCorrect",
    option_values.position
  from content_import_stage stage
  join content_import_resolved resolved using (source_id)
  cross join jsonb_to_recordset(stage.options)
    as option_values(text text, "isCorrect" boolean, position smallint)
  where not resolved.was_existing
  returning id
)
insert into content_import_report values ('options_inserted', (select count(*) from inserted));

insert into content_import_report
values (
  'questions_skipped',
  (select count(*) from content_import_existing)
);

set constraints all immediate;

select '${REPORT_PREFIX}' || jsonb_build_object(
  'mode', '${dryRun ? "dry-run" : "apply"}',
  'questionsTotal', (select count(*) from content_import_stage),
  'questionsInserted', (select value from content_import_report where metric = 'questions_inserted'),
  'questionsSkipped', (select value from content_import_report where metric = 'questions_skipped'),
  'invalid', 0,
  'optionsInserted', (select value from content_import_report where metric = 'options_inserted'),
  'gamesInserted', (select value from content_import_report where metric = 'games_inserted'),
  'topicsInserted', (select value from content_import_report where metric = 'topics_inserted'),
  'conceptsInserted', (select value from content_import_report where metric = 'concepts_inserted')
)::text;

${finishTransaction}
`;
}

export function runContentImport({
  allowRemote = false,
  databaseUrl,
  document,
  dryRun,
}) {
  const postgresEnvironment = getPostgresEnvironment(databaseUrl, allowRemote);
  const validation = validateContentDocument(document);

  if (!validation.valid) {
    return {
      databaseReport: null,
      validation,
    };
  }

  const execution = spawnSync("psql", ["-X", "-qAt", "--set", "ON_ERROR_STOP=1"], {
    encoding: "utf8",
    env: { ...process.env, ...postgresEnvironment },
    input: buildImportSql(document, { dryRun }),
  });

  if (execution.error) {
    throw execution.error;
  }
  if (execution.status !== 0) {
    throw new Error(execution.stderr.trim() || "Content import failed.");
  }

  const reportLine = execution.stdout
    .split("\n")
    .find((line) => line.startsWith(REPORT_PREFIX));
  if (!reportLine) {
    throw new Error("Importer did not return a report.");
  }

  return {
    databaseReport: JSON.parse(reportLine.slice(REPORT_PREFIX.length)),
    validation,
  };
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  try {
    const options = parseArguments(process.argv.slice(2));
    const document = readContentDocument(path.resolve(options.file));
    const validation = validateContentDocument(document);

    if (options.mode === "validate-only") {
      console.log(JSON.stringify({ databaseReport: null, validation }, null, 2));
      process.exitCode = validation.valid ? 0 : 1;
    } else {
      const databaseUrl = process.env.CONTENT_DATABASE_URL;
      if (!databaseUrl) {
        throw new Error("CONTENT_DATABASE_URL is required for database modes.");
      }
      const report = runContentImport({
        allowRemote: options.allowRemote,
        databaseUrl,
        document,
        dryRun: options.mode === "dry-run",
      });
      console.log(JSON.stringify(report, null, 2));
      process.exitCode = report.validation.valid ? 0 : 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
