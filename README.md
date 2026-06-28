# AI Learning Path

A curated, persona-aware curriculum for AI engineering — from LLM basics to production agents, with a monthly news radar powered by [awesome-ai-news](https://github.com/GetStream/awesome-ai-news).

**Live app:** [https://www.vidyanix.ai](https://www.vidyanix.ai)

## Features

- 7 phases, ~65 resources (videos, courses, repos, books, papers, guides)
- **Manager track** — essential resources for engineering leaders
- **Full track** — beginner → expert path
- **AI News Radar** — map headlines to curriculum learning actions
- **Progress tracking** — localStorage with export/import JSON; optional cloud sync via Supabase
- **Search & filters** — `/search` across all resources by type and difficulty
- **Shareable URLs** — `/phase/agent-foundations`, `/news-radar`, `/privacy`

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Validate content, generate sitemap, production build → `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run Oxlint |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) |
| `npm run validate:content` | Zod validation + unique resource IDs |
| `npm run check:links` | HEAD-check all resource URLs |
| `npm run content:extract` | Regenerate JSON from TS (legacy migration helper) |

Sync news drafts from awesome-ai-news:

```bash
npx tsx scripts/sync-news-highlights.ts
```

Review `content/news-highlights-draft.json` before merging into `content/ai-news-radar.json`.

## Editing curriculum content

Content lives in JSON under `content/`:

| File | Contents |
|------|----------|
| `content/learning-path.json` | Phases, steps, resources |
| `content/personas.json` | Manager / Full track priorities |
| `content/ai-news-radar.json` | News bridges and highlights |

Run `npm run validate:content` after edits. CI runs this on every PR.

## Routes

| URL | Page |
|-----|------|
| `/` | Roadmap overview |
| `/search` | Search & filter all resources |
| `/news-radar` | AI News Radar |
| `/privacy` | Privacy policy |
| `/phase/:phaseId` | Phase detail (e.g. `/phase/llm-fundamentals`) |

## Cloud sync (Supabase — optional)

Without Supabase env vars the app works fully offline with localStorage only.

1. Create a [Supabase](https://supabase.com) project
2. Run the migration:
   ```bash
   npm run migrate:supabase
   ```
   Requires `SUPABASE_DB_PASSWORD` in `.env` (Dashboard → **Settings → Database** → database password).
   Or paste `supabase/migrations/001_phase_c.sql` into the [SQL Editor](https://supabase.com/dashboard/project/_/sql/new).
3. Enable **Google** auth (and/or email) under Authentication → Providers
4. Add redirect URL: `https://www.vidyanix.ai` (and `http://localhost:5173` for dev)
5. Copy to `.env` (see `.env.example`):
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - Keep `SUPABASE_SECRET_KEY` and `SUPABASE_JWKS_URL` server-side only — they are **not** bundled into the app
6. Add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in Vercel → Settings → Environment Variables

On sign-in, local progress merges with cloud and syncs both ways.

## Progress export / import

1. Click **Export** in the top bar → downloads `ai-learning-path-progress-YYYY-MM-DD.json`
2. On another device, click **Import** and select the file (merges with existing progress)
3. **Reset** clears all checkmarks

## Deploy to Vercel (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. Vercel auto-detects Vite; `vercel.json` handles SPA routing
4. Deploy — you get a `*.vercel.app` URL with HTTPS

Build settings (auto-detected):

- **Build command:** `npm run build`
- **Output directory:** `dist`

## Deploy to Netlify

1. Import repo at [netlify.com](https://netlify.com)
2. `netlify.toml` configures build and SPA redirects
3. Deploy

## Custom domain

After deploying on Vercel or Netlify:

1. Add your domain in the host dashboard
2. Update DNS per host instructions (usually a CNAME)
3. HTTPS is provisioned automatically

## CI

GitHub Actions runs on every push/PR to `main`:

- `npm run validate:content`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:e2e`

A weekly workflow also runs `npm run check:links` and opens a GitHub issue if URLs are broken.

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

## Project docs

- [North Star Vision](docs/NORTHSTAR-VISION.md) — production roadmap and task checklist

## Optional production services

| Service | Env var | Purpose |
|---------|---------|---------|
| [Plausible](https://plausible.io) | `VITE_PLAUSIBLE_DOMAIN=vidyanix.ai` | Privacy-friendly page views |
| [Sentry](https://sentry.io) | `VITE_SENTRY_DSN` | Error tracking in production |

Build runs post-build **prerender** for SEO (`/`, `/search`, phases, etc.). Skip locally with `SKIP_PRERENDER=1 npm run build`.

Monthly **news sync** workflow opens a PR updating `content/ai-news-radar.json` from [awesome-ai-news](https://github.com/GetStream/awesome-ai-news).

## Tech stack

- React 19 + TypeScript
- Vite 8
- React Router 7
- Supabase (optional auth + progress sync)
- Fuse.js (search)
- Zod (content validation)
- Vitest + Playwright
- Sentry (optional)
- Oxlint
