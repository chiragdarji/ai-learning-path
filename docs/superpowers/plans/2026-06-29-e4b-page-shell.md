# E4b — Page Shell Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or subagent-driven-development to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make every route share one consistent page header, and add a reusable skeleton-loading primitive for the app's genuinely-async surfaces — without regressing the information-rich ResourceCard.

**Architecture:** Extract the already-repeated `header.page-header` markup (eyebrow + h1 + optional subtitle/actions) into a single `PageHeader` component that reuses the existing global `.page-header` / `.eyebrow` CSS (so zero visual change on the four pages that already use it), then adopt it on the two new stub pages so all six routes match. Add a token-styled `Skeleton` primitive to `src/components/ui` and apply it to the real loading states (AdminPage). **ResourceCard is intentionally left as-is** — its type/difficulty/priority color-coded badges carry information the generic `Badge` tones cannot, so migrating it would lose meaning.

**Tech Stack:** React 19, TypeScript, CSS Modules + tokens, design-system primitives, Vitest + Testing Library.

**Scope decisions (locked):** Top-bar progress/export stays where it is for now (its IA move is a later E2/`/profile` concern). No ResourceCard primitive migration. Skeletons only where there is real async (static curriculum content needs none).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/components/PageHeader.tsx` + `.test.tsx` | **Create.** Shared eyebrow + title + optional subtitle/actions header. Reuses global `.page-header`/`.eyebrow` CSS. |
| `src/components/MyLearningPage.tsx` | **Modify.** Use `PageHeader`. |
| `src/components/CommunityPage.tsx` | **Modify.** Use `PageHeader`. |
| `src/components/Overview.tsx`, `PhaseView.tsx`, `SearchView.tsx`, `NewsRadarView.tsx` | **Modify.** Replace inline `header.page-header` with `PageHeader` (DRY; same markup → no visual change). |
| `src/components/ui/Skeleton.tsx` + `.module.css` + `.test.tsx` | **Create.** Reusable shimmer block. |
| `src/components/ui/index.ts` | **Modify.** Export `Skeleton`. |
| `src/components/AdminPage.tsx` | **Modify.** Replace the plain "Loading admin…" text with `Skeleton`. |
| `src/index.css` | **Modify (maybe).** Add `.page-subtitle` rule if not present. |

---

## Task 1: PageHeader component (TDD)

**Files:**
- Create: `src/components/PageHeader.tsx`, `src/components/PageHeader.test.tsx`
- Modify: `src/index.css` (add `.page-subtitle` only)

- [ ] **Step 1: Write the failing test** `src/components/PageHeader.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  it('renders the title as an h1', () => {
    render(<PageHeader eyebrow="Browse" title="Search resources" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Search resources' })).toBeInTheDocument()
  })

  it('renders the eyebrow', () => {
    render(<PageHeader eyebrow="Browse curriculum" title="Search" />)
    expect(screen.getByText('Browse curriculum')).toBeInTheDocument()
  })

  it('renders an optional subtitle', () => {
    render(<PageHeader eyebrow="X" title="Y" subtitle="Some context" />)
    expect(screen.getByText('Some context')).toBeInTheDocument()
  })

  it('renders action children', () => {
    render(
      <PageHeader eyebrow="X" title="Y">
        <button>Act</button>
      </PageHeader>,
    )
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify it FAILS.** `npx vitest run src/components/PageHeader.test.tsx`

- [ ] **Step 3: Add `.page-subtitle` to `src/index.css`.** Immediately after the existing `.page-header { margin-bottom: 2.5rem; }` rule, add:

```css
.page-subtitle {
  margin-top: var(--space-2);
  font-size: var(--text-base);
  color: var(--text-muted);
  max-width: 60ch;
}
```

- [ ] **Step 4: Create `src/components/PageHeader.tsx`:**

```tsx
import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
}

export function PageHeader({ eyebrow, title, subtitle, children }: PageHeaderProps) {
  return (
    <header className="page-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
      {children}
    </header>
  )
}
```

- [ ] **Step 5: Run — verify it PASSES** (4 tests). `npx vitest run src/components/PageHeader.test.tsx`

- [ ] **Step 6: Commit**

```bash
git add src/components/PageHeader.tsx src/components/PageHeader.test.tsx src/index.css
git commit -m "feat(e4b): add shared PageHeader component"
```

---

## Task 2: Adopt PageHeader on the two stub pages

**Files:**
- Modify: `src/components/MyLearningPage.tsx`, `src/components/CommunityPage.tsx`

- [ ] **Step 1: Update `MyLearningPage.tsx`.** Add `import { PageHeader } from './PageHeader'`. Replace the existing `<h1 className={styles.title}>{t.myLearning.title}</h1>` with:

```tsx
<PageHeader eyebrow={t.nav.myLearning} title={t.myLearning.title} />
```

Remove the now-unused `.title` rule usage (leave the CSS rule; it is harmless, or delete `.title` from `MyLearningPage.module.css` if no longer referenced).

- [ ] **Step 2: Update `CommunityPage.tsx`.** Add the import. Replace:

```tsx
<h1 className={styles.title}>{t.communityHub.title}</h1>
<p className={styles.intro}>{t.communityHub.intro}</p>
```

with:

```tsx
<PageHeader eyebrow={t.nav.community} title={t.communityHub.title} subtitle={t.communityHub.intro} />
```

- [ ] **Step 3: Run the page tests** (they assert the `h1` headings, which PageHeader still renders): `npx vitest run src/components/MyLearningPage.test.tsx src/components/CommunityPage.test.tsx`
Expected: PASS (PageHeader renders the same `<h1>` text the tests look for).

- [ ] **Step 4: Commit**

```bash
git add src/components/MyLearningPage.tsx src/components/CommunityPage.tsx src/components/MyLearningPage.module.css src/components/CommunityPage.module.css
git commit -m "feat(e4b): use PageHeader on /my and /community"
```

---

## Task 3: Adopt PageHeader on the four existing pages (DRY)

**Files:**
- Modify: `src/components/Overview.tsx`, `PhaseView.tsx`, `SearchView.tsx`, `NewsRadarView.tsx`

- [ ] **Step 1: For EACH of the four files**, locate the inline block of the form:

```tsx
<header className="page-header">
  <p className="eyebrow">{EYEBROW_EXPRESSION}</p>
  <h1>{TITLE_EXPRESSION}</h1>
  {…any extra header content…}
</header>
```

Replace it with:

```tsx
<PageHeader eyebrow={EYEBROW_EXPRESSION} title={TITLE_EXPRESSION}>
  {…any extra header content…}
</PageHeader>
```

Preserve the exact `EYEBROW_EXPRESSION` and `TITLE_EXPRESSION` already present (do not hardcode — they may be `t.*` keys, phase data, or literals). If a header has no extra content, omit the children. Add `import { PageHeader } from './PageHeader'` to each file. This is a pure DRY refactor: the rendered markup (`header.page-header` → `p.eyebrow` → `h1`) is identical, so there is no visual change.

- [ ] **Step 2: Typecheck + run the full suite.** `npx tsc -b && npx vitest run`
Expected: tsc 0; all tests pass (existing page tests still find their `h1`s).

- [ ] **Step 3: Browser smoke check.** With the dev server running, load `/`, `/search`, `/news-radar`, a `/phase/...`, `/my`, `/community`; confirm each shows its header (eyebrow + title) and nothing shifted. (Use DOM reads if screenshots are unavailable due to the port mismatch.)

- [ ] **Step 4: Commit**

```bash
git add src/components/Overview.tsx src/components/PhaseView.tsx src/components/SearchView.tsx src/components/NewsRadarView.tsx
git commit -m "refactor(e4b): use PageHeader across curriculum pages (DRY)"
```

---

## Task 4: Skeleton primitive + apply to AdminPage (TDD)

**Files:**
- Create: `src/components/ui/Skeleton.tsx`, `src/components/ui/Skeleton.module.css`, `src/components/ui/Skeleton.test.tsx`
- Modify: `src/components/ui/index.ts`, `src/components/AdminPage.tsx`

- [ ] **Step 1: Write the failing test** `src/components/ui/Skeleton.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders an accessible busy placeholder', () => {
    render(<Skeleton />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('applies width and height via inline style', () => {
    render(<Skeleton width="120px" height="20px" />)
    const el = screen.getByRole('status')
    expect(el).toHaveStyle({ width: '120px', height: '20px' })
  })
})
```

- [ ] **Step 2: Run — verify it FAILS.** `npx vitest run src/components/ui/Skeleton.test.tsx`

- [ ] **Step 3: Create `src/components/ui/Skeleton.module.css`:**

```css
.skeleton {
  display: block;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--bg-card) 25%,
    var(--bg-card-hover) 37%,
    var(--bg-card) 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer {
  from { background-position: 100% 0; }
  to { background-position: 0 0; }
}
```

- [ ] **Step 4: Create `src/components/ui/Skeleton.tsx`:**

```tsx
import styles from './Skeleton.module.css'

export interface SkeletonProps {
  width?: string
  height?: string
}

export function Skeleton({ width = '100%', height = '1rem' }: SkeletonProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={styles.skeleton}
      style={{ width, height }}
    />
  )
}
```

- [ ] **Step 5: Run — verify it PASSES** (2 tests). `npx vitest run src/components/ui/Skeleton.test.tsx`

- [ ] **Step 6: Export from the barrel.** In `src/components/ui/index.ts` add:

```ts
export { Skeleton } from './Skeleton'
export type { SkeletonProps } from './Skeleton'
```

- [ ] **Step 7: Apply to AdminPage.** In `src/components/AdminPage.tsx`, replace the loading return `if (loading) return <p className="account-loading">Loading admin…</p>` with a skeleton block:

```tsx
import { Skeleton } from './ui'
// …
if (loading)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '480px' }}>
      <Skeleton height="2rem" width="200px" />
      <Skeleton height="1rem" />
      <Skeleton height="1rem" width="80%" />
    </div>
  )
```

- [ ] **Step 8: Typecheck + full suite.** `npx tsc -b && npx vitest run`
Expected: tsc 0; all tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/ui/Skeleton.tsx src/components/ui/Skeleton.module.css src/components/ui/Skeleton.test.tsx src/components/ui/index.ts src/components/AdminPage.tsx
git commit -m "feat(e4b): add Skeleton primitive + use on AdminPage loading"
```

---

## Task 5: Verify, lint, build, docs

- [ ] **Step 1: Full verification.** `npx vitest run && npm run lint && npx tsc -b && npx vite build`
Expected: tests pass; lint clean (pre-existing AuthProvider/LocaleProvider fast-refresh warnings OK); tsc 0; vite build 0.

- [ ] **Step 2: Update `docs/DESIGN-SYSTEM.md`.** Add `Skeleton` to the primitives table (`Skeleton` — token shimmer loading placeholder; `role="status"`). Note that `PageHeader` is a shared app component (not a `ui/` primitive) in a one-line mention.

- [ ] **Step 3: Update `docs/NORTHSTAR-VISION.md`.** Mark E4b (and the E4d skeleton item) ☐→☑ in the Phase E task table; note ResourceCard intentionally retains its information-rich badges.

- [ ] **Step 4: Commit**

```bash
git add docs/DESIGN-SYSTEM.md docs/NORTHSTAR-VISION.md
git commit -m "docs(e4b): mark page shell + skeletons complete"
```

---

## Self-Review Notes

- **Spec coverage:** Consistent page headers across all six routes (Tasks 1–3); skeleton loaders for the real async surface (Task 4) — the vision's "consistent page headers" + E4d "skeleton loaders" standards. Progress-bar IA relocation is explicitly deferred (it belongs with E2 `/profile`).
- **Deliberate non-goal:** ResourceCard primitive migration — its color-coded type/difficulty/priority badges encode information the generic `Badge` tones don't; migrating would regress UX. Documented in Task 5 Step 3.
- **Type consistency:** `PageHeader` props (`eyebrow`/`title`/`subtitle`/`children`) are stable across all six adopters. `Skeleton` props (`width`/`height`) match its test and AdminPage usage.
- **Risk:** Task 3 is a refactor of working pages; mitigated by identical markup (same `.page-header` classes) + full suite + browser smoke check. Lowest-risk because there is no visual change by construction.
```