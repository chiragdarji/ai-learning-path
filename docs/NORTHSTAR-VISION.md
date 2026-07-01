# AI Learning Path — North Star Vision

> Living reference for taking this app from curated curriculum to a collaborative learning platform.
> Last updated: June 2026 (enhanced after competitive audit + critical review)

---

## Vision

**A collaborative learning platform** for AI engineering — where anyone can follow curated persona tracks *or* build their own path (like [roadmap.sh](https://roadmap.sh)), track progress with others, and grow through community submissions, notes, and shared roadmaps.

**North star outcome:** Learners land on a **professional**, public, SEO-friendly site, explore the curriculum **without friction**, pick or **build** a personal learning path, track honest progress across devices, and collaborate via profiles, community, and teams — while admins curate content without editing raw JSON. **In-app AI tutoring with user-supplied API keys is out of scope** (see [Compliance — BYOLLM rejected](#compliance--security-byollm-rejected)).

**Product positioning:** The **practitioner-validated, community-curated AI engineering path** — updated weekly with what's shipping in production, not what was trending in 2023. Free to browse; no paywall on the curriculum. Differentiated from roadmap.sh (AI-generated, broad) and Pluralsight (enterprise-gated, slow) by: human curation quality + persona sequencing + news-to-curriculum bridges + community quality signals.

---

## Current State (Phase D complete → Phase E next)

| Layer | Status | Notes |
|-------|--------|-------|
| **UI** | ⚠️ Phase D | Functional but not yet **professional-grade** IA; sidebar-heavy |
| **Learner UX** | ⚠️ Partial | Core flows work; needs design system, onboarding, contextual auth |
| **Auth strategy** | ✅ Guest-first | Browse + local progress without sign-in; sign-in **later**, contextual (see below) |
| **Profile** | ⚠️ Partial | Auth + sync only — no dedicated `/profile` hub |
| **Community** | ⚠️ Partial | Features split across `/submit`, `/digest`, `/team`, stats badges — no `/community` hub |
| **Custom paths** | ❌ Not started | Fixed curriculum + personas only; no user-built roadmaps |
| **In-app AI tutor** | 🚫 Rejected | BYOLLM removed — learner keys/chat (see below) |
| **Admin LLM** | ☐ Phase E11 | Operator toolkit — LLM on every admin surface; keys in `/admin/settings` |
| **Newsletter** | ⚠️ Partial | Rule-based digest script + `/digest`; no LLM draft or email send yet |
| **Content** | ✅ JSON | ~65 resources in `content/*.json` with Zod validation at build |
| **Progress** | ✅ Local + cloud | localStorage; merges + syncs via Supabase when signed in |
| **Persona** | ✅ Local + cloud | 5 tracks; syncs to `user_profiles` |
| **Search** | ✅ Done | Fuse.js at `/search` with type/difficulty filters |
| **Backend** | ✅ Supabase | Auth, Postgres sync, community tables, RLS |
| **Auth (prod)** | ✅ Done | Vercel env + Google OAuth on [vidyanix.ai](https://www.vidyanix.ai) |
| **Admin** | ⚠️ Partial | `/admin` review queue; no CMS, LLM settings, digest editor, or updates tool yet |
| **Routing** | ✅ Done | `/`, `/search`, `/news-radar`, `/phase/:id`, community routes |
| **Hosting** | ✅ Done | Vercel + custom domain |
| **CI/CD** | ✅ Done | Lint, test, build, E2E, link-check, news sync, weekly digest artifact |
| **SEO** | ✅ E7 | OG, sitemap, prerender + **JSON-LD** (`Course`/`ItemList`) in static HTML (E7b) |
| **AI discoverability** | ✅ E7a | `llms.txt` generated from curriculum; JSON-LD structured data; public JSON API |
| **Analytics** | ⚠️ Optional | Plausible via `VITE_PLAUSIBLE_DOMAIN` |
| **Error tracking** | ⚠️ Optional | Sentry via `VITE_SENTRY_DSN` |
| **Community stats** | ✅ D1 | Anonymous phase completion % (5+ learners) |
| **Public API** | ✅ D6 | `/api/v1/curriculum.json` |
| **i18n** | ⚠️ Partial | EN/ES UI shell; curriculum content English-only |
| **Growth loops** | ❌ Not started | No GitHub badge, share cards, public resource pages, or referral mechanism |
| **Proof of learning** | ❌ Not started | No verifiable link, shareable milestone card, or completion badge |
| **Community learning presence** | ❌ Not started | No cohort count, study matching, or completion feed (E16) |
| **Design system** | ⚠️ Foundation exists | 19 CSS custom-property tokens in `index.css` (coherent dark palette); decision made — formalize + Radix primitives (see E4 pre-work) |
| **Rate limiting** | ⚠️ Partial | Submit is auth-gated (low risk); only the anon `get_public_completion_stats` RPC is unbounded (read-only aggregates) — add cost guard before E3 |
| **Security headers** | ⚠️ Partial | `vercel.json` sets CORS on `/api/` only; app HTML has no CSP / X-Frame-Options — add before E3 surfaces user content |
| **RLS** | ✅ Done | 46 policies across migrations; submit/notes/teams all session-gated; security posture is sound, not leaky |
| **Team mode (D9)** | 🚫 Descoped | No member-add path in code; E18 deferred to post-scale tier (aligns with monetisation deferral) — flat E16 community covers "learn with others" |

### Tech stack today

- Vite 8 + React 19 + TypeScript
- Static build → `dist/` (+ `public/api/v1/curriculum.json`)
- Supabase (auth, Postgres, community features)
- Fuse.js (client search)
- Oxlint + Vitest + Playwright
- Zod content validation

### Key files

| File | Purpose |
|------|---------|
| `content/learning-path.json` | Official phases, steps, resources |
| `content/personas.json` + `personas-phase-d.json` | Persona tracks and priorities |
| `content/meta.json` | Curriculum version (`2026-q2`) |
| `content/ai-news-radar.json` | News themes, learning bridges, highlights |
| `src/schemas/content.ts` | Zod schemas + validation helpers |
| `src/services/communityFeatures.ts` | Submissions, notes, teams, digest |
| `src/services/userProfile.ts` | Profile fields, admin check |
| `supabase/migrations/` | Progress, stats, community tables; **E11:** `admin_llm_config`, `admin_llm_audit`, `site_announcements`, `digest_drafts` |

---

## Product Pillars (evolving)

1. **Curated path** — Official AI engineering curriculum, sequenced and link-checked.
2. **Professional learner experience** — Polished IA, clear progress, credible for teams and managers *(Phase E — learner-first)*.
3. **Personal path** — Users fork, reorder, and extend the official path *(Phase E — roadmap.sh-style)*.
4. **Persona tracks** — Manager, PM, IC, Data Scientist, Full — as smart starting points, not hard limits.
5. **News → learning** — awesome-ai-news mapped to curriculum via learning bridges.
6. **Honest progress** — User-marked completion; cloud sync when signed in; local-first for guests.
7. **Community learning presence** — Peer cohort stats, study partner matching, phase completion feed — flat, opt-in, no hierarchy *(Phase E16)*.
8. **Community submissions** — Submissions, shared notes, stats, digest — unified on a community surface.
9. **Admin without JSON** — Content CRUD, publish workflow, link health in admin UI.
10. **Discoverable everywhere** — SEO for Google; `llms.txt` + structured data for AI crawlers *(site discoverability — not in-app LLM)*.
11. **Growth by design** — GitHub badge, phase completion share cards, public resource pages — organic acquisition built into the product *(Phase F)*.
12. **Trust by design** — No **learner** LLM credentials; admin LLM keys server-side only with human publish gate.
13. **Progressive sign-in** — Never wall the curriculum; sign in when sync, paths, or community add value.
14. **Proof of learning** — Verifiable completion links, shareable phase badges — credible signal without a cert authority.
15. **Admin-assisted everything** — LLM drafts on CMS, newsletter, updates/about, triage, SEO, i18n; humans publish or send.

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
| D1 | Public completion stats | Anonymous aggregate: "X% completed Agent Foundations" | ☑ |
| D2 | User-submitted resources | Form → moderation queue → admin approve | ☑ |
| D3 | Additional personas | e.g. "Data Scientist", "Product Manager", "IC Engineer" | ☑ |
| D4 | Admin dashboard | Manage resources, review submissions, view link health | ☑ |
| D5 | Email digest | Weekly: 3 essential resources + top news headline + learning action | ☑ |
| D6 | Embed / API | JSON API or oEmbed for curriculum elsewhere | ☑ |
| D7 | Versioned curriculum | "2026 Q2 path" snapshots; users pinned to a version | ☑ |
| D8 | Community notes | Per-resource user notes (private or shared) | ☑ |
| D9 | Team / org mode | Manager assigns resources to direct reports | ⚠️ Partial — see note |
| D10 | i18n | Localize UI and content labels | ☑ |

**Exit criteria:** Contributors can propose resources; users receive weekly value without visiting the site; teams can adopt the path internally.

**Known gaps (address in Phase E):** Approved submissions do not auto-publish to curriculum; digest does not send email yet; admin cannot edit official content in-app.

**⚠️ D9 is structurally incomplete (code-verified Jun 2026):** `communityFeatures.ts` has **no member-add path** — `createTeam` adds only the owner to `team_members`, and `assignResource` requires the assignee's `user_id` (UUID). There is no `inviteMember`/`addMember` function and no email lookup, so a team owner cannot add a second person through any code path. D9 is **not** a "shipped" capability — it is data-model + owner-only scaffolding. Closing it is a **feature build** (invite-by-email → accept flow → `team_members` RLS), not a hotfix. **Decision (Jun 2026): descoped.** E18 deferred to the post-scale / optional tier alongside monetisation — team mode is the only hierarchy feature in a product that just pivoted community to flat/peer (E16), and team seats are a paid-tier concern (deferred to 1000K users). The owner-only scaffolding stays in the codebase but is **not surfaced** in the learner UI until E18 is revived. Tracked as E18 (Optional tier) below.

---

### Phase E — Platform (learning + collaboration)

**Goal:** Evolve from a curated curriculum site into a **learning and collaborative platform** — personal roadmaps, dedicated profile/community surfaces, admin CMS, and SEO/AI-crawler discoverability.

**Timeline:** 6–12 weeks (incremental releases)  
**Users served:** Individual learners, teams, and community contributors  
**Reference competitor:** [roadmap.sh](https://roadmap.sh) — custom roadmaps, team progress, library of personal plans *(their in-app AI tutor is not copied; see BYOLLM rejection)*

#### Learner experience — professional tool (validated ✅)

**Requirement:** The product must feel like a **credible professional tool** — suitable for individual study, manager-led teams, and sharing in workplace contexts.

| Aspect | Validation |
|--------|------------|
| **Today** | Solid curriculum and features; UI is utilitarian; auth is a small header button; community routes scattered |
| **Gap** | No unified “My learning” hub, no onboarding, inconsistent page chrome, mobile nav weak |
| **Approach** | **Learner-first build order** — polish shell (E4, E0) before admin LLM; design system; `/profile`; rule-based next-step hints |
| **Not in scope** | Gamification for its own sake; badges-for-badges; leaderboards; in-app AI tutor (BYOLLM rejected). Streaks and badges ARE in scope only as opt-in peer signals on public profile (E16f) — not as engagement mechanics pushed at the learner |
| **Success signal** | A manager can demo the site in a staff meeting without apologizing for UX; learners return weekly |

**Professional UX standards (Phase E):**

- Clear primary nav: **Learn** · **My learning** · **Community**
- Consistent page headers, typography, and spacing across all routes
- Progress visible at a glance (persona track + completion %)
- Contextual help (“what’s next”) without LLM
- Mobile-friendly navigation (bottom tabs or collapsible nav)
- Export/import and privacy copy visible from profile — builds trust with enterprise users

#### Auth & sign-in strategy (validated ✅)

**Decision:** **Guest-first, sign-in later (progressive auth)** — **not** auth-first on landing.

| Question | Answer | Rationale |
|----------|--------|-----------|
| Sign in **first** or **later**? | **Later** — after value is demonstrated | Curriculum is the hook; forced login kills SEO, sharing, and first impressions |
| When is sign-in required? | Only for **identity-bound** features | See matrix below |
| Current implementation | ✅ Aligns | `AuthButton`: “Sign in to sync”; community pages gate on action |

**Feature × auth matrix:**

| Feature | Guest (no sign-in) | Signed in | System impact |
|---------|-------------------|-----------|---------------|
| Browse curriculum, phases, search | ✅ | ✅ | SEO-critical — must stay open |
| Mark progress (localStorage) | ✅ | ✅ + cloud sync | C4 merge on first sign-in |
| Persona selection | ✅ local | ✅ cloud | E9 onboarding can set before sign-in |
| Export / import progress JSON | ✅ | ✅ | Trust feature; no auth needed |
| Resource notes (private/shared) | ❌ hidden | ✅ | RLS on `user_id` |
| Submit resource | ❌ prompt | ✅ | Moderation ties to identity |
| Team assignments | ❌ prompt | ✅ | Manager/report relationships |
| Digest subscribe | ⚠️ email only | ✅ linked to profile | E2 profile consolidates |
| Custom user paths (E8) | ❌ prompt | ✅ | `user_paths` requires `user_id` |
| Admin | ❌ | ✅ admin role | Unchanged |

**Sign-in UX principles (E0):**

1. **Never** redirect to login on `/` or phase pages
2. **Contextual prompts** — “Sign in to save this path” / “Sign in to sync across devices” at point of need
3. **Merge on sign-in** — Confirm local progress merged to cloud (already implemented in C4; surface in UI)
4. **Professional auth modal** — Google + magic link; align with E4 design system; clear value prop
5. **Profile as home for account** — Sign-in CTA in header; account settings live on `/profile`, not modals alone

**Why not auth-first:**

- Hurts **SEO** (E7) — crawlers and shared links must render curriculum
- Hurts **professional evaluation** — managers skim before committing identity
- **localStorage-first** already works; forcing auth adds friction without benefit for read-only use
- Community features **naturally** gate at submit/join — no global wall needed

**Dependency note:** E2 `/profile`, E8 user paths, and E3 community CTAs all **assume auth exists** (Phase C ✅) but **improve** how and when sign-in is offered — E0 ships with E4 in Release 1.

#### Compliance & security — BYOLLM rejected

**Decision:** **Bring your own LLM (user API keys)** is **removed from scope** for Phase E and beyond unless legal/compliance review explicitly reopens it.

| Risk area | Concern with BYOLLM | Impact |
|-----------|---------------------|--------|
| **Credential storage** | User API keys are secrets; storing them (even encrypted) in Supabase expands breach blast radius and key-rotation obligations | High |
| **Browser storage** | Session-only keys in `localStorage`/memory leak via XSS; keys in client bundles or memory are extractable | High |
| **Edge proxy** | Platform proxies prompts with user keys → we process prompt content, become subprocessors to OpenAI/Anthropic, log retention ambiguity | High |
| **GDPR / privacy** | Prompts may contain employer data, PII, or confidential project details; need DPAs, lawful basis, retention limits, export/delete for chat logs | High |
| **SOC 2 / trust** | User-supplied keys + prompt logging increases audit scope (access controls, encryption, incident response) | Medium |
| **Terms of use** | Many provider ToS restrict key sharing or require specific security controls when keys are used via third-party apps | Medium |
| **Abuse & cost** | Stolen keys, prompt injection, and unbounded usage create liability even with “user pays” models | Medium |
| **Children / workplace** | Learning platform may be used in corporate or educational contexts with stricter data rules | Medium |

**Alternatives (in scope instead):**

| Alternative | Description | Compliance posture |
|-------------|-------------|-------------------|
| **External AI links** | “Open in ChatGPT/Claude” with pre-filled *public* curriculum context (no keys, user leaves site) | Low risk — no credential handling |
| **Rule-based suggestions** | Next-resource recommendations from persona, progress, and graph (no LLM) | Low risk |
| **Community + curated content** | Human submissions, shared notes, official curriculum | Aligns with current model |
| **AI discoverability (E7)** | `llms.txt`, JSON-LD, public API — help *external* AI tools reference the site | Low risk — static public data |
| **Platform-managed AI (future, optional)** | Single vendor key, server-side only, explicit opt-in, DPA, retention policy, no user keys | Medium — only if legal review approves |
| **Admin LLM (validated ✅)** | Platform or admin-configured keys; **admin-only** settings + server-side generation across all admin workflows | Low–medium — see [Admin LLM toolkit](#admin-llm-toolkit-validated--operator-wide-content-generation) below |

#### Admin LLM toolkit (validated — operator-wide content generation)

**Decision:** **Admin-only LLM** with keys in **`/admin/settings`** is **in scope** for Phase E. Admins may use LLM **across every admin surface** (CMS, digest, updates, moderation, SEO copy) via a shared **`admin-llm` Edge Function** — not BYOLLM, not learner-facing.

**Principle:** *One admin AI backend, many templates — every admin screen gets a “Generate draft” action where it saves time; optional `/admin/ai` workbench for ad-hoc operator drafts.*

**Why this is acceptable (vs BYOLLM rejected):**

| Factor | BYOLLM (rejected) | Admin LLM (approved) |
|--------|-------------------|----------------------|
| **Who holds keys** | Every learner | Small admin set (`is_admin` / `VITE_ADMIN_EMAILS`) |
| **Key exposure** | Browser, per-user storage, wide blast radius | Server-side only (Edge Function / secrets); never in client bundle |
| **Prompt content** | Free text, employer secrets, PII | Public curriculum JSON, submission metadata, URLs — **no learner emails/notes by default** |
| **Output use** | Direct to learner | Draft in CMS → human review → publish |
| **Audit** | Hard at scale | Admin action log (who generated, when, which draft) |
| **Cost / abuse** | Unbounded per user | Rate limits + caps per org; admin-only routes |

**Required security controls (non-negotiable):**

1. **Keys never in the SPA** — Admin UI sends “save/test/generate” to a **Supabase Edge Function** (or server route); keys stored encrypted (`pgsodium` / Supabase Vault) or as **deployment secrets** with DB holding provider + model only.
2. **Admin-only RLS + `is_admin_user()`** — Same gate as `/admin`; reject all non-admin calls.
3. **Human-in-the-loop** — LLM output lands in **draft** fields only; publish still runs Zod validation + admin confirm.
4. **Prompt template catalog** — Structured templates per admin action; v2 adds **Admin AI Workbench** (`/admin/ai`) for ad-hoc drafts with audit log (still admin-only, still publish gate).
5. **No learner PII in prompts** — Exclude `user_profiles`, emails, private notes, team assignments from default templates; opt-in checkbox if ever needed later.
6. **Audit log** — `admin_llm_audit`: `admin_id`, `action`, `template`, `created_at` (not full prompt/response if policy prefers minimization).
7. **Rate limits** — e.g. 50 generations/admin/day; configurable in settings.
8. **Fallback** — `ADMIN_LLM_API_KEY` in Vercel env works without DB storage; settings UI can show “using platform secret” when env is set.

**Admin settings page (`/admin/settings`):**

| Setting | Purpose |
|---------|---------|
| Provider | OpenAI / Anthropic / OpenRouter |
| Model | e.g. `gpt-4o-mini`, `claude-sonnet-4` |
| API key | Masked input; write-once via Edge Function; test connection button |
| Default tone | Short / technical / manager-friendly (system prompt preset) |
| Enabled templates | Toggle which actions show “Generate draft” (CMS, digest, updates, etc.) |
| Newsletter defaults | Subject line prefix, sign-off, CTA link (`vidyanix.ai/digest`) |
| Daily limit | Cost guardrail |

**Admin LLM surface map (validated — “LLM everywhere” in admin):**

| Admin area | Route | LLM actions |
|------------|-------|-------------|
| **Settings** | `/admin/settings` | Configure provider, model, key, limits, enabled templates |
| **CMS — resources** | `/admin/cms/resources` | Draft description, tags, difficulty hint |
| **CMS — phases/steps** | `/admin/cms/phases` | Step objective, phase summary |
| **Submissions** | `/admin` | Triage summary, suggested phase, approve/reject rationale |
| **News & bridges** | `/admin/news` | Map headline → bridge + resource IDs |
| **Newsletter / digest** | `/admin/digest` | **Weekly newsletter draft** (see below) |
| **Updates & about** | `/admin/updates` | **What’s new**, changelog, about copy, homepage banner |
| **Personas** | `/admin/personas` | Manager note draft, goal wording |
| **i18n** | `/admin/i18n` | ES draft for UI strings |
| **SEO** | `/admin/seo` | Meta description, `llms.txt` blurb, JSON-LD helper text |
| **Moderation** | `/admin/moderation` | Summarize shared note flags (public text only) |
| **Link health** | `/admin/links` | Suggest replacement URL copy when link dead |
| **AI workbench** | `/admin/ai` | Ad-hoc operator prompt → draft (audit logged; v2) |

**Generation use cases (validated):**

| Action | Where in admin | Input (allowed) | Output |
|--------|----------------|-----------------|--------|
| **Draft resource description** | CMS resource form | Title, URL, type, phase | Description + tags draft |
| **Submission triage** | Submissions queue | Title, URL, submitter description | Summary + suggested phase |
| **News bridge suggestion** | News admin | Public headline | Bridge + resource IDs |
| **Persona manager note** | Persona editor | Resource + persona | Draft `resourceNotes` |
| **i18n UI hint** | i18n admin | English UI string | Spanish draft |
| **Weekly newsletter** | `/admin/digest` | 3 essential resources, top news headline, optional public stat snippet, subscriber **count only** | Subject + HTML/Markdown email draft |
| **Digest page copy** | `/admin/digest` | Same inputs | In-app `/digest` preview text |
| **What’s new / changelog** | `/admin/updates` | Bullet list of shipped features or git summary | Changelog markdown + short banner |
| **About page section** | `/admin/updates` | Site mission bullets | About/hero copy draft |
| **SEO meta** | `/admin/seo` | Phase or resource title | Meta description ≤160 chars |
| **Moderation summary** | Moderation queue | Public shared note text | Neutral summary for admin |

#### Newsletter generation (validated ✅)

**Requirement:** Admin uses LLM to draft the **weekly learning newsletter** (extends D5 digest).

| Aspect | Validation |
|--------|------------|
| **Today** | Rule-based `generate-weekly-digest.ts` + `/digest` preview; no LLM; no email send |
| **Gap** | Richer prose, subject lines, manager-friendly tone |
| **Approach** | `/admin/digest` → “Generate newsletter” → draft in editor → admin edits → **Send** (Resend) or export Markdown |
| **Prompt input** | Public curriculum only: resource titles/URLs, news highlight, learning action, optional anonymous phase stat |
| **Never in prompt** | Subscriber emails, names, individual progress, private notes |
| **Compliance** | Low–medium — same as Admin LLM; CAN-SPAM/unsubscribe handled at send layer (E12) |
| **Human gate** | Required before send; no auto-send on LLM output alone |

**Newsletter draft structure (template output):**

1. Subject line (A/B optional)  
2. Opening — 1 paragraph (why this week matters for AI leaders)  
3. **3 essential resources** — title, one-line why, link  
4. **News → action** — headline + mapped curriculum step  
5. CTA — “Continue your path” → vidyanix.ai  
6. Footer — unsubscribe placeholder (filled at send time)

#### Updates & about tool (validated ✅)

**Requirement:** Admin uses LLM to maintain **site announcements** and **about/mission copy** without editing markdown by hand.

| Aspect | Validation |
|--------|------------|
| **Today** | Static copy in React components + `NORTHSTAR-VISION`; no admin UI |
| **Gap** | No “What’s new” banner, changelog, or editable about block |
| **Approach** | `/admin/updates` stores drafts in `site_announcements` (Supabase); publish updates banner + optional `/updates` page |
| **LLM actions** | Generate changelog from admin bullet input; shorten/lengthen; manager vs IC tone |
| **Prompt input** | Public feature names, phase titles — no user data |
| **Compliance** | Low — public marketing copy; human publish |
| **Surfaces** | Homepage banner, `/updates` changelog, optional About section on overview |

**Architecture:**

```text
Admin browser → any /admin/* screen (“Generate draft”)
              → /admin/settings (keys — never returned to client)
              → Edge Function `admin-llm` { template, context }
                    → decrypt key (Vault) OR env ADMIN_LLM_API_KEY
                    → provider API
                    → return draft JSON / markdown only
              → draft editor → human edit → validate → publish / send
```

**Still out of scope (even for Admin LLM):** Learner-facing chat; auto-publish without admin click; prompts containing learner emails/notes/progress; storing full chat history; sending newsletter without explicit admin “Send”.

#### Requirement validation

| Theme | Requirement | Validation | Today | Gap | Recommended approach |
|-------|-------------|------------|-------|-----|----------------------|
| ~~**E1**~~ | ~~**Bring your own LLM**~~ | 🚫 **Rejected** | — | — | See [Compliance — BYOLLM rejected](#compliance--security-byollm-rejected); use alternatives above |
| **E0** | **Auth UX — progressive sign-in** | ✅ Valid | Guest-first + header button | Contextual prompts, merge UI, professional modal | [Guest-first strategy](#auth--sign-in-strategy-validated-); E0 with E4 in Release 1 |
| **E4** | **Information architecture & UI** | ✅ Valid | Sidebar-heavy; 12+ nav items | Professional learner shell | **Learn** · **My learning** · **Community**; mobile nav; design system — **blocks all learner surfaces** |
| **E2** | **Dedicated profile page** | ✅ Valid | Auth button, scattered settings | Single `/profile` hub | Progress, persona, paths, notes, teams, digest, export — **depends E4, E0** |
| **E3** | **Dedicated community page** | ✅ Valid | `/submit`, `/digest`, `/team`, D1 stats | Unified `/community` | Feed + CTAs; sign-in prompts at actions — **depends E4** |
| **E7** | **SEO + AI-friendly site** | ✅ Valid | OG, sitemap, CI prerender, public API | Production prerender; crawler docs | `llms.txt`, JSON-LD — **parallel with Release 1; no auth dependency** |
| **E8** | **Personal learning paths** | ✅ Valid | Fixed curriculum + personas | User-owned roadmaps | **Requires sign-in**; `user_paths` — **depends E2, E4** |
| **E9** | **Platform onboarding** | ✅ Valid | None | First-run flow | Persona or browse official — **depends E4; guest OK for browse path** |
| **E5** | **Content management in admin** | ✅ Valid | JSON in repo + `/admin` review only | In-app CRUD | Admin CMS — **learner-independent; after Release 2** |
| **E6** | **Enhanced admin tool** | ✅ Valid | Pending submissions, digest count | Full ops dashboard | **Depends E5 for CMS surfaces** |
| **E11** | **Admin LLM toolkit** | ✅ Valid | No LLM; rule-based digest only | Settings + all admin surfaces | **Depends E5/E6 admin routes + Edge Function** |
| **E12** | **Newsletter send (optional)** | ✅ Valid | Digest subscribe + CI artifact only | Email delivery | **Depends E11g draft editor** |
| **E10** | **External AI deep links** | ✅ Valid | None | Optional learner links | Low priority; no auth — **after core learner polish** |

#### Phase E task breakdown

**Priority key:** **P0** = learner shell (ship first) · **P1** = core learner value · **P2** = community + admin ops · **P3** = optional / admin LLM polish

| # | Task | Details | Priority | Depends | Done |
|---|------|---------|----------|---------|------|
| E0a | Auth — guest-first policy | Document in UI: curriculum never gated; sign-in for sync/community/paths | P0 | — | ☐ |
| E0b | Auth — contextual sign-in | `SignInPrompt` reusable component → `openSignIn()`; adopted on submit gate (extend to team/path/notes later) | P0 | E4a | ☑ |
| E0c | Auth — merge confirmation | Post-sign-in toast: “X resources synced from this device” — **deferred: needs a toast/notification surface (own slice)** | P0 | — | ☐ |
| E0d | Auth — professional modal | App-level `AuthModal` on Modal/Input/Button primitives (Radix focus trap, ESC, ARIA); opened via `openSignIn()` context | P0 | E4a | ☑ |
| E0e | Auth — sync error + offline UI | Toast + retry on Supabase error; offline badge; session expiry prompt — **deferred: needs the same toast surface as E0c** | P0 | E0 | ☐ |
| E4a | IA — navigation | Primary nav: Learn · My learning · Community; admin in account menu. `/my` + `/community` are minimal stubs pending E2/E3. Phase nav now an in-Learn sidebar | P0 | Design token decision | ☑ |
| E4b | IA — layouts | Shared `PageHeader` across all 6 routes; consistent page chrome. ResourceCard kept as-is (color-coded type/difficulty/priority badges carry info the generic `Badge` can't) | P0 | E4a | ☑ |
| E4c | Mobile navigation | `MobileTabBar` fixed bottom-tab primary nav (≤768px); top-nav primary links hide on mobile; content padded to clear the bar | P0 | E4a | ☑ |
| E4d | Skeleton loaders | `Skeleton` primitive shipped; applied to AdminPage load. Curriculum content is static (no async resource fetch), so skeletons apply only to genuine async surfaces | P0 | E4a | ☑ |
| E7a | `llms.txt` + site summary | `scripts/generate-llms-txt.ts` writes `public/llms.txt` from curriculum content (wired into prebuild) — stays in sync with phases | P0 | — | ☑ |
| E7b | JSON-LD structured data | `useJsonLd` hook injects schema.org `Course` (phase pages) + `ItemList` (overview); captured in prerendered HTML (verified in `dist/`). Per-resource schema deferred | P0 | — | ☑ |
| N1 | GitHub README badge | **Deferred → bundle with E2.** Shields.io *endpoint* badge fed by a Vercel fn `api/badge/[userId].ts` → new `get_user_progress_badge(uuid)` **SECURITY DEFINER** RPC (aggregate % only, no PII, granted to `anon` — mirrors `get_public_completion_stats`). Snippet surfaced via "Copy badge" on `/profile`. **Data-exposure note:** makes any UUID's completion % publicly queryable (opt-in by sharing). Depends E2 | P1 | E2 | ☐ |
| E2 | Profile hub `/my` + `/my/account` | `/my` learning launchpad (header, Continue, per-phase, track); `/my/account` settings (digest, export/import, danger zone); global `SiteFooter`; account menu holds sign-out; honest full data delete (migration 004). Paths/notes/teams + N1 badge + E0c/E0e toast still pending | P1 | E4, E0 | ☑ |
| E8e | Smart next-step hints | Rule-based “what’s next” from persona + progress (no LLM) | P1 | E4 | ☐ |
| E9 | Platform onboarding | First-run: pick persona **or** browse official (guest OK); capture role + goal for E16 matching | P1 | E4 | ☐ |
| E8a | User paths — data model | `user_paths`, `user_path_nodes` — **requires auth** | P1 | E2 | ☐ |
| E8b | Path builder UI | Fork official path, add/remove/reorder resources | P1 | E8a, E4 | ☐ |
| E3pre | Modernize community pages | Migrate Submit/Digest/Team to design-system primitives (`PageHeader`/`Card`/`Button`/`Input`) — closes the polish gap before unifying. **Admin excluded** (E5 CMS rebuilds it). Runs after E2, before E3 | P1 | E2 | ☐ |
| E3 | Community page `/community` | Stats, shared notes, submissions, contributors, weekly activity widget | P1 | E4, E3pre | ☐ |
| E13 | Phase completion share card | Auto-generate OG image/card on phase completion; LinkedIn/Twitter share; Satori or canvas | P1 | E2 | ☐ |
| E14 | Private resource notes | Per-resource private “my takeaways” — separate from D8 public notes; searchable from /profile | P1 | E2 | ☐ |
| E16a | Community — phase cohort count | “42 learners on this phase this week” — extends D1 stats to feel like live social presence | P1 | D1 ✅, E3 | ☐ |
| E16b | Community — resource-level stats | “14 people completed this in 30 days” — extends D1 from phase to resource granularity | P1 | D1 ✅ | ☐ |
| E8d | Path progress | Track completion per user path | P2 | E8b | ☐ |
| E8c | Public path sharing | Shareable URL `vidyanix.ai/paths/:slug`; public view no login; SEO-indexed; clone CTA | P2 | E8b | ☐ |
| E7c | Production prerender | Playwright on Vercel or pre-rendered artifact | P2 | E7b | ☐ |
| E5a | Admin CMS — resources | Create/edit/delete with Zod validation preview | P2 | — | ☐ |
| E5c | Publish pipeline | Approved submission → draft → publish | P2 | E5a | ☐ |
| E6a | Admin — link health panel | Surface last `check:links` CI results | P2 | — | ☐ |
| E11a | Admin LLM — settings page | `/admin/settings`: provider, model, key, limits | P2 | — | ☐ |
| E11b | Admin LLM — Edge Function | Server-side proxy; encrypted key (Supabase Vault / pgsodium); admin-only | P2 | E11a | ☐ |
| E11i | Admin LLM — template registry | Shared templates + per-screen “Generate draft” | P2 | E11b | ☐ |
| E11c | Admin LLM — CMS resource draft | Generate description from URL/title | P2 | E5a, E11b | ☐ |
| E15 | Curriculum changelog diff | “3 resources added since your last visit” — powered by D7 versioning; shown on /profile + phase header | P2 | D7 ✅, E5 | ☐ |
| E16c | Community — study partner matching | Opt-in; match on same phase + persona; link to LinkedIn/Discord — no in-app chat | P2 | E2, E9 | ☐ |
| E16d | Community — phase completion feed | Opt-in public feed: “Priya completed Agent Foundations · 2h ago”; follow other learners | P2 | E3, E2 | ☐ |
| E16e | Community — weekly activity widget | “127 learners completed a phase this week” — aggregate on /community; no personal data | P2 | E3 | ☐ |
| E19 | Public resource pages + SEO | `vidyanix.ai/resources/:id` with JSON-LD, OG, submitter credit; turns D2 approvals into SEO pages | P2 | E7b, E5c | ☐ |
| E20 | Verifiable completion badge | `vidyanix.ai/verify/:userId/:phaseId` — public; **RLS must expose phase+date+persona only, never email or full progress** | P2 | E2 | ☐ |
| E18 | Team mode — real membership | **Descoped to post-scale.** Invite-by-email → accept flow → `team_members` RLS; revive with paid team seats. Until then, owner-only scaffolding stays unsurfaced | P3 | E2, monetisation | ☐ |
| E5b | Admin CMS — phases & steps | Reorder steps, assign resources, publish version | P3 | E5a | ☐ |
| E11d | Admin LLM — submission triage | Summary + suggested phase | P3 | E11b | ☐ |
| E11e | Admin LLM — news bridge assist | Suggest bridge + resource for headline | P3 | E11b | ☐ |
| E11g | Admin LLM — newsletter draft | `/admin/digest`: subject + HTML/Markdown | P3 | E11b | ☐ |
| E11h | Admin LLM — updates & about | Changelog, banner, about copy drafts | P3 | E11b | ☐ |
| E11f | Admin LLM — audit log | Template id, admin user; minimize prompt retention | P3 | E11b | ☐ |
| E6b | Admin — users & moderation | Digest subscribers, notes queue, team overview | P3 | E5 | ☐ |
| E10 | External AI deep links | “Discuss this resource” with public context only | P3 | E4 | ☐ |
| E11j | Admin AI workbench | `/admin/ai`: ad-hoc operator drafts (v2) | P3 | E11b | ☐ |
| E12 | Newsletter send | Resend or Markdown export; admin Send gate; CAN-SPAM / unsubscribe at send layer | P3 | E11g | ☐ |

#### Priority tiers, dependencies & system-wide impact

**Build principle:** **Learner professional tool first, admin automation second.** Admin LLM (E11) does not improve learner UX until CMS surfaces exist (E5) — deprioritized vs E4/E0/E2/E8.

```text
                    ┌─────────────┐
                    │  E7a/b SEO  │  (parallel — acquisition)
                    └─────────────┘

┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ E4 IA/UI │ ──► │ E0 Auth  │ ──► │ E2 Profile│ ──► │ E8 Paths │
│  (P0)    │     │   UX     │     │  (P1)    │     │  (P1)    │
└────┬─────┘     └──────────┘     └────┬─────┘     └────┬─────┘
     │                                  │                │
     ├──────────────► E3 Community (P1) │                │
     ├──────────────► E8e Hints (P1)     │                │
     └──────────────► E9 Onboarding (P1)  │                │
                                        │                │
                    ┌───────────────────┴────────────────┘
                    ▼
              E5 Admin CMS (P2) ──► E11 Admin LLM (P2–P3)
                    │
                    └──► E6 ops polish · E12 newsletter send
```

| Tier | Release | Themes | Rationale |
|------|---------|--------|-----------|
| **0** | **R1 — Professional shell + growth seeds** | E4a–d, E0a–e, E7a–b, N1 | First impression, SEO, mobile; N1 GitHub badge ships with R1 — zero extra infra, highest virality leverage |
| **1** | **R2 — My learning + proof** | E2, E8e, E9, E13, E14, E16a–b, E20 | Profile hub + share card + private notes + cohort stats + verifiable badge; all retention + trust signals |
| **2** | **R3 — Personal paths** | E8a, E8b, E8d | Core differentiator vs static curriculum; **requires sign-in** |
| **3** | **R4 — Community + sharing** | E3, E8c, E16c–e, E15, E7c | Community learning presence; public path sharing; curriculum diff; engagement layer |
| **4** | **R5 — SEO content flywheel** | E19, E7c | Public resource pages indexed by Google; submitter attribution drives submission virality |
| **5** | **R6 — Admin ops** | E5a, E5c, E6a | Content velocity without JSON editing; learner-independent |
| **6** | **R7 — Admin LLM** | E11a–i | Depends on admin routes from R6; operator efficiency, not learner-facing |
| **7** | **Optional / post-scale** | E10, E11j, E12, E5b, E6b, E18 (team mode + paid seats) | Nice-to-have after platform stable; E18 revived with monetisation at scale |

**System-wide impact notes:**

| Change | What it affects | Risk if done out of order |
|--------|-----------------|---------------------------|
| **E4 IA** | Every route, nav, mobile | Building E2/E3 on old nav = rework |
| **E0 auth UX** | Submit, team, paths, profile CTAs | Auth-first wall would break SEO + guest progress story |
| **E8 paths** | Progress model, profile, sharing, RLS | Needs E2 profile + auth; cannot ship before sign-in UX is clear |
| **E5 CMS** | Build pipeline, content JSON, Zod | Admin-only; safe to defer until learner shell ships |
| **E11 LLM** | Edge Function, Vault, all `/admin/*` | Wasted effort if CMS/digest admin pages don’t exist yet |
| **E7 SEO** | Marketing, crawlers, share previews | Independent — run in parallel with R1 |

**Exit criteria:** A **guest** can browse and track progress professionally; a **signed-in** user can fork a path, share it, and manage everything from `/profile`; visitors find the site via Google and AI crawlers; admins publish without raw JSON; admin LLM assists drafts only after admin surfaces exist; GitHub badges and share cards are in the wild driving organic acquisition.

**Out of scope for Phase E (defer or reject):** BYOLLM / in-app **learner** tutor with user keys (🚫 rejected); native mobile apps; paid tiers; full forum replacement; **unsupervised** auto-email (LLM draft + admin Send is in scope via E11g + E12); monetisation (deferred to 1000K users).

---

### Phase F — Growth & Proof of Learning

**Goal:** Build the acquisition and retention loops that compound over time — making the product grow itself.
**Target:** 1 000K users before deciding on monetisation.
**Timeline:** Parallel to Phase E R2–R4; not a separate sequential phase.

#### F1 — Acquisition loops (viral + SEO)

| Loop | Mechanism | Effort | Expected reach |
|------|-----------|--------|----------------|
| **GitHub badge** (N1) | `/badge/:userId` — learner adds to README; every repo visitor sees it | Low | High — devs check each other's READMEs |
| **Phase share card** (E13) | LinkedIn/Twitter card auto-generated on phase complete | Medium | Very high — recruiters + managers see skill signals |
| **Public path pages** (E8c) | `vidyanix.ai/paths/:slug` — shareable, SEO-indexed, no login | Low | Medium — direct shares + Google |
| **Public resource pages** (E19) | `vidyanix.ai/resources/:id` — every approved D2 submission becomes an indexed page | Medium | Long-tail SEO; submitter shares for credit |
| **Digest referral** | Each newsletter resource links back to `vidyanix.ai`; resource share button included | Low | Medium — subscribers share resources |

#### F2 — Retention loops (return + accountability)

| Loop | Mechanism | Effort |
|------|-----------|--------|
| **Curriculum diff** (E15) | "3 resources added since your last visit" on every return | Low — D7 already tracks versions |
| **Study partner matching** (E16c) | Opt-in peer matching by phase + persona; weekly accountability without in-app chat | Medium |
| **Community activity widget** (E16e) | "127 learners completed a phase this week" — makes platform feel alive even at low user count | Low |
| **Weekly digest** (E12) | Each email is a return-visit trigger with fresh curriculum signal | Medium |
| **Completion streaks** | "Active 3 weeks" badge on public profile (opt-in) — peer-visible consistency signal | Low |

#### F3 — Competitive positioning

**What roadmap.sh has that we don't (acknowledge, not copy):**
- AI coach / quiz generation at $10/mo
- 180k+ GitHub stars, massive SEO authority
- Mobile app (iOS)

**Our sustainable moat (double down, not catch up):**
- Human-curated + practitioner-validated content — AI-generated roadmaps can't replicate trust
- Persona sequencing — no competitor sequences differently by role (manager vs IC vs PM vs DS)
- News-to-curriculum weekly bridge — weekly freshness signal roadmap.sh doesn't do
- Community quality signals — "X% of managers completed this" is peer proof, not AI-generated
- Flat, anonymous community learning presence — not hierarchy, not gamification

**The positioning claim to own:** *"The AI engineering path that practitioners actually use — curated weekly, not generated once."*

#### F4 — Proof of learning (no cert authority needed)

| Feature | What it provides | How |
|---------|-----------------|-----|
| **Verifiable link** (E20) | Public URL showing phase + date + persona completed | Supabase row + public route |
| **Share card** (E13) | LinkedIn/Twitter post-able OG image | Satori or canvas |
| **GitHub badge** (N1) | Live progress badge in README | Shield.io compatible endpoint |
| **Export JSON** (A5 ✅) | Machine-readable proof for portfolios | Already shipped |

None of these require a cert authority, accreditation, or proctoring. They satisfy the "proof of engagement" signal that enterprise managers and hiring managers actually check.

#### F5 — Market context

- 1.6M open AI roles globally; 518K qualified candidates (3.2× demand gap)
- 90% of enterprises face AI skills shortage by 2026
- 82% of enterprises provide AI training but 59% still report skills gap — generic LMS fails; role-specific paths win
- RAG in 65% of applied LLM job listings; prompt engineering demand +135.8% YoY
- Organisations with structured programs see 3–4× higher AI adoption than self-directed learning

**Monetisation:** Deferred until 1000K users. Natural entry point when decided: paid team seats (team dashboard, path assignment, group analytics) — not a content paywall. Individual curriculum stays free forever (growth moat).

---

## Growth: What Breaks and When

| Signal | What breaks | Mitigation (phase) |
|--------|-------------|-------------------|
| 65 → 500 resources | Large bundle, slow render | Lazy-load phase data (B1), search index (C8), admin CMS (E5) |
| Monthly news updates | Manual edits | Auto-sync from awesome-ai-news (C7) |
| Multiple personas | Unmaintainable priorities | JSON + schema (B1–B2); personal paths override personas (E8) |
| Users want custom order | Persona tracks feel rigid | User path builder (E8) |
| Users want “what’s next?” | No AI tutor | Rule-based next-step hints (E8e); external AI deep links (E10) |
| Scattered community features | Low engagement | Unified `/community` + profile (E2–E3) — **after E4 shell** |
| Sidebar overload | Cognitive load, mobile pain | IA redesign (E4) — **P0 learner priority** |
| Unprofessional first impression | Managers won't adopt | E4 + E0 before admin LLM (E11) |
| Auth friction | Drop-off before value | Guest-first; contextual sign-in (E0) — **not auth-first wall** |
| JSON-only content ops | Slow iteration | Admin CMS + LLM drafts (E5, E11) + publish pipeline |
| Admin content velocity | Manual JSON editing | Admin LLM on every admin screen (E11) |
| Weekly newsletter quality | Rule-based digest feels flat | LLM newsletter draft in `/admin/digest` (E11g); optional Resend send (E12) |
| Site announcements | Static copy in code | Updates & about tool + LLM drafts (E11h) |
| SPA-only production | Weak SEO / AI indexing | llms.txt, JSON-LD, prerender (E7) |
| Phone + laptop users | localStorage frustration | Auth + cloud sync (C2–C4) ✅ |
| Multiple contributors | TS merge conflicts | JSON + PR workflow (B1); admin CMS (E5) |
| Dead external links | Trust erosion | Link checker CI (B4–B5); admin panel (E6a) |
| No usage data | Can't prioritize | Analytics (B10) |
| No acquisition loop | Every user requires active marketing | GitHub badge (N1), share cards (E13), public resource pages (E19) — ship in R1/R2 |
| No proof of learning | Enterprise + hiring signal missing | Verifiable link (E20), share card (E13), GitHub badge (N1) |
| Solo learning only | Low retention, no accountability | Study partner matching (E16c), completion feed (E16d), cohort stats (E16a) |
| Anon stats RPC unbounded | Query-cost abuse on `get_public_completion_stats` (read-only; submit is auth-gated) | Cost guard / rate limit on the anon RPC before E3 goes wide |
| Content feels stale | Users don't know if 2023 resources still apply | Resource age signal in admin CMS (E5a); E15 curriculum diff on return visits |
| No CSP / security headers on app HTML | XSS risk once community notes + submissions scale (`vercel.json` covers `/api/` only) | Add CSP + X-Frame-Options to `vercel.json` before E3 goes wide |
| Session expires silently | User loses unsaved progress; trust erodes | E0e — expiry prompt + re-auth flow |
| roadmap.sh ships AI coach | Positioning gap widens | Double down on human curation quality + news freshness + persona sequencing — not AI generation |

---

## Target Architecture

### Today (Phase D)

```
┌─────────────────────────────────────────────┐
│  Vite + React SPA                           │
│  • Routes: learn, search, community scatter │
│  • JSON content + Zod (build-time)          │
│  • Fuse.js search · i18n shell              │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴──────────┐
         ▼                    ▼
   Vercel CDN            Supabase
   • Static dist         • Auth · progress · personas
   • /api/v1/curriculum  • Submissions · notes · teams
                         • Community stats RPC
```

### Target (Phase E)

```
┌──────────────────────────────────────────────────────────┐
│  Vite + React SPA (IA: Learn · My learning · Community)   │
│  • Official curriculum + user path builder (E8)           │
│  • /profile · /community · /admin · /admin/settings       │
│  • /admin/digest · /admin/updates · /admin/ai (v2)        │
│  • No learner LLM / no user API keys                      │
└────────────────────────┬─────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
         Vercel CDN           Supabase Postgres
         • prerender/llms.txt • user_paths · cms_drafts
         • JSON-LD · sitemap  • admin_llm_config (encrypted)
                              • admin_llm_audit · site_announcements
                              • digest_drafts (newsletter)
              │                     │
              └──────────┬──────────┘
                         ▼
              Edge Function `admin-llm` (E11)
              • Admin-only · keys server-side
              • Draft JSON to CMS — never auto-publish
```

**Principles (updated):**

- **Guest-first, sign-in later** — curriculum open; auth for sync, paths, and community only.
- **Learner before admin** — professional shell (E4/E0) ships before admin LLM (E11).
- **Canonical curriculum** stays curated and validated; user paths are forks/overlays.
- **No learner LLM credentials** — BYOLLM rejected; learners use external deep links (E10) or curated content.
- **Admin LLM is operator tooling** — one Edge Function, template per admin screen; keys in `/admin/settings`; human publish/send gate.
- **Static-first where possible**; dynamic data (paths, profile, CMS drafts) in Supabase.
- **AI-readable site** (llms.txt, JSON-LD, public API) — distinct from **in-app** features.

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
| LLM / user API keys | 🚫 Not collected — BYOLLM rejected for learners |
| Admin LLM keys | Operator-only; stored server-side encrypted or Vercel `ADMIN_LLM_API_KEY`; documented in privacy policy as admin tooling, not sold to third parties |
| LLM-generated content | All outputs are drafts; human admin publishes; Zod validation before live |
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
npm run sync:phase-resources   # refresh phase→resource map for D1 stats
```

---

## Decision Log (fill in as you go)

| Date | Decision | Rationale |
|------|----------|-----------|
| Jun 2026 | Hosting: Vercel | Git integration, SPA rewrites, custom domain |
| Jun 2026 | Backend: Supabase | Auth + Postgres sync; minimal custom API |
| Jun 2026 | CMS: JSON in repo | Phase B workflow; PR-based content edits |
| Jun 2026 | Analytics: Plausible (optional) | Privacy-friendly; env-gated |
| Jun 2026 | Phase D complete | Community MVP shipped before platform pivot |
| Jun 2026 | Phase E: platform pivot | Profile/community hubs, custom paths, admin CMS, SEO/crawler discoverability |
| Jun 2026 | **BYOLLM rejected** | Learner keys/chat: GDPR, XSS, subprocessors, abuse — use external links + rule-based hints |
| Jun 2026 | **Admin LLM approved (E11)** | Admin-only keys via `/admin/settings` + Edge Function; LLM on all admin surfaces (CMS, newsletter, updates); draft-only, human publish/send — distinct from BYOLLM |
| Jun 2026 | **Newsletter + updates LLM** | Weekly digest draft (E11g) and site announcements (E11h) validated; subscriber PII never in prompts; Resend send optional (E12) |
| Jun 2026 | User paths as forks | Preserves curated canonical curriculum; personal roadmaps without fragmenting quality |
| Jun 2026 | **Guest-first auth** | Sign-in **later**, contextual — never wall curriculum; required for paths, community, sync |
| Jun 2026 | **Learner-first priorities** | E4/E0/E2 before E11; admin LLM after CMS surfaces exist |
| Jun 2026 | **Professional learner tool** | Credible UX for managers/teams; not hobby checklist app |
| Jun 2026 | **E16 redesigned — flat community, no hierarchy** | E16 is peer-to-peer learning presence (cohort stats, study matching, completion feed); no manager/report relationship; all opt-in; enforced in RLS |
| Jun 2026 | **Monetisation deferred to 1000K users** | Individual curriculum stays free forever (growth moat); paid tier TBD at scale; natural entry: team seats |
| Jun 2026 | **Growth loops added to R1** | GitHub badge (N1) and phase share cards (E13) move into R1/R2 — not afterthoughts; product must grow itself |
| Jun 2026 | **Design system: formalize existing tokens + Radix** | Code review found 19 working CSS tokens + 281 className usages (brownfield). Decided AGAINST Tailwind/shadcn (token collision + 2k-line migration). Plan: extend tokens into `tokens.css` (spacing/type/state/elevation/focus-ring) + 6 primitives on Radix (Dialog/Tabs/Dropdown) styled via CSS Modules; closes WCAG gap with no rewrite |
| Jun 2026 | **Positioning sharpened** | "Practitioner-validated, community-curated AI engineering path — updated weekly" vs roadmap.sh (AI-generated, broad) and Pluralsight (enterprise-gated, slow) |
| Jun 2026 | **D9 team mode descoped** | Code-verified: no member-add path (owner-only + UUID assignment). Reclassified Phase D ☑→🚫. E18 (invite-by-email feature build) deferred to post-scale/optional tier — only hierarchy feature post flat-community pivot (E16); team seats are a paid-tier concern (1000K gate). Scaffolding stays, unsurfaced |
| Jun 2026 | **Security posture calibrated** | Code review: 46 RLS policies, submit/notes/teams auth-gated. Only real gaps: no CSP/security headers on app HTML, and one unbounded anon stats RPC (read-only). Not "leaky" — targeted fixes before E3 |

---

## Phase E — Suggested build order (dependency-aware)

**Pre-work before any E4 code — DESIGN SYSTEM (decided Jun 2026):** Formalize the **existing** token layer (19 CSS custom properties already in `index.css`) rather than adopt a framework. Code review showed a coherent dark palette + 281 `className` usages — a brownfield CSS codebase where shadcn/Tailwind would force a 2,127-line migration and token-convention collision. Concrete scope:

- **Keep** all 19 existing tokens (`--accent`, `--bg-*`, `--text-*`, `--border*`, `--green`, `--radius*`, `--sans/serif`, `--sidebar-w`).
- **Add** missing scales into a `tokens.css`: spacing (`--space-1..8`), type scale (`--text-xs..2xl` + weights), state colors (`--danger`, `--warning` distinct from amber accent, `--info` + dims), elevation (`--shadow-sm/md/lg`), `--radius-lg`, and a **`--focus-ring`** token (required for WCAG keyboard nav).
- **Build 6 primitives** styled with tokens via CSS Modules: Button, Card, Input, Badge (pure CSS) + Modal (`@radix-ui/react-dialog`), Tabs (`@radix-ui/react-tabs`), Dropdown (`@radix-ui/react-dropdown-menu`).
- **Radix** provides accessible focus traps, ARIA, and keyboard nav — directly closes the E4 WCAG 2.1 AA gap; no UI rewrite, no new utility paradigm.
- **Document** in `docs/DESIGN-SYSTEM.md`.

Why not Tailwind + shadcn: greenfield-optimized; here it collides with existing tokens and a working 2k-line CSS codebase — migration tax paid before E4 delivers any user value.

**D9 decision (resolved Jun 2026): descoped.** Team mode has no member-add path in code (only `createTeam` + UUID-based `assignResource`). Rather than build E18 now, team mode is **deferred to the post-scale / optional tier** alongside monetisation — it's the only hierarchy feature in a product that pivoted community to flat/peer (E16), and team seats are a paid-tier concern (1000K-user gate). Owner-only scaffolding remains in the codebase but is **not surfaced** in the learner UI. Do not carry D9 as "done."

### Release 1 — Professional shell + growth seeds (P0)
**Goal:** Credible first impression; SEO; organic acquisition starts on day 1.

1. **E4a + E4b + E4c + E4d** — IA, layouts, mobile nav, skeleton loaders
2. **E0a–e** — Progressive auth UX + sync error UI + session expiry handling
3. **E7a + E7b** — `llms.txt` + JSON-LD *(parallel — no blockers)*
4. **N1** — GitHub README badge endpoint *(parallel — highest virality / lowest effort)*

### Release 2 — My learning + proof of learning (P1)
**Goal:** Signed-in users feel the product is built for them; shareable milestones start driving acquisition.

5. **E2** — `/profile` hub (account, progress, export, GDPR delete, digest)
6. **E13** — Phase completion share card (LinkedIn/Twitter auto-card on phase complete)
7. **E14** — Private resource notes (personal knowledge base layer)
8. **E8e + E9** — Next-step hints + first-run onboarding (role + goal captured for E16)
9. **E16a + E16b** — Phase cohort count + resource-level community stats
10. **E20** — Verifiable completion link (`vidyanix.ai/verify/:userId/:phaseId`)

### Release 3 — Personal paths (P1)
**Goal:** roadmap.sh-style differentiation; **sign-in required**.

11. **E8a + E8b + E8d** — Path data model, builder UI, path progress

### Release 4 — Community + sharing (P2)
**Goal:** Engagement layer; community makes the platform feel alive.

12. **E3** — `/community` unified surface + weekly activity widget (E16e)
13. **E8c** — Public path sharing (SEO-indexed, clone CTA, no login to view)
14. **E16c + E16d** — Study partner matching + opt-in phase completion feed
15. **E15** — Curriculum changelog diff ("3 resources added since your last visit")
16. **E7c** — Production prerender

### Release 5 — SEO content flywheel (P2)
**Goal:** Every approved submission becomes an indexed page; submission virality.

17. **E19** — Public resource pages `vidyanix.ai/resources/:id` with JSON-LD + submitter credit

### Release 6 — Admin ops (P2)
**Goal:** Content velocity without JSON editing; no LLM yet.

18. **E5a + E5c + E6a** — CMS resources, publish pipeline, link health

### Release 7 — Admin LLM (P2–P3)
**Goal:** Operator efficiency; depends on admin routes from Release 6.

19. **E11a + E11b + E11i + E11c** — Settings, Edge Function (Vault encrypted), template registry, CMS drafts
20. **E11d–h + E11f** — Triage, news, newsletter draft, updates/about, audit log
21. **E12** *(optional)* — Resend newsletter send (CAN-SPAM + unsubscribe at send layer)

### Optional (P3)
22. **E10** — External AI deep links for learners
23. **E11j, E5b, E6b** — AI workbench, phase CMS, moderation panel

---

## Related docs

- App README: `../README.md`
- Content data: `../content/*.json` (loaded via `../src/data/`)

---

*Update this file when phases complete or scope changes.*
