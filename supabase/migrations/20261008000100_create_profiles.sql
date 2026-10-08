create type public.cefr_level as enum ('A1', 'A2', 'B1', 'B2');
create type public.learning_interest as enum (
  'Vocabulary',
  'Verbs',
  'Adjectives'
);
create type public.app_theme as enum ('light', 'dark');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  english_level public.cefr_level,
  learning_interests public.learning_interest[] not null
    default '{}'::public.learning_interest[],
  theme public.app_theme,
  xp bigint not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  onboarding_completed boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  constraint profiles_display_name_length
    check (display_name is null or char_length(display_name) <= 100),
  constraint profiles_avatar_url_length
    check (avatar_url is null or char_length(avatar_url) <= 2048),
  constraint profiles_learning_interests_count
    check (cardinality(learning_interests) <= 3),
  constraint profiles_xp_nonnegative check (xp >= 0),
  constraint profiles_current_streak_nonnegative check (current_streak >= 0),
  constraint profiles_longest_streak_nonnegative check (longest_streak >= 0),
  constraint profiles_longest_streak_consistent
    check (longest_streak >= current_streak),
  constraint profiles_completed_onboarding_has_preferences
    check (
      not onboarding_completed
      or (
        english_level is not null
        and cardinality(learning_interests) > 0
      )
    )
);

comment on column public.profiles.theme is
  'Nullable until the product default theme is explicitly confirmed.';
comment on column public.profiles.xp is
  'Server-managed metric; direct updates by authenticated clients are denied.';
comment on column public.profiles.current_streak is
  'Server-managed metric; direct updates by authenticated clients are denied.';
comment on column public.profiles.longest_streak is
  'Server-managed metric; direct updates by authenticated clients are denied.';
comment on column public.profiles.last_activity_date is
  'Server-managed metric; direct updates by authenticated clients are denied.';

create function public.set_profiles_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_profiles_updated_at() from public, anon, authenticated;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(
      nullif(
        btrim(
          coalesce(
            new.raw_user_meta_data ->> 'full_name',
            new.raw_user_meta_data ->> 'name',
            ''
          )
        ),
        ''
      ),
      100
    ),
    left(
      nullif(
        btrim(coalesce(new.raw_user_meta_data ->> 'avatar_url', '')),
        ''
      ),
      2048
    )
  );

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Create profiles for Auth users that predate this migration.
insert into public.profiles (id, display_name, avatar_url)
select
  users.id,
  left(
    nullif(
      btrim(
        coalesce(
          users.raw_user_meta_data ->> 'full_name',
          users.raw_user_meta_data ->> 'name',
          ''
        )
      ),
      ''
    ),
    100
  ),
  left(
    nullif(
      btrim(coalesce(users.raw_user_meta_data ->> 'avatar_url', '')),
      ''
    ),
    2048
  )
from auth.users as users
on conflict (id) do nothing;

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (
  display_name,
  avatar_url,
  english_level,
  learning_interests,
  theme,
  onboarding_completed
) on table public.profiles to authenticated;
grant all privileges on table public.profiles to service_role;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
