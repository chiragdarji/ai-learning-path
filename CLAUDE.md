# AI Learning Path — project guide for Claude

A curated AI-engineering curriculum web app (vidyanix.ai). Guest-first, no learner LLM. The long-range plan lives in `docs/NORTHSTAR-VISION.md`; specs and plans live under `docs/superpowers/`.

## Stack

- Vite 8 + React 19 + TypeScript, static build to `dist/`
- Supabase (auth, Postgres, RLS) — client in `src/lib/supabase.ts`; degrades gracefully when unconfigured (`isSupabaseConfigured`)
- Design system: hand-rolled tokens + Radix-backed primitives (no Tailwind, no shadcn) — see the `design-system` skill
- Oxlint · Vitest + Testing Library · Playwright (e2e) · Zod (content validation)

## Commands

```bash
npm run dev              # vite dev (auto-picks 5174 if 5173 is busy)
npm test                 # vitest run (unit)
npm run lint             # oxlint
npx tsc -b               # typecheck
npx vite build           # app build (no prerender — use this locally)
npm run build            # full build incl. prerender (needs Chromium: npm run test:e2e:install)
npm run validate:content # Zod-validate content/*.json
npm run test:e2e         # Playwright (needs chromium installed)
npm run migrate:supabase # apply SQL migrations
```

## Conventions

- **TDD.** Test first (fail) → minimal code → pass → commit. One behavior per test. Vitest has `globals: true`; use `renderWithProviders` from `src/test/renderWithProviders.tsx` for components needing router/auth/locale.
- **Design system first.** Build UI from `src/components/ui` primitives (Button, Badge, Card, Input, Modal, Tabs, Dropdown, Skeleton) and `src/styles/tokens.css` variables. Never hardcode hex/px for tokenized values. Page chrome uses the shared `PageHeader`. See `docs/DESIGN-SYSTEM.md`.
- **Content is data.** Curriculum lives in `content/*.json`, validated by `src/schemas/content.ts`. Editing content → run `validate:content`. See the `curriculum-content` skill.
- **Guest-first.** Never wall the curriculum. Sign-in is contextual via `openSignIn()` on the auth context; the shared `AuthModal` is app-level.
- **Commits:** small, imperative, per logical step. Branch off `main`; open a PR; let CI go green before merging.

## CI / gotchas

- Full `npm run build` runs `scripts/prerender-routes.ts` which launches Playwright Chromium. Locally that's often absent — use `npx tsc -b && npx vite build` to verify, or `npm run test:e2e:install` once.
- Prerender serves on port **4178** (kept distinct from Playwright's e2e webServer on 4173 — do not collide them).
- The e2e CI job installs Chromium **before** `npm run build` (prerender needs it). Keep that order in `.github/workflows/ci.yml`.

## Key files

- `src/App.tsx` — routes + `AppShell` (TopNav, LearnSidebar on Learn routes, SiteFooter, MobileTabBar)
- `src/components/ui/` — design-system primitives (+ `index.ts` barrel)
- `src/styles/tokens.css` — all design tokens
- `content/*.json` + `src/schemas/content.ts` — curriculum + validation
- `docs/NORTHSTAR-VISION.md` — roadmap/status · `docs/superpowers/` — specs + plans
