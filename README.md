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

Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for local OAuth callbacks. In production, set it to the canonical HTTPS application origin without a trailing path.

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

## Google OAuth

Google is the only V1 authentication provider. The app starts the cookie-backed PKCE flow through Supabase, exchanges the returned code at `/auth/callback`, validates identity with `getClaims()` and routes from the real `profiles.onboarding_completed` value. `/home` and `/onboarding` are server-protected placeholders until their dedicated milestones.

### Google Cloud

1. In Google Auth Platform, configure the consent screen and create an OAuth client with application type **Web application**.
2. Add `http://localhost:3000` as an Authorized JavaScript origin for local development.
3. Add the Supabase callback below as an Authorized redirect URI:

   ```text
   https://ayzjcttjlcmwgzsvkigs.supabase.co/auth/v1/callback
   ```

4. Copy the Google Client ID and Client Secret. Store both only in the Supabase Google provider settings; do not add them to this repository or to public Next.js environment variables.

### Supabase

In project `ayzjcttjlcmwgzsvkigs`:

1. Open **Authentication → Providers → Google**, enable Google and enter the Google Client ID and Client Secret.
2. Open **Authentication → URL Configuration**. Use `http://localhost:3000` as the Site URL while testing locally and add this exact Redirect URL:

   ```text
   http://localhost:3000/auth/callback
   ```

3. For production, replace the Site URL with the canonical HTTPS Vercel domain, add `https://your-domain.example/auth/callback` to the redirect allow list and set the same origin in Vercel as `NEXT_PUBLIC_SITE_URL`.
4. If Vercel preview authentication is required later, add a narrowly scoped Vercel preview redirect pattern in Supabase and set the preview environment URL separately. Keep the production callback exact.

No Google Client Secret is needed by Next.js. Login and logout should be tested again after the provider and allowed redirect URLs are configured.

## Deployment

The project is structured for deployment on Vercel through its GitHub integration. After the repository is connected to Vercel, use the standard Next.js build settings and configure future environment variables in the Vercel project dashboard. Deployment is intentionally outside Milestone 1.
