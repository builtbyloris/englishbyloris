# englishbyloris

Mobile-first English practice web app. The V1 product scope and implementation rules live in `PROJECT_SPEC_englishbyloris.md`.

## Requirements

- Node.js 20.9 or newer
- npm

## Local setup

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No environment variables are required for Milestone 1. When later milestones add them, copy `.env.example` to `.env.local` and replace placeholders locally. Never commit local environment files or credentials.

## Commands

```bash
npm run dev    # Start the local development server
npm run lint   # Run ESLint
npm run build  # Create a production build
npm run start  # Serve the production build
```

## Deployment

The project is structured for deployment on Vercel through its GitHub integration. After the repository is connected to Vercel, use the standard Next.js build settings and configure future environment variables in the Vercel project dashboard. Deployment is intentionally outside Milestone 1.
