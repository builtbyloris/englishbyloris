\set ON_ERROR_STOP on

begin;

do $$
begin
  if not (
    select relrowsecurity
    from pg_class
    where oid = 'public.profiles'::regclass
  ) then
    raise exception 'RLS must be enabled on public.profiles';
  end if;

  if has_table_privilege('anon', 'public.profiles', 'select') then
    raise exception 'anon must not be able to select profiles';
  end if;

  if has_column_privilege(
    'authenticated',
    'public.profiles',
    'xp',
    'update'
  ) then
    raise exception 'authenticated must not be able to update XP';
  end if;

  if not has_column_privilege(
    'authenticated',
    'public.profiles',
    'display_name',
    'update'
  ) then
    raise exception 'authenticated must be able to update display_name';
  end if;

  if (
    select count(*)
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and cmd in ('SELECT', 'UPDATE')
  ) <> 2 then
    raise exception 'Expected one SELECT and one UPDATE profile policy';
  end if;
end;
$$;

insert into auth.users (
  id,
  aud,
  role,
  email,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'profile-test-one@example.invalid',
    '{"full_name":"Test User One","avatar_url":"https://example.invalid/one.png"}',
    now(),
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'profile-test-two@example.invalid',
    '{"name":"Test User Two"}',
    now(),
    now()
  );

do $$
begin
  if (
    select count(*)
    from public.profiles
    where id in (
      '10000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000002'
    )
  ) <> 2 then
    raise exception 'Auth trigger did not create both profiles';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = '10000000-0000-0000-0000-000000000001'
      and display_name = 'Test User One'
      and avatar_url = 'https://example.invalid/one.png'
      and english_level is null
      and theme is null
      and learning_interests = '{}'::public.learning_interest[]
      and onboarding_completed = false
      and xp = 0
      and current_streak = 0
      and longest_streak = 0
  ) then
    raise exception 'New profile defaults or metadata are incorrect';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-0000-0000-000000000001',
  true
);

do $$
declare
  visible_profiles integer;
  changed_profiles integer;
begin
  select count(*) into visible_profiles from public.profiles;

  if visible_profiles <> 1 then
    raise exception 'RLS must expose exactly the current user profile';
  end if;

  update public.profiles
  set display_name = 'Updated User',
      english_level = 'B1',
      learning_interests = array[
        'Vocabulary'::public.learning_interest,
        'Verbs'::public.learning_interest
      ],
      theme = 'dark',
      onboarding_completed = true
  where id = '10000000-0000-0000-0000-000000000001';

  get diagnostics changed_profiles = row_count;
  if changed_profiles <> 1 then
    raise exception 'The current user must be able to update editable fields';
  end if;

  update public.profiles
  set display_name = 'Forbidden cross-user update'
  where id = '10000000-0000-0000-0000-000000000002';

  get diagnostics changed_profiles = row_count;
  if changed_profiles <> 0 then
    raise exception 'RLS allowed a cross-user update';
  end if;
end;
$$;

do $$
begin
  begin
    update public.profiles
    set xp = 999999
    where id = '10000000-0000-0000-0000-000000000001';

    raise exception 'Protected XP update unexpectedly succeeded';
  exception
    when insufficient_privilege then null;
  end;

  begin
    delete from public.profiles
    where id = '10000000-0000-0000-0000-000000000001';

    raise exception 'Profile delete unexpectedly succeeded';
  exception
    when insufficient_privilege then null;
  end;

  begin
    insert into public.profiles (id)
    values ('10000000-0000-0000-0000-000000000003');

    raise exception 'Direct profile insert unexpectedly succeeded';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;
rollback;
