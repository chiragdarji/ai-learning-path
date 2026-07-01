---
name: pull-request-flow
description: Use when shipping a change on this repo — branching, committing, opening a PR, and getting CI green before merge. Covers the specific CI checks and the Chromium/prerender gotcha that can block e2e.
---

# Pull request flow

## Branch + commit

- Branch off `main`: `git checkout main && git pull --ff-only && git checkout -b <type>/<slug>` (`feat/`, `fix/`, `docs/`, `chore/`).
- Commit in small, imperative, per-logical-step chunks (TDD: test → impl → commit). Don't bundle unrelated changes.
- Before pushing, verify locally: `npx vitest run && npm run lint && npx tsc -b && npx vite build`. (Use `npx vite build`, not full `npm run build`, unless you've installed Chromium — see below.)

## Open the PR

`gh pr create --base main --head <branch> --title "…" --body "…"`. Write a body covering what changed, why, verification done, and any operational notes (e.g. "run `npm run migrate:supabase` before X works"). End the body with the Claude Code attribution line.

## CI checks (must be green before merge)

The PR runs: **build**, **e2e** (Playwright), and **Vercel** (preview deploy). Watch them with `gh pr checks <n> --watch --interval 20`.

### The Chromium / prerender gotcha

`npm run build` includes `scripts/prerender-routes.ts`, which launches Playwright Chromium and serves a preview on **port 4178**. Two failure modes seen before:

1. **e2e job**: it must `npx playwright install chromium --with-deps` **before** `npm run build`, or prerender crashes with "Executable doesn't exist". Keep that order in `.github/workflows/ci.yml`.
2. **Port collision**: prerender's preview (4178) must not share Playwright's e2e webServer port (4173). Keep them distinct.

If e2e goes red, read the actual failure (`gh run view <run-id> --log-failed`) before assuming it's your code — the failures above are environmental, not regressions.

## Merge

Only merge when checks are green: `gh pr merge <n> --merge --delete-branch`. Then `git checkout main && git pull --ff-only`. Do not force-merge over a red check — fix the root cause (often a real bug your change exposed, or the CI ordering above).
