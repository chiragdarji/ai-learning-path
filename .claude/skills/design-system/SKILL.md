---
name: design-system
description: Use when building or changing any UI in this project — pages, components, forms, modals, or styling. Explains the token + primitive system (no Tailwind/shadcn) and how to add a new primitive with TDD.
---

# Design system

This app uses a hand-rolled, token-first design system — **not** Tailwind or shadcn. Reference: `docs/DESIGN-SYSTEM.md`.

## Rules

1. **Build from primitives.** Import from the barrel: `import { Button, Card, Input, Modal, Tabs, Dropdown, Badge, Skeleton } from '../components/ui'`. Don't hand-roll buttons/inputs/dialogs.
2. **Use tokens, never hardcode.** All colors, spacing, type, radius, elevation, and the focus ring live in `src/styles/tokens.css` as CSS variables (`var(--accent)`, `var(--space-4)`, `var(--text-sm)`, `var(--radius)`, `var(--shadow-md)`, `var(--focus-ring)`). Never write raw hex or px for a tokenized value. The one known exception is documented in the design-system doc.
3. **CSS Modules for component styles** (`Foo.module.css` next to `Foo.tsx`), scoped and token-based. Global app CSS stays in `src/index.css`.
4. **Page chrome uses `PageHeader`** (`src/components/PageHeader.tsx`) — eyebrow + title + optional subtitle/children. Every route should use it for a consistent header.
5. **Interactive things wrap Radix.** Modal → `@radix-ui/react-dialog`, Tabs → `react-tabs`, Dropdown → `react-dropdown-menu`. This gives focus trap, Escape, ARIA, and keyboard nav for free — don't reimplement them.
6. **Sentence case** everywhere (labels, headings, buttons). No ALL-CAPS.

## Adding a new primitive (TDD)

Follow the pattern of the existing eight. For a primitive `Foo`:

1. Write `src/components/ui/Foo.test.tsx` first (render + behavior). Run it — it fails.
2. Create `src/components/ui/Foo.module.css` using only token variables; add `:focus-visible { box-shadow: var(--focus-ring) }` for anything interactive.
3. Create `src/components/ui/Foo.tsx` — named export, extends the appropriate native props type, composes `styles.foo` + a passthrough `className`.
4. Run the test — it passes.
5. Export from `src/components/ui/index.ts` (component + its props type).
6. Add a row to the primitives table in `docs/DESIGN-SYSTEM.md`.

## Adding new tokens

Add to `src/styles/tokens.css` (single source of truth, imported by `index.css`). Keep the existing groups: surfaces, borders, text, brand (`--accent`), state (`--danger`/`--warning`/`--info`/`--green` + `*-dim`), spacing (`--space-1..8`), type scale, radius, elevation, `--focus-ring`.

## Testing UI

Vitest has `globals: true`. Use `renderWithProviders` (`src/test/renderWithProviders.tsx`) for components that need the router, auth, or locale context. Assert by role/label (accessibility), not by class name. Use `@testing-library/user-event` for interactions (clicks, keyboard) — needed for Radix behavior like Escape-to-close.
