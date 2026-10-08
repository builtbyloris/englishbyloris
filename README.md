# englishbyloris

Mobile-first English practice web app. The V1 product scope and implementation rules live in `PROJECT_SPEC_englishbyloris.md`.

## Requirements

- Node.js 20.9 or newer
- npm

## Local setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Replace the placeholders in `.env.local` with the Project URL and publishable key from the Supabase project Connect dialog. Never commit local environment files or credentials.

## Theme foundations

Light and Dark tokens are available without adding a theme preference or selector yet. For manual development checks, set `data-theme="light"` or `data-theme="dark"` on the root `<html>` element in browser developer tools. With no attribute, the existing Light presentation remains the temporary technical fallback; the product default is still undecided.

## Commands

```bash
npm run dev    # Start the local development server
npm run lint   # Run ESLint
npm run build  # Create a production build
npm run start  # Serve the production build
```

## Supabase

The browser and server clients use `@supabase/ssr` with cookie-backed sessions. Next.js `proxy.ts` refreshes and validates Auth tokens with `auth.getClaims()`. Only the public Project URL and publishable key belong in the web app; do not add a secret key or legacy `service_role` key to browser or repository configuration.

The initial migration at `supabase/migrations/20261008000100_create_profiles.sql` creates the profile data foundation, Auth trigger, RLS policies and restricted column privileges. A signed-in user can read only their own profile and update only editable profile/onboarding fields. XP, streak, activity dates, identifiers and timestamps remain server-managed.

### Local database

Docker Desktop or another compatible container runtime must be running:

```bash
npx supabase start
npx supabase db reset
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -X -f supabase/tests/profiles_security.sql
```

Use the local values printed by `npx supabase status` in `.env.local`. The local reset recreates the database and applies every versioned migration. The security test runs inside a transaction and rolls back its two temporary Auth users and profiles.

### Remote database

Create or identify the intended Supabase project before running any remote command. Then authenticate, link the exact project and preview pending migrations:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push --dry-run
```

Review the linked project and dry-run output before explicitly applying migrations:

```bash
npx supabase db push
```

Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel for Preview and Production environments. No secret database key is required by the Next.js application at this stage.

## Deployment

The project is structured for deployment on Vercel through its GitHub integration. After the repository is connected to Vercel, use the standard Next.js build settings and configure future environment variables in the Vercel project dashboard. Deployment is intentionally outside Milestone 1.
