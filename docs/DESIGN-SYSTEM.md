# Design System

The platform uses a **token-first** design system: a single source of truth for
visual values (`src/styles/tokens.css`) plus a small set of accessible primitives
(`src/components/ui/`). No Tailwind, no shadcn — see the North Star decision log.

## Tokens

All tokens live in `src/styles/tokens.css` (imported by `src/index.css`).

| Group | Tokens |
|-------|--------|
| Surfaces | `--bg-deep`, `--bg-panel`, `--bg-card`, `--bg-card-hover` |
| Borders | `--border`, `--border-soft` |
| Text | `--text-strong`, `--text`, `--text-muted` |
| Brand | `--accent`, `--accent-dim`, `--accent-glow` |
| State | `--green`(success), `--danger`, `--warning`, `--info` (+ `*-dim`) |
| Spacing | `--space-1`…`--space-8` (4 → 64px) |
| Type | `--text-xs`…`--text-2xl`; `--weight-normal/medium/semibold/bold` |
| Fonts | `--sans` (IBM Plex Sans), `--serif` (Fraunces) |
| Radius | `--radius-sm`, `--radius`, `--radius-lg` |
| Elevation | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| Focus | `--focus-ring` (apply on `:focus-visible`) |

**Rule:** components must reference tokens, never hardcoded hex/px for these values.

## Primitives

Import from the barrel: `import { Button, Modal } from '../components/ui'`.

| Primitive | Notes |
|-----------|-------|
| `Button` | `variant`: primary/secondary/danger/ghost · `size`: sm/md |
| `Badge` | `tone`: neutral/accent/success/warning/danger/info |
| `Card` | `interactive` adds hover affordance |
| `Input` | requires `id` + `label`; `error` wires `aria-describedby` |
| `Modal` | Radix Dialog — focus trap, Escape, ARIA built in |
| `Tabs` | Radix Tabs — arrow-key nav, tablist roles |
| `Dropdown` | Radix DropdownMenu — roving focus, outside-click close |

Interactive primitives wrap Radix UI, so keyboard nav and ARIA meet WCAG 2.1 AA
without custom code.
