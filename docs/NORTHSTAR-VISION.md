# AI Learning Path — North Star Vision

> Living reference for taking this app from local MVP to a production-ready, growing product.
> Last updated: June 2026

---

## Vision

**A curated, persona-aware AI engineering curriculum** that helps builders and engineering leaders go from LLM basics to production agents — with a monthly news radar that turns headlines into deliberate learning actions.

**North star outcome:** Anyone can land on a public URL, pick their track (Manager or Full), follow a sequenced path, stay current with AI news, and track progress across devices — without the curriculum going stale or links rotting.

---

## Current State (Phase C)

| Layer | Status | Notes |
|-------|--------|-------|
| **UI** | ✅ Done | React SPA — 7 phases, Manager/Full personas, AI News Radar, search |
| **Content** | ✅ JSON | ~65 resources in `content/*.json` with Zod validation at build |
| **Progress** | ✅ Local + cloud | localStorage; merges + syncs via Supabase when signed in |
| **Persona** | ✅ Local + cloud | localStorage; syncs to `user_profiles` when signed in |
| **Search** | ✅ Done | Fuse.js at `/search` with type/difficulty filters |
| **Backend** | ✅ Supabase | Auth (Google + magic link), Postgres progress/persona sync, RLS |
| **Auth (prod)** | ⚠️ Configure | Vercel env vars + Supabase providers/redirect URLs (manual) |
| **Routing** | ✅ Done | `/`, `/search`, `/news-radar`, `/privacy`, `/phase/:id` |
| **Hosting** | ✅ Done | Live at [vidyanix.ai](https://www.vidyanix.ai) via Vercel |
| **CI/CD** | ✅ Done | GitHub Actions lint + test + build + E2E |
| **Tests** | ✅ Done | Vitest unit tests + Playwright E2E |
| **Link health** | ✅ CI | Weekly link-check workflow |
| **SEO** | ✅ Prerender | OG + sitemap; post-build HTML for key routes (C10) |
| **Analytics** | ⚠️ Optional | Plausible via `VITE_PLAUSIBLE_DOMAIN` |
| **Error tracking** | ⚠️ Optional | Sentry via `VITE_SENTRY_DSN` (B11) |

### Tech stack today

- Vite 8 + React 19 + TypeScript
- Static build → `dist/`
- Supabase (auth + Postgres sync)
- Fuse.js (client search)
- Oxlint + Vitest + Playwright
- Zod content validation

### Key files

| File | Purpose |
|------|---------|
| `content/learning-path.json` | Phases, steps, resources |
| `content/personas.json` | Manager vs Full track priorities |
| `content/ai-news-radar.json` | News themes, learning bridges, highlights |
| `src/schemas/content.ts` | Zod schemas + validation helpers |
| `src/lib/supabase.ts` | Supabase client (env: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`) |
| `src/services/userDataSync.ts` | Cloud progress/persona read/write |
| `src/context/AuthProvider.tsx` | Session state, Google + magic link |
| `src/hooks/useProgress.ts` | localStorage + cloud progress |
| `src/hooks/usePersona.ts` | localStorage + cloud persona |
| `supabase/migrations/001_phase_c.sql` | Tables, RLS, sign-up trigger |

---

## Product Pillars

1. **Curated path** — Resources classified, ranked beginner → expert, sequenced in phases.
2. **Persona tracks** — Manager track skips deep implementation; Full track is comprehensive.
3. **News → learning** — awesome-ai-news headlines mapped to curriculum via learning bridges.
4. **Honest progress** — User marks completion; no fake auto-tracking.
5. **Content that stays fresh** — Links valid, news updated, curriculum versioned.

---

## Roadmap Phases

### Phase A — Ship It

**Goal:** Public, shareable, trustworthy v1.  
**Timeline:** 1–2 days  
**Users served:** Hundreds (static CDN is enough)

| # | Task | Details | Done |
|---|------|---------|------|
| A1 | Deploy to Vercel or Netlify | Connect GitHub repo; build command `npm run build`; output `dist/` | ☑ |
| A2 | Custom domain + HTTPS | Configure DNS; enable automatic TLS | ☑ |
| A3 | Add React Router | Routes: `/`, `/news-radar`, `/phase/:phaseId` | ☑ |
| A4 | SPA fallback config | Rewrite all routes to `index.html` (Vercel/Netlify config) | ☑ |
| A5 | Export progress | Download completed resource IDs as JSON file | ☑ |
| A6 | Import progress | Upload/merge JSON to restore progress on new device | ☑ |
| A7 | GitHub Actions — CI | On PR: lint + test + build + E2E | ☑ |
| A8 | GitHub Actions — deploy | On merge to main: deploy preview/production | ☑ (Vercel Git integration) |
| A9 | README — run & deploy | Document local dev, build, and deploy steps | ☑ |

**Exit criteria:** Live URL works; shared phase links work; progress export/import works; CI green on every PR.

---

### Phase B — Maintainable

**Goal:** Safe to update content and ship without regressions.  
**Timeline:** ~1 week  
**Users served:** Hundreds to low thousands

| # | Task | Details | Done |
|---|------|---------|------|
| B1 | Extract content to JSON | Move phases/resources out of TS into `content/` JSON files | ☑ |
| B2 | Zod schema validation | Validate JSON at build time; fail CI on bad content | ☑ |
| B3 | Resource ID uniqueness check | Script/assert no duplicate IDs across phases | ☑ |
| B4 | Link checker script | Node script: HEAD request all resource URLs | ☑ |
| B5 | Weekly link-check CI | Scheduled GitHub Action; open issue on failures | ☑ |
| B6 | Unit tests — progress | Test toggle, persist, reset, import/export merge | ☑ |
| B7 | Unit tests — personas | Test priority mapping, essential counts | ☑ |
| B8 | E2E tests — Playwright | Load app, check resource, refresh, progress persists | ☑ |
| B9 | Error boundary | Graceful UI fallback on React crashes | ☑ |
| B10 | Analytics — Plausible or Umami | Privacy-friendly page views; no cookie banner if chosen carefully | ☑ (optional env) |
| B11 | Error tracking — Sentry | Capture runtime errors in production | ☑ (optional `VITE_SENTRY_DSN`) |
| B12 | Open Graph meta tags | Per-route title/description for sharing | ☑ |
| B13 | `sitemap.xml` + `robots.txt` | Basic SEO for public routes | ☑ |

**Exit criteria:** Content edits via JSON PRs; broken links caught automatically; core flows covered by tests; errors visible in Sentry.

---

### Phase C — Product

**Goal:** Multi-device experience and content ops that scale.  
**Timeline:** 2–4 weeks  
**Users served:** 1k+ with returning users

| # | Task | Details | Done |
|---|------|---------|------|
| C1 | Choose backend — Supabase recommended | Auth + Postgres; minimal custom API | ☑ |
| C2 | User auth | Email magic link or OAuth (Google/GitHub) | ☑ |
| C3 | Cloud progress sync | Table: `user_id`, `resource_id`, `completed_at` | ☑ |
| C4 | Migrate localStorage on login | Merge local progress into cloud on first sign-in | ☑ |
| C5 | Persona preference in cloud | Store `swe-manager` vs `full` per user | ☑ |
| C6 | Content workflow | JSON in repo **or** headless CMS (Sanity/Contentful) | ☑ (JSON in repo) |
| C7 | awesome-ai-news auto-sync | GitHub Action: parse README monthly → update highlights JSON → PR | ☑ (auto PR via merge script) |
| C8 | Search across resources | Client-side index (Fuse.js) or server search | ☑ |
| C9 | Filter by type/difficulty/tags | UI filters on phase and global resource list | ☑ |
| C10 | Prerender / SSG key routes | Static HTML for `/`, phases, news-radar for SEO | ☑ (post-build Playwright prerender) |
| C11 | Privacy policy page | Required once auth + analytics exist | ☑ |
| C12 | Accessibility audit | Lighthouse 90+ a11y; keyboard nav, focus states | ☑ (Lighthouse 93+ on homepage) |

**Exit criteria:** Sign in on phone and laptop — same progress; news highlights update via automation; search works; SEO landing pages indexable.

**Operational (manual):** Vercel `SUPABASE_*` env vars; Supabase auth providers + redirect URLs; optional `VITE_PLAUSIBLE_DOMAIN`, `VITE_SENTRY_DSN`. News sync opens a monthly PR for review.

---

### Phase D — Community

**Goal:** Platform others contribute to and return to weekly.  
**Timeline:** Later (post product-market fit)  
**Users served:** Community scale

| # | Task | Details | Done |
|---|------|---------|------|
| D1 | Public completion stats | Anonymous aggregate: "X% completed Agent Foundations" | ☐ |
| D2 | User-submitted resources | Form → moderation queue → admin approve | ☐ |
| D3 | Additional personas | e.g. "Data Scientist", "Product Manager", "IC Engineer" | ☐ |
| D4 | Admin dashboard | Manage resources, review submissions, view link health | ☐ |
| D5 | Email digest | Weekly: 3 essential resources + top news headline + learning action | ☐ |
| D6 | Embed / API | JSON API or oEmbed for curriculum elsewhere | ☐ |
| D7 | Versioned curriculum | "2026 Q2 path" snapshots; users pinned to a version | ☐ |
| D8 | Community notes | Per-resource user notes (private or shared) | ☐ |
| D9 | Team / org mode | Manager assigns resources to direct reports | ☐ |
| D10 | i18n | Localize UI and content labels | ☐ |

**Exit criteria:** Contributors can propose resources; users receive weekly value without visiting the site; teams can adopt the path internally.

---

## Growth: What Breaks and When

| Signal | What breaks | Mitigation (phase) |
|--------|-------------|-------------------|
| 65 → 500 resources | Large bundle, slow render | Lazy-load phase data (B1), search index (C8) |
| Monthly news updates | Manual `aiNewsRadar.ts` edits | Auto-sync from awesome-ai-news (C7) |
| Multiple personas | `personas.ts` unmaintainable | JSON config + schema (B1–B2), admin UI (D4) |
| Phone + laptop users | localStorage frustration | Auth + cloud sync (C2–C4) |
| Multiple contributors | TS merge conflicts | JSON content + PR workflow (B1) |
| SEO / sharing | Empty shell for crawlers | SSG + OG tags (B12–B13, C10) |
| Dead external links | Trust erosion | Link checker CI (B4–B5) |
| No usage data | Can't prioritize features | Analytics (B10) |

---

## Target Architecture

```
┌─────────────────────────────────────────────┐
│  Vite + React SPA                           │
│  • React Router (Phase A)                   │
│  • JSON content + Zod (Phase B)             │
│  • Search / filters (Phase C)               │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴──────────┐
         ▼                    ▼
   Vercel / Netlify      Supabase (Phase C — live)
   • CDN static          • Auth (Google, magic link)
   • Preview deploys     • Progress + persona sync
   • CI from GitHub      • RLS on user tables
```

**Principle:** Stay static-first. Backend used only for auth and progress sync; content remains JSON in repo.

---

## Curriculum Content Reference

### Phases (learning path)

| # | ID | Title | Level |
|---|-----|-------|-------|
| 1 | `foundations` | AI & ML Foundations | Beginner |
| 2 | `llm-fundamentals` | LLM Fundamentals | Beginner → Intermediate |
| 3 | `applied-llm` | Applied LLM Engineering | Intermediate |
| 4 | `agent-foundations` | Agent Foundations | Intermediate → Advanced |
| 5 | `production-agents` | Building Production Agents | Advanced |
| 6 | `expert-mastery` | Expert Mastery | Expert |
| 7 | `ai-news-radar` | AI News Radar | Ongoing |

### Manager track order

1. LLM Fundamentals  
2. AI News Radar *(start monthly ritual in week 1)*  
3. Agent Foundations  
4. Building Production Agents  
5. Applied LLM Engineering  
6. AI & ML Foundations *(lite)*  
7. Expert Mastery  

### Manager essentials (~20 resources)

- **Foundations:** DMLS, Gradient Ascent newsletter  
- **LLM:** LLM intro video, Prompt Engineering Guide  
- **Applied:** Improving LLM Accuracy, DecodingML  
- **Agents:** Stanford overview, Google/Anthropic/OpenAI guides, Effective Agents video  
- **Production:** Build & Eval video, Evaluating AI Agents, 3 agent books, AI Engineering  
- **News:** awesome-ai-news, Karpathy Software Is Changing  
- **Expert:** LLMOps  

### News radar — 8 learning bridges

| Theme | Curriculum phase |
|-------|------------------|
| Agent Frameworks & SDKs | Agent Foundations |
| Coding & Dev Agents | Production Agents |
| MCP & Agent Protocols | Production Agents |
| Voice & Realtime AI | AI News Radar |
| Model Releases & Selection | LLM Fundamentals |
| RAG & Knowledge Retrieval | Applied LLM |
| Multi-Agent & Orchestration | Expert Mastery |
| Enterprise & LLMOps | Expert Mastery |

**News hub:** [GetStream/awesome-ai-news](https://github.com/GetStream/awesome-ai-news)

### Monthly news ritual (~30 min)

1. Open awesome-ai-news → read current month  
2. Tag each headline to a theme (bridges above)  
3. Pick **1 headline → 1 curriculum resource** for the week  
4. Share one insight in staff meeting  

---

## Progress Tracking (current behavior)

| Aspect | Implementation |
|--------|----------------|
| **Granularity** | Per resource ID (checkbox on card) |
| **Storage (local)** | `localStorage` → `ai-learning-path-progress` (JSON array of IDs) |
| **Storage (cloud)** | Supabase `user_progress` when signed in |
| **Persona (local)** | `localStorage` → `ai-learning-path-persona` |
| **Persona (cloud)** | Supabase `user_profiles.persona_id` when signed in |
| **On sign-in** | Local + cloud merged (union of completed IDs) |
| **Bar (Manager)** | Essential resources only |
| **Bar (Full)** | All non-skipped resources |
| **Reset** | Clears local + cloud progress when signed in |
| **Export/import** | JSON file merge (works offline) |

---

## Legal & Trust (before wide public launch)

| Item | When needed |
|------|-------------|
| Privacy policy | ✅ Done — `/privacy` (Phase C) |
| Cookie notice | If using analytics that require consent (EU) |
| Affiliate disclaimer | "Curated links; not affiliated with publishers" |
| External link policy | Opens in new tab; no embedding paid content |

---

## Quick Reference — Commands

```bash
# Local dev
npm run dev          # http://localhost:5173

# Production build
npm run build        # output → dist/
npm run preview      # serve dist locally

# Quality
npm run lint
npm run validate:content
npm run test
npm run test:e2e
npm run check:links
npm run migrate:supabase   # requires SUPABASE_DB_PASSWORD in .env
```

---

## Decision Log (fill in as you go)

| Date | Decision | Rationale |
|------|----------|-----------|
| Jun 2026 | Hosting: Vercel | Git integration, SPA rewrites, custom domain |
| Jun 2026 | Backend: Supabase | Auth + Postgres sync; minimal custom API |
| Jun 2026 | CMS: JSON in repo | Phase B workflow; PR-based content edits |
| Jun 2026 | Analytics: Plausible (optional) | Privacy-friendly; env-gated |

---

## Related docs

- App README: `../README.md`
- Content data: `../content/*.json` (loaded via `../src/data/`)

---

*Update this file when phases complete or scope changes.*
