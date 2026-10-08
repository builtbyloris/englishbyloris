\set ON_ERROR_STOP on

begin;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'games',
    'topics',
    'concepts',
    'questions',
    'question_options'
  ]
  loop
    if not (
      select relrowsecurity
      from pg_class
      where oid = format('public.%I', table_name)::regclass
    ) then
      raise exception 'RLS must be enabled on public.%', table_name;
    end if;
  end loop;

  if has_table_privilege('anon', 'public.questions', 'select') then
    raise exception 'anon must not be able to select questions';
  end if;

  if has_table_privilege('authenticated', 'public.questions', 'select') then
    raise exception 'authenticated must not receive table-wide question access';
  end if;

  if not has_column_privilege(
    'authenticated',
    'public.questions',
    'prompt',
    'select'
  ) then
    raise exception 'authenticated must be able to read question prompts';
  end if;

  if has_column_privilege(
    'authenticated',
    'public.questions',
    'correct_answer',
    'select'
  ) then
    raise exception 'correct answers must not be directly readable';
  end if;

  if has_column_privilege(
    'authenticated',
    'public.questions',
    'explanation',
    'select'
  ) then
    raise exception 'solutions must not be directly readable';
  end if;

  if has_column_privilege(
    'authenticated',
    'public.question_options',
    'is_correct',
    'select'
  ) then
    raise exception 'option answer keys must not be directly readable';
  end if;

  if has_table_privilege('authenticated', 'public.questions', 'insert')
    or has_table_privilege('authenticated', 'public.questions', 'update')
    or has_table_privilege('authenticated', 'public.questions', 'delete')
  then
    raise exception 'authenticated must not mutate learning content';
  end if;
end;
$$;

set local role service_role;

insert into public.games (slug, name, description)
values (
  'verb-challenge',
  'Verb Challenge',
  'Grammar and verb forms in context.'
);

insert into public.topics (game_id, name, slug, cefr_level)
select id, 'Present Perfect', 'present-perfect', 'B1'
from public.games
where slug = 'verb-challenge';

insert into public.concepts (
  game_id,
  topic_id,
  name,
  slug,
  cefr_level
)
select
  topics.game_id,
  topics.id,
  'Present Perfect — Life Experience',
  'life-experience',
  topics.cefr_level
from public.topics
where topics.slug = 'present-perfect';

insert into public.questions (
  game_id,
  topic_id,
  concept_id,
  cefr_level,
  difficulty,
  question_type,
  prompt,
  correct_answer,
  explanation
)
select
  concepts.game_id,
  concepts.topic_id,
  concepts.id,
  concepts.cefr_level,
  2,
  'sentence_gap',
  'I have ___ this film before.',
  'seen',
  'Use the past participle after have or has.'
from public.concepts
where concepts.slug = 'life-experience';

insert into public.question_options (
  question_id,
  text,
  is_correct,
  position
)
select questions.id, options.text, options.is_correct, options.position
from public.questions
cross join (
  values
    ('saw', false, 1),
    ('seen', true, 2),
    ('seeing', false, 3)
) as options (text, is_correct, position);

set constraints all immediate;

do $$
begin
  begin
    insert into public.games (slug, name, description)
    values ('not-a-v1-game', 'Unexpected Game', 'Outside the V1 catalog.');

    raise exception 'Invalid game slug unexpectedly succeeded';
  exception
    when check_violation then null;
  end;

  begin
    insert into public.questions (
      game_id,
      topic_id,
      concept_id,
      cefr_level,
      difficulty,
      question_type,
      prompt,
      correct_answer,
      is_active
    )
    select
      concepts.game_id,
      concepts.topic_id,
      concepts.id,
      concepts.cefr_level,
      4,
      'multiple_choice',
      'Invalid difficulty',
      'invalid',
      false
    from public.concepts
    limit 1;

    raise exception 'Invalid difficulty unexpectedly succeeded';
  exception
    when check_violation then null;
  end;

  begin
    insert into public.concepts (
      game_id,
      topic_id,
      name,
      slug,
      cefr_level
    )
    select game_id, id, 'Wrong level', 'wrong-level', 'A2'
    from public.topics
    limit 1;

    raise exception 'Cross-level concept unexpectedly succeeded';
  exception
    when foreign_key_violation then null;
  end;

  begin
    update public.question_options
    set is_correct = false;
    set constraints all immediate;

    raise exception 'Question without a correct option unexpectedly succeeded';
  exception
    when check_violation then null;
  end;

  begin
    delete from public.games
    where slug = 'verb-challenge';

    raise exception 'Game deletion with dependent topics unexpectedly succeeded';
  exception
    when restrict_violation then null;
  end;

  begin
    delete from public.topics
    where slug = 'present-perfect';

    raise exception 'Topic deletion with dependent concepts unexpectedly succeeded';
  exception
    when restrict_violation then null;
  end;

  begin
    delete from public.concepts
    where slug = 'life-experience';

    raise exception 'Concept deletion with dependent questions unexpectedly succeeded';
  exception
    when restrict_violation then null;
  end;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-0000-0000-000000000001',
  true
);

do $$
declare
  visible_concepts integer;
  visible_games integer;
  visible_options integer;
  visible_questions integer;
  visible_topics integer;
begin
  select count(id) into visible_games
  from public.games;
  select count(id) into visible_topics
  from public.topics;
  select count(id) into visible_concepts
  from public.concepts;
  select count(id) into visible_questions
  from public.questions;
  select count(id) into visible_options
  from public.question_options;

  if visible_games <> 1
    or visible_topics <> 1
    or visible_concepts <> 1
    or visible_questions <> 1
    or visible_options <> 3
  then
    raise exception 'Authenticated active-content visibility is incorrect';
  end if;

  begin
    insert into public.games (slug, name, description)
    values ('word-rush', 'Word Rush', 'Forbidden client insert.');

    raise exception 'Authenticated content insert unexpectedly succeeded';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;

update public.games
set is_active = false
where slug = 'verb-challenge';

set local role authenticated;

do $$
begin
  if exists (select id from public.games)
    or exists (select id from public.topics)
    or exists (select id from public.concepts)
    or exists (select id from public.questions)
    or exists (select id from public.question_options)
  then
    raise exception 'Inactive content must be hidden through the hierarchy';
  end if;
end;
$$;

reset role;

delete from public.questions
where prompt = 'I have ___ this film before.';

do $$
begin
  if exists (
    select 1
    from public.question_options
  ) then
    raise exception 'Deleting a question must cascade to its options';
  end if;
end;
$$;

rollback;
