# E2 — `/my` Profile / "My learning" Hub — Design Spec

> Turns the current `/my` stub into the full "My learning" hub: identity, progress, track, account/data, and a danger zone — organized as an information architect, guest-first.

**Date:** 2026-07-01
**Status:** Approved for planning
**Route:** `/my` (the "My learning" nav item; the vision's conceptual `/profile`). No new route — the existing `MyLearningPage` is replaced.

---

## Goals

- Give users a focused `/my` learning launchpad (progress, next step, track) and a separate `/my/account` for administrative settings — split so neither page is cluttered.
- Stay **guest-first**: signed-out users still see their local progress and a contextual sign-in prompt — never a wall.
- Reuse the design system (`Card`, `Button`, `Input`, `Modal`, `Skeleton`, `PageHeader`) and existing hooks/services; add only what's missing.
- Ship an honest **"delete my data"** (all user-owned rows), the trust feature the North Star emphasizes.

## Non-goals (out of scope for this slice)

- Personal paths (E8), an aggregated "my notes" view, and team management (E18 descoped) — these get their own sections later.
- The N1 GitHub badge (bundled with this hub in a follow-up once the layout exists).
- A toast/notification surface (E0c/E0e) — errors surface inline here; the toast is a separate slice.
- Deleting the auth **login identity** (`auth.users` row) — needs a service-role edge function; this slice deletes all user **data** and signs out. Documented in "Delete semantics".

---

## Information architecture (approved — decluttered v2)

Split **frequent (learning) from rare (account/settings)** across two focused pages, move identity + sign out into the top-nav account menu, and give the whole site a global footer. This keeps `/my` a clean launchpad instead of one dense page. Section labels are **sentence case** (design-system rule), not the ALL-CAPS of the first draft.

**Page 1 — `/my` ("My learning"): learning only.**
1. Lightweight header — "Your learning" + a one-line summary (e.g. "40 of 65 done · 62%"). No avatar/email/sign-out here (that's in the nav account menu). Guests: "Browsing as guest" + "Sign in to sync" (opens the existing `AuthModal` via `openSignIn()`).
2. **"Continue where you left off"** — the hero launch card (next unstarted resource).
3. Per-phase progress rows (compact).
4. Track (persona) selector.

**Page 2 — `/my/account` ("Account settings"): rare/administrative.** Reached from the account menu.
1. Preferences — weekly digest subscribe, progress export/import.
2. **Danger zone** (bottom, red-accented) — reset progress, delete my data. Both behind a confirm `Modal`.

**Top-nav account menu** (extend the existing `TopNav` `Dropdown`): email + track · Account settings (`/my/account`) · Privacy · **Sign out**.

**Global footer** (new, `AppShell`, every page): curriculum version · Privacy · Curriculum API · llms.txt · language switch. This **replaces** the footer block currently inside `LearnSidebar` (removed there) and removes language/privacy from the profile entirely.

## Guest vs signed-in behavior

| Element | Guest (local only) | Signed in |
|---------|--------------------|-----------|
| Nav account menu | shows "Sign in to sync" | email · Account settings · Sign out |
| `/my` header | "Browsing as guest" + Sign in to sync | "Your learning" + summary |
| Metrics / per-phase / Continue | ✅ from localStorage | ✅ (cloud-synced) |
| Track selector | ✅ local | ✅ cloud |
| Export / import (`/my/account`) | ✅ | ✅ |
| Reset progress (`/my/account`) | ✅ (local) | ✅ (local + cloud) |
| Weekly digest (`/my/account`) | Prompt sign-in | ✅ |
| Delete my data (`/my/account`) | Hidden (nothing server-side to delete) | ✅ |
| Language / privacy | Global footer | Global footer |

---

## Component decomposition

New files under `src/components/profile/` (one clear responsibility each; each testable in isolation with `renderWithProviders`):

| Component | Route/where | Responsibility | Consumes |
|-----------|-------------|----------------|----------|
| `ProfilePage.tsx` | `/my` | Composes the learning-only page | hooks below |
| `ProfileHeader.tsx` | `/my` | "Your learning" + summary; guest strip with Sign in to sync | `useAuth`, progress helpers |
| `ProgressOverview.tsx` | `/my` | Continue card + per-phase rows | progress helpers |
| `TrackSelector.tsx` | `/my` | Persona view + change | `usePersona` |
| `AccountSettingsPage.tsx` | `/my/account` | Composes the settings page | hooks below |
| `AccountPreferences.tsx` | `/my/account` | Digest subscribe, export/import | `useProgress`, `subscribeDigest` |
| `DangerZone.tsx` | `/my/account` | Reset + delete, each with a confirm `Modal` | `useProgress`, `deleteAccountData`, `useAuth` |
| `SiteFooter.tsx` | `AppShell` (global) | Version, privacy, API, llms.txt, language switch | `useLocale` |

`ProfilePage` replaces `MyLearningPage` (delete `MyLearningPage.tsx` + its module.css after wiring). Route changes in `App.tsx`: keep `/my`, add `/my/account`.

**Edits to existing components:**
- `TopNav.tsx` — the account `Dropdown`: for signed-in users show email (label) + "Account settings" (→ `/my/account`) + existing items + "Sign out" (`signOut()`); for guests keep "Sign in". This moves sign-out off the profile page.
- `LearnSidebar.tsx` — **remove** the `sidebar-footer` block (version, locale switch, privacy); the global `SiteFooter` owns these now. Sidebar becomes phases + discovery only.
- `AppShell` (`App.tsx`) — render `<SiteFooter />` after `.app-body` (below the mobile tab bar considerations; footer sits at page bottom on all routes).

## Shared logic (new, pure + tested)

- **`src/lib/progressSummary.ts`**
  - `phaseProgress(personaId, isComplete)` → `{ phaseId, title, number, done, total, pct }[]` and an overall `{ done, total, pct }`. Extracts the counting logic currently inlined in `App.tsx` (`countPhase`) so both share one source. Respects persona track (essential vs full) like the existing bars.
  - `nextResource(personaId, isComplete)` → the first incomplete resource in persona phase order (id, title, phaseId, url) or `null` if complete. Powers "Continue where you left off". Pure, no LLM (this is E8e's rule-based hint, surfaced here).
- **`src/services/accountData.ts`**
  - `deleteAccountData(userId)` — client-side deletes (RLS-permitted) from `user_progress`, `user_resource_notes`, `digest_subscriptions`, `user_profiles` where `user_id = userId`; then clears the local progress/persona `localStorage` keys. Returns `{ error?: string }`. Caller signs out on success.

## Data / backend

- **New migration** `supabase/migrations/004_profile_delete_policy.sql`: add the missing delete policy so the client can remove its own profile row:
  ```sql
  drop policy if exists "Users delete own profile" on public.user_profiles;
  create policy "Users delete own profile"
    on public.user_profiles for delete
    using (auth.uid() = user_id);
  ```
  (`user_progress` already has a delete policy; `user_resource_notes` and `digest_subscriptions` use `FOR ALL` "manage own" policies that include delete.)
- No new tables, no edge function, no new secrets.

### Delete semantics (honest labeling)

"Delete my data" removes **all user-owned data rows** (progress, profile, notes, digest subscription) and signs out. It does **not** delete the `auth.users` login identity (that requires a service-role edge function — a documented follow-up). The confirm modal copy says exactly this: "This permanently deletes your progress, profile, and notes. Your sign-in email stays registered." No overclaiming.

## Error handling

- Sync/delete/subscribe failures surface **inline** next to the action (a short message in `--text-danger`), not silently. This is the interim until the E0c/E0e toast surface exists; the spec deliberately keeps it inline to avoid blocking on that slice.
- Delete runs table-by-table; if any table errors, stop, show which step failed, do **not** sign out (so the user can retry). Only sign out after all deletes succeed.
- Guest actions that need auth (digest, delete) call `openSignIn()` rather than erroring.

## Testing

- **Pure logic** (`progressSummary.ts`): unit-test `phaseProgress` (overall + per-phase totals, persona-aware) and `nextResource` (returns first incomplete; `null` when done) with a small fixed curriculum fixture. TDD.
- **Components** with `renderWithProviders`:
  - `ProfileHeader`: guest shows "Sign in to sync" → click calls `openSignIn`; signed-in shows "Your learning" + summary.
  - `ProgressOverview`: renders a Continue link to the next resource and one row per phase.
  - `TrackSelector`: changing the select updates persona.
  - `AccountPreferences`: renders digest + export/import controls.
  - `DangerZone`: "Delete…" opens a confirm `Modal`; confirming calls `deleteAccountData`; reset opens its own confirm.
  - `SiteFooter`: renders version, privacy link, and the language switch (changing it calls `setLocale`).
  - `TopNav` (updated): signed-in account menu includes "Account settings" and "Sign out" (→ `signOut`).
- **Service** (`accountData.ts`): unit-test the delete sequence against a mocked Supabase client (each table's `.delete().eq()` called; stops on first error; localStorage cleared on success).
- Full suite + lint + `tsc` + `vite build` green; browser smoke check of `/my` in both guest and signed-in states.

## Rollout / ops

- Apply migration `004` (`npm run migrate:supabase`) before the delete action works in production. The UI degrades gracefully if not applied (delete of `user_profiles` returns an RLS error, surfaced inline) — documented in the PR.

## Success criteria

- `/my` is a focused learning launchpad (header + Continue + per-phase + track) — not a dense settings dump; guests see local progress + a sign-in prompt.
- `/my/account` holds preferences (digest, backup) and the danger zone (reset, honest full delete); reached from the nav account menu, which also holds Sign out.
- A global `SiteFooter` (version, privacy, API, llms.txt, language) shows on every page; the `LearnSidebar` footer is removed (no duplication).
- "Continue where you left off" jumps to the correct next resource.
- Everything reuses the design system; mobile stacks cleanly.
