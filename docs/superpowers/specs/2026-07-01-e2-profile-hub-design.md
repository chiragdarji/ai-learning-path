# E2 — `/my` Profile / "My learning" Hub — Design Spec

> Turns the current `/my` stub into the full "My learning" hub: identity, progress, track, account/data, and a danger zone — organized as an information architect, guest-first.

**Date:** 2026-07-01
**Status:** Approved for planning
**Route:** `/my` (the "My learning" nav item; the vision's conceptual `/profile`). No new route — the existing `MyLearningPage` is replaced.

---

## Goals

- Give signed-in users a single hub to see progress, manage their track, control their data, and jump back into learning.
- Stay **guest-first**: signed-out users still see their local progress and a contextual sign-in prompt — never a wall.
- Reuse the design system (`Card`, `Button`, `Input`, `Modal`, `Skeleton`, `PageHeader`) and existing hooks/services; add only what's missing.
- Ship an honest **"delete my data"** (all user-owned rows), the trust feature the North Star emphasizes.

## Non-goals (out of scope for this slice)

- Personal paths (E8), an aggregated "my notes" view, and team management (E18 descoped) — these get their own sections later.
- The N1 GitHub badge (bundled with this hub in a follow-up once the layout exists).
- A toast/notification surface (E0c/E0e) — errors surface inline here; the toast is a separate slice.
- Deleting the auth **login identity** (`auth.users` row) — needs a service-role edge function; this slice deletes all user **data** and signs out. Documented in "Delete semantics".

---

## Information architecture (approved)

A **single scannable page**, ordered by frequency of use so the common case needs no scrolling and destructive actions are isolated. Not tabs — the content is modest and stacks cleanly on mobile.

1. **Identity header** — avatar, email, track + sync status, sign out. Guests: "Browsing as guest" + "Sign in to sync" (opens the existing `AuthModal` via `openSignIn()`).
2. **Your learning** — three metric cards (overall %, resources done/total, current phase); a **"Continue where you left off"** launch card (next unstarted resource); per-phase progress bars; track (persona) selector.
3. **Account and data** — one quiet card: weekly digest subscribe, progress export/import, language, privacy link.
4. **Danger zone** — red-accented card: reset progress, delete my data. Both behind a confirm `Modal`.

## Guest vs signed-in behavior

| Element | Guest (local only) | Signed in |
|---------|--------------------|-----------|
| Identity header | "Browsing as guest" + Sign in to sync | Email + avatar + Sign out |
| Metrics / per-phase / Continue | ✅ from localStorage | ✅ (cloud-synced) |
| Track selector | ✅ local | ✅ cloud |
| Export / import | ✅ | ✅ |
| Reset progress | ✅ (local) | ✅ (local + cloud) |
| Weekly digest | Prompt sign-in (email tied to profile) | ✅ |
| Delete my data | Hidden (nothing server-side to delete) | ✅ |

---

## Component decomposition

New files under `src/components/profile/` (one clear responsibility each; each testable in isolation with `renderWithProviders`):

| Component | Responsibility | Consumes |
|-----------|----------------|----------|
| `ProfilePage.tsx` | Route component at `/my`; composes the sections; owns no logic beyond wiring | hooks below |
| `ProfileHeader.tsx` | Identity strip / guest strip | `useAuth` |
| `ProgressOverview.tsx` | Metric cards + Continue card + per-phase bars | progress helpers |
| `TrackSelector.tsx` | Persona view + change | `usePersona` |
| `AccountDataCard.tsx` | Digest subscribe, export/import, language, privacy | `useProgress`, `useLocale`, `subscribeDigest` |
| `DangerZone.tsx` | Reset + delete, each with a confirm `Modal` | `useProgress`, `deleteAccountData`, `useAuth` |

`ProfilePage` replaces `MyLearningPage` (delete `MyLearningPage.tsx` + its module.css after wiring; update the import in `App.tsx`). The route stays `/my`.

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
  - `ProfileHeader`: guest shows "Sign in to sync" → click calls `openSignIn`; signed-in shows email + Sign out.
  - `ProgressOverview`: renders overall %, a Continue link to the next resource, and one row per phase.
  - `TrackSelector`: changing the select updates persona.
  - `DangerZone`: "Delete…" opens a confirm `Modal`; confirming calls `deleteAccountData`; reset opens its own confirm.
- **Service** (`accountData.ts`): unit-test the delete sequence against a mocked Supabase client (each table's `.delete().eq()` called; stops on first error; localStorage cleared on success).
- Full suite + lint + `tsc` + `vite build` green; browser smoke check of `/my` in both guest and signed-in states.

## Rollout / ops

- Apply migration `004` (`npm run migrate:supabase`) before the delete action works in production. The UI degrades gracefully if not applied (delete of `user_profiles` returns an RLS error, surfaced inline) — documented in the PR.

## Success criteria

- A guest sees local progress + a sign-in prompt on `/my`; a signed-in user sees synced progress, can change track, export/import/reset, subscribe to the digest, and delete their data honestly.
- "Continue where you left off" jumps to the correct next resource.
- Everything reuses the design system; no new nav; mobile stacks cleanly.
