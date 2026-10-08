create type public.question_type as enum (
  'multiple_choice',
  'image_choice',
  'definition_choice',
  'opposite',
  'sentence_gap',
  'audio_choice'
);

create table public.games (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null unique,
  description text not null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),

  constraint games_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint games_v1_slug
    check (slug in ('word-rush', 'verb-challenge', 'describe-it')),
  constraint games_name_length
    check (char_length(btrim(name)) between 1 and 80),
  constraint games_description_length
    check (char_length(btrim(description)) between 1 and 500)
);

create table public.topics (
  id bigint generated always as identity primary key,
  game_id bigint not null references public.games (id) on delete restrict,
  name text not null,
  slug text not null,
  cefr_level public.cefr_level not null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),

  constraint topics_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint topics_name_length
    check (char_length(btrim(name)) between 1 and 100),
  constraint topics_game_level_slug_key
    unique (game_id, cefr_level, slug),
  constraint topics_id_game_level_key
    unique (id, game_id, cefr_level)
);

create table public.concepts (
  id bigint generated always as identity primary key,
  game_id bigint not null references public.games (id) on delete restrict,
  topic_id bigint not null,
  name text not null,
  slug text not null,
  cefr_level public.cefr_level not null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),

  constraint concepts_topic_game_level_fkey
    foreign key (topic_id, game_id, cefr_level)
    references public.topics (id, game_id, cefr_level)
    on delete restrict,
  constraint concepts_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint concepts_name_length
    check (char_length(btrim(name)) between 1 and 120),
  constraint concepts_topic_slug_key
    unique (topic_id, slug),
  constraint concepts_id_topic_game_level_key
    unique (id, topic_id, game_id, cefr_level)
);

create table public.questions (
  id bigint generated always as identity primary key,
  game_id bigint not null references public.games (id) on delete restrict,
  topic_id bigint not null,
  concept_id bigint not null,
  cefr_level public.cefr_level not null,
  difficulty smallint not null,
  question_type public.question_type not null,
  prompt text not null,
  correct_answer text not null,
  explanation text,
  image_path text,
  audio_path text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),

  constraint questions_topic_game_level_fkey
    foreign key (topic_id, game_id, cefr_level)
    references public.topics (id, game_id, cefr_level)
    on delete restrict,
  constraint questions_concept_topic_game_level_fkey
    foreign key (concept_id, topic_id, game_id, cefr_level)
    references public.concepts (id, topic_id, game_id, cefr_level)
    on delete restrict,
  constraint questions_difficulty_range
    check (difficulty between 1 and 3),
  constraint questions_prompt_length
    check (char_length(btrim(prompt)) between 1 and 1000),
  constraint questions_correct_answer_length
    check (char_length(btrim(correct_answer)) between 1 and 250),
  constraint questions_explanation_length
    check (
      explanation is null
      or char_length(btrim(explanation)) between 1 and 500
    ),
  constraint questions_image_path_length
    check (
      image_path is null
      or char_length(btrim(image_path)) between 1 and 2048
    ),
  constraint questions_audio_path_length
    check (
      audio_path is null
      or char_length(btrim(audio_path)) between 1 and 2048
    )
);

create table public.question_options (
  id bigint generated always as identity primary key,
  question_id bigint not null
    references public.questions (id) on delete cascade,
  text text not null,
  is_correct boolean not null default false,
  position smallint not null,

  constraint question_options_text_length
    check (char_length(btrim(text)) between 1 and 250),
  constraint question_options_position_range
    check (position between 1 and 6),
  constraint question_options_question_position_key
    unique (question_id, position),
  constraint question_options_question_text_key
    unique (question_id, text)
);

create index topics_active_lookup_idx
on public.topics (game_id, cefr_level, slug)
where is_active;

create index concepts_active_lookup_idx
on public.concepts (game_id, cefr_level, topic_id)
where is_active;

create index questions_selection_idx
on public.questions (game_id, cefr_level, difficulty, question_type)
where is_active;

create index questions_concept_lookup_idx
on public.questions (concept_id, difficulty)
where is_active;

create function public.assert_question_options_valid(target_question_id bigint)
returns void
language plpgsql
set search_path = ''
as $$
declare
  answer_text text;
  correct_options integer;
  matching_correct_options integer;
  maximum_position integer;
  minimum_position integer;
  option_count integer;
  question_is_active boolean;
