---
name: curriculum-content
description: Use when editing curriculum content (phases, steps, resources, personas, news) or the generators/schemas around it. Explains the JSON + Zod pipeline and the prebuild generators.
---

# Curriculum content

Curriculum is **data, not code** — JSON files validated by Zod at build time.

## Where content lives

- `content/learning-path.json` — phases → steps → resources (the curriculum)
- `content/personas.json` + `content/personas-phase-d.json` — persona tracks (phase order + per-resource priorities)
- `content/meta.json` — curriculum version/label/description
- `content/ai-news-radar.json` — news themes, learning bridges, highlights

## Schemas (validation)

`src/schemas/content.ts` defines Zod schemas: `resourceSchema`, `stepSchema`, `phaseSchema`, `learningPathSchema`, `personasSchema`, `aiNewsRadarSchema`. Shapes:

- Phase: `id, number, title, level, levelLabel, description, estimatedWeeks, steps[]`
- Step: `id, title, resources[]`
- Resource: `id, title, url, type, difficulty, tags[], duration?, description`

Resource `id`s must be unique across the whole path. After any content edit, run `npm run validate:content` (also runs in `prebuild`, failing CI on bad content).

## Generators (run in `prebuild`)

`npm run prebuild` runs, in order: `validate-content` → `generate-sitemap` → `generate-curriculum-api` → `generate-llms-txt`. These read the content JSON and write to `public/`:

- `public/sitemap.xml`, `public/api/v1/curriculum.json`, `public/llms.txt`

If you add a phase or change titles/descriptions, these regenerate automatically at build — don't hand-edit the generated files in `public/`. To add a new generator, follow the pattern in `scripts/generate-sitemap.ts` (read + Zod-parse content, write to `public/`) and add it to the `prebuild` chain in `package.json`.

## Consuming content in the app

Loaded via `src/data/` (e.g. `LEARNING_PATH` from `src/data/learningPath`, `PERSONAS` from `src/data/personas`, `CURRICULUM_META` from `src/data/meta`). Progress and persona logic derive from these — see `src/lib/progressSummary.ts` for phase/overall/next-resource computation.