begin
  select questions.correct_answer, questions.is_active
  into answer_text, question_is_active
  from public.questions
  where questions.id = target_question_id;

  if not found or not question_is_active then
    return;
  end if;

  select
    count(*),
    count(*) filter (where question_options.is_correct),
    count(*) filter (
      where question_options.is_correct
        and btrim(question_options.text) = btrim(answer_text)
    ),
    min(question_options.position),
    max(question_options.position)
  into
    option_count,
    correct_options,
    matching_correct_options,
    minimum_position,
    maximum_position
  from public.question_options
  where question_options.question_id = target_question_id;

  if option_count not between 2 and 6 then
    raise exception 'Active questions require between 2 and 6 options'
      using errcode = '23514';
  end if;

  if correct_options <> 1 or matching_correct_options <> 1 then
    raise exception 'Active questions require one matching correct option'
      using errcode = '23514';
  end if;

  if minimum_position <> 1 or maximum_position <> option_count then
    raise exception 'Question option positions must be contiguous from 1'
      using errcode = '23514';
  end if;
end;
$$;

create function public.validate_question_options_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'questions' then
    perform public.assert_question_options_valid(new.id);
  else
    if tg_op in ('UPDATE', 'DELETE') then
      perform public.assert_question_options_valid(old.question_id);
    end if;

    if tg_op in ('INSERT', 'UPDATE')
      and (tg_op = 'INSERT' or new.question_id <> old.question_id)
    then
      perform public.assert_question_options_valid(new.question_id);
    end if;
  end if;

  return null;
end;
$$;

revoke all on function public.assert_question_options_valid(bigint)
from public, anon, authenticated;
revoke all on function public.validate_question_options_trigger()
from public, anon, authenticated;

create constraint trigger validate_question_options_on_question
after insert or update of is_active, correct_answer
on public.questions
deferrable initially deferred
for each row
execute function public.validate_question_options_trigger();

create constraint trigger validate_question_options_on_option
after insert or update or delete
on public.question_options
deferrable initially deferred
for each row
execute function public.validate_question_options_trigger();

alter table public.games enable row level security;
alter table public.topics enable row level security;
alter table public.concepts enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;

revoke all on table public.games from public, anon, authenticated;
revoke all on table public.topics from public, anon, authenticated;
revoke all on table public.concepts from public, anon, authenticated;
revoke all on table public.questions from public, anon, authenticated;
revoke all on table public.question_options from public, anon, authenticated;

grant select (id, slug, name, description, is_active)
on public.games to authenticated;
grant select (id, game_id, name, slug, cefr_level, is_active)
on public.topics to authenticated;
grant select (id, game_id, topic_id, name, slug, cefr_level, is_active)
on public.concepts to authenticated;
grant select (
  id,
  game_id,
  topic_id,
  concept_id,
  cefr_level,
  difficulty,
  question_type,
  prompt,
  image_path,
  audio_path,
  is_active
)
on public.questions to authenticated;
grant select (id, question_id, text, position)
on public.question_options to authenticated;

grant all privileges on table public.games to service_role;
grant all privileges on table public.topics to service_role;
grant all privileges on table public.concepts to service_role;
grant all privileges on table public.questions to service_role;
grant all privileges on table public.question_options to service_role;

grant all privileges on sequence public.games_id_seq to service_role;
grant all privileges on sequence public.topics_id_seq to service_role;
grant all privileges on sequence public.concepts_id_seq to service_role;
grant all privileges on sequence public.questions_id_seq to service_role;
grant all privileges on sequence public.question_options_id_seq to service_role;

create policy "Authenticated users can read active games"
on public.games
for select
to authenticated
using (is_active);

create policy "Authenticated users can read active topics"
on public.topics
for select
to authenticated
using (
  is_active
  and exists (
    select 1
    from public.games
    where games.id = topics.game_id
      and games.is_active
  )
);

create policy "Authenticated users can read active concepts"
on public.concepts
for select
to authenticated
using (
  is_active
  and exists (
    select 1
    from public.topics
    join public.games on games.id = topics.game_id
    where topics.id = concepts.topic_id
      and topics.is_active
      and games.is_active
  )
);

create policy "Authenticated users can read active questions"
on public.questions
for select
to authenticated
using (
  is_active
  and exists (
    select 1
    from public.concepts
    join public.topics on topics.id = concepts.topic_id
    join public.games on games.id = concepts.game_id
    where concepts.id = questions.concept_id
      and concepts.is_active
      and topics.is_active
      and games.is_active
  )
);

create policy "Authenticated users can read active question options"
on public.question_options
for select
to authenticated
using (
  exists (
    select 1
    from public.questions
    join public.concepts on concepts.id = questions.concept_id
    join public.topics on topics.id = questions.topic_id
    join public.games on games.id = questions.game_id
    where questions.id = question_options.question_id
      and questions.is_active
      and concepts.is_active
      and topics.is_active
      and games.is_active
  )
);
