# E4a — Navigation (Learn · My learning · Community) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Replace the single all-in-one left sidebar with a professional top navigation bar (**Learn · My learning · Community**) plus an in-section sidebar that appears only inside Learn, and add minimal `/my` and `/community` landing routes so every primary nav item resolves.

**Architecture:** A global `TopNav` (brand · primary links · account/secondary menu) renders at the top of `AppShell`. The existing phase/discovery navigation is extracted into `LearnSidebar`, shown only on Learn routes (`/`, `/search`, `/news-radar`, `/phase/:id`). Two new stub pages (`MyLearningPage` at `/my`, `CommunityPage` at `/community`) reuse the design-system primitives and will be enriched later by E2/E3. Admin/Privacy/Embed move out of primary nav into a `Dropdown` account menu. Built with the `src/components/ui` primitives and design tokens — no new styling system.

**Tech Stack:** React 19, React Router v6, TypeScript, CSS Modules + tokens, design-system primitives (`Card`, `Dropdown`, `Badge`), Vitest + Testing Library + user-event.

**Decisions (locked):** Top bar + in-section sidebar (not reorganized sidebar). Minimal stub hubs for `/my` and `/community` (not deferred).

**Out of scope (→ E4b/E4c):** per-page layout polish (progress-bar placement), mobile bottom-tab bar (E4c), the full `/profile` (E2) and `/community` (E3) hubs. Existing pages remain reachable; only the chrome changes.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/test/renderWithProviders.tsx` | **Create.** Test helper wrapping UI in MemoryRouter + AuthProvider + LocaleProvider. |
| `src/i18n/en.ts`, `src/i18n/es.ts` | **Modify.** Add `nav.learn/myLearning/community/account`, and `myLearning.*` / `communityHub.*` strings. |
| `src/components/TopNav.tsx` + `.module.css` | **Create.** Global top bar: brand, primary nav, account + secondary Dropdown. |
| `src/components/LearnSidebar.tsx` + `.module.css` | **Create.** Extracted Learn sub-nav (Overview, Search, News Radar, Phases). Replaces `Sidebar.tsx`. |
| `src/components/MyLearningPage.tsx` + `.module.css` | **Create.** Stub: progress + persona + Continue. |
| `src/components/CommunityPage.tsx` + `.module.css` | **Create.** Stub: cards linking Submit/Digest/Team + stats. |
| `src/components/Sidebar.tsx` | **Delete** after `LearnSidebar` replaces it. |
| `src/App.tsx` | **Modify.** Mount `TopNav`; render `LearnSidebar` only on Learn routes; add `/my` + `/community` routes; remove duplicated `AuthButton` from main top-bar. |
| `src/components/*.test.tsx` | **Create** tests for TopNav, MyLearningPage, CommunityPage. |

---

## Task 1: Test provider helper + i18n nav strings

**Files:**
- Create: `src/test/renderWithProviders.tsx`
- Modify: `src/i18n/en.ts`, `src/i18n/es.ts`

- [ ] **Step 1: Create `src/test/renderWithProviders.tsx`**

```tsx
import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthProvider'
import { LocaleProvider } from '../context/LocaleProvider'

export function renderWithProviders(
  ui: ReactElement,
  { route = '/' }: { route?: string } = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthProvider>
        <LocaleProvider>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </LocaleProvider>
      </AuthProvider>
    )
  }
  return render(ui, { wrapper: Wrapper })
}
```

- [ ] **Step 2: Add nav keys to `src/i18n/en.ts`** — inside the existing `nav: { ... }` object, add these keys (keep existing ones):

```ts
    learn: 'Learn',
    myLearning: 'My learning',
    community: 'Community',
    account: 'Account',
```

Then, as new TOP-LEVEL keys in the `en` object (after the existing `nav` block, alongside `auth`, `persona`, etc.), add:

```ts
  myLearning: {
    title: 'My learning',
    progress: 'Your progress',
    persona: 'Your track',
    continue: 'Continue learning',
    signInHint: 'Sign in to sync your progress across devices.',
  },
  communityHub: {
    title: 'Community',
    intro: 'Contribute resources, get the weekly digest, and learn alongside others.',
    submit: 'Submit a resource',
    submitSub: 'Suggest a link for the curriculum',
    digest: 'Weekly digest',
    digestSub: 'Essential resources in your inbox',
    team: 'Team',
    teamSub: 'Learn together',
  },
```

- [ ] **Step 3: Mirror the same keys in `src/i18n/es.ts`** with Spanish values:

```ts
// inside nav:
    learn: 'Aprender',
    myLearning: 'Mi aprendizaje',
    community: 'Comunidad',
    account: 'Cuenta',
```
```ts
// top-level:
  myLearning: {
    title: 'Mi aprendizaje',
    progress: 'Tu progreso',
    persona: 'Tu ruta',
    continue: 'Seguir aprendiendo',
    signInHint: 'Inicia sesión para sincronizar tu progreso entre dispositivos.',
  },
  communityHub: {
    title: 'Comunidad',
    intro: 'Contribuye recursos, recibe el resumen semanal y aprende junto a otros.',
    submit: 'Enviar un recurso',
    submitSub: 'Sugiere un enlace para el plan',
    digest: 'Resumen semanal',
    digestSub: 'Recursos esenciales en tu correo',
    team: 'Equipo',
    teamSub: 'Aprende en equipo',
  },
```

- [ ] **Step 4: Verify the i18n type still compiles.** The `en.ts` file exports a type used to constrain `es.ts`. Run: `npx tsc -b`
Expected: exits 0 (es matches en's shape). If `es.ts` is missing a key, tsc will name it — add it.

- [ ] **Step 5: Commit**

```bash
git add src/test/renderWithProviders.tsx src/i18n/en.ts src/i18n/es.ts
git commit -m "feat(e4a): test provider helper + nav i18n strings"
```

---

## Task 2: TopNav component (TDD)

**Files:**
- Create: `src/components/TopNav.tsx`, `src/components/TopNav.module.css`, `src/components/TopNav.test.tsx`

- [ ] **Step 1: Write the failing test** `src/components/TopNav.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../test/renderWithProviders'
import { TopNav } from './TopNav'

describe('TopNav', () => {
  it('renders the three primary nav links', () => {
    renderWithProviders(<TopNav />)
    expect(screen.getByRole('link', { name: 'Learn' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'My learning' })).toHaveAttribute('href', '/my')
    expect(screen.getByRole('link', { name: 'Community' })).toHaveAttribute('href', '/community')
  })

  it('marks the active section based on the route', () => {
    renderWithProviders(<TopNav />, { route: '/community' })
    expect(screen.getByRole('link', { name: 'Community' })).toHaveAttribute('aria-current', 'page')
  })

  it('renders the brand', () => {
    renderWithProviders(<TopNav />)
    expect(screen.getByText('AI')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify it FAILS.** `npx vitest run src/components/TopNav.test.tsx`

- [ ] **Step 3: Create `src/components/TopNav.module.css`:**

```css
.bar {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  height: 60px;
  padding: 0 var(--space-5);
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border);
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--serif);
  font-weight: var(--weight-bold);
  color: var(--text-strong);
  text-decoration: none;
}
.brandMark {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: var(--bg-deep);
  font-size: var(--text-sm);
}
.primary { display: flex; gap: var(--space-2); }
.link {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-family: var(--sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-muted);
  text-decoration: none;
}
.link:hover { color: var(--text-strong); }
.link[aria-current='page'] { color: var(--accent); background: var(--accent-dim); }
.link:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.account { margin-left: auto; display: flex; align-items: center; gap: var(--space-3); }
```

- [ ] **Step 4: Create `src/components/TopNav.tsx`:**

```tsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useLocale } from '../context/LocaleProvider'
import { useAuth } from '../context/AuthProvider'
import { isAdminEmail } from '../services/userProfile'
import { AuthButton } from './AuthButton'
import { Dropdown } from './ui'
import styles from './TopNav.module.css'

const primary = [
  { to: '/', key: 'learn' as const },
  { to: '/my', key: 'myLearning' as const },
  { to: '/community', key: 'community' as const },
]

export function TopNav() {
  const { t } = useLocale()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = isAdminEmail(user?.email ?? undefined)

  const menuItems = [
    ...(isAdmin ? [{ label: t.nav.admin, onSelect: () => navigate('/admin') }] : []),
    { label: t.nav.embed, onSelect: () => navigate('/embed') },
    { label: t.nav.privacy, onSelect: () => navigate('/privacy') },
  ]

  return (
    <nav className={styles.bar} aria-label="Primary">
      <NavLink to="/" className={styles.brand} end>
        <span className={styles.brandMark}>AI</span>
        Learning Path
      </NavLink>
      <div className={styles.primary}>
        {primary.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={styles.link}
          >
            {t.nav[item.key]}
          </NavLink>
        ))}
      </div>
      <div className={styles.account}>
        <AuthButton />
        <Dropdown trigger={t.nav.account} items={menuItems} />
      </div>
    </nav>
  )
}
```

NOTE on the active-link assertion: React Router's `NavLink` sets `aria-current="page"` on the active link automatically, and the brand link uses `end` so it only matches `/` exactly — on `/community` only the Community link is current. The `end={item.to === '/'}` ensures the Learn link isn't marked active on `/community`.

- [ ] **Step 5: Run — verify it PASSES** (3 tests). `npx vitest run src/components/TopNav.test.tsx`

- [ ] **Step 6: Commit**

```bash
git add src/components/TopNav.tsx src/components/TopNav.module.css src/components/TopNav.test.tsx
git commit -m "feat(e4a): add TopNav (Learn / My learning / Community)"
```

---

## Task 3: MyLearningPage stub (TDD)

**Files:**
- Create: `src/components/MyLearningPage.tsx`, `.module.css`, `.test.tsx`

- [ ] **Step 1: Write the failing test** `src/components/MyLearningPage.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../test/renderWithProviders'
import { MyLearningPage } from './MyLearningPage'

describe('MyLearningPage', () => {
  it('renders the My learning heading', () => {
    renderWithProviders(<MyLearningPage />)
    expect(screen.getByRole('heading', { name: 'My learning' })).toBeInTheDocument()
  })

  it('shows a progress section', () => {
    renderWithProviders(<MyLearningPage />)
    expect(screen.getByText('Your progress')).toBeInTheDocument()
  })

  it('links to continue learning', () => {
    renderWithProviders(<MyLearningPage />)
    expect(screen.getByRole('link', { name: /Continue learning/i })).toHaveAttribute('href', '/')
  })
})
```

- [ ] **Step 2: Run — verify it FAILS.** `npx vitest run src/components/MyLearningPage.test.tsx`

- [ ] **Step 3: Create `src/components/MyLearningPage.module.css`:**

```css
.page { max-width: 760px; margin: 0 auto; padding: var(--space-6) var(--space-5); }
.title { font-family: var(--serif); font-size: var(--text-2xl); color: var(--text-strong); margin: 0 0 var(--space-5); }
.label { font-size: var(--text-sm); color: var(--text-muted); margin: 0 0 var(--space-1); }
.value { font-size: var(--text-xl); color: var(--text-strong); font-weight: var(--weight-semibold); }
.row { display: flex; gap: var(--space-4); margin-bottom: var(--space-5); }
.continue {
  display: inline-flex; align-items: center;
  padding: var(--space-2) var(--space-4);
  background: var(--accent); color: var(--bg-deep);
  border-radius: var(--radius-sm); text-decoration: none;
  font-family: var(--sans); font-weight: var(--weight-semibold);
}
.hint { font-size: var(--text-sm); color: var(--text-muted); margin-top: var(--space-4); }
```

- [ ] **Step 4: Create `src/components/MyLearningPage.tsx`:**

```tsx
import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleProvider'
import { useAuth } from '../context/AuthProvider'
import { usePersona } from '../hooks/usePersona'
import { useProgress } from '../hooks/useProgress'
import { PERSONAS } from '../data/personas'
import { Card } from './ui'
import styles from './MyLearningPage.module.css'

export function MyLearningPage() {
  const { t } = useLocale()
  const { user } = useAuth()
  const { personaId } = usePersona()
  const { count } = useProgress()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t.myLearning.title}</h1>
      <div className={styles.row}>
        <Card>
          <p className={styles.label}>{t.myLearning.progress}</p>
          <p className={styles.value}>{count} ✓</p>
        </Card>
        <Card>
          <p className={styles.label}>{t.myLearning.persona}</p>
          <p className={styles.value}>{PERSONAS[personaId].label}</p>
        </Card>
      </div>
      <Link to="/" className={styles.continue}>
        {t.myLearning.continue}
      </Link>
      {!user && <p className={styles.hint}>{t.myLearning.signInHint}</p>}
    </div>
  )
}
```

NOTE: confirm `useProgress()` exposes a `count` value (the AppShell already destructures `count` from `useProgress()`), and `PERSONAS[id].label` exists (Sidebar uses `PERSONAS[personaId]` and `persona.label`). If `count` is not a number directly, use the same shape AppShell uses.

- [ ] **Step 5: Run — verify it PASSES** (3 tests). `npx vitest run src/components/MyLearningPage.test.tsx`

- [ ] **Step 6: Commit**

```bash
git add src/components/MyLearningPage.tsx src/components/MyLearningPage.module.css src/components/MyLearningPage.test.tsx
git commit -m "feat(e4a): add /my stub page"
```

---

## Task 4: CommunityPage stub (TDD)

**Files:**
- Create: `src/components/CommunityPage.tsx`, `.module.css`, `.test.tsx`

- [ ] **Step 1: Write the failing test** `src/components/CommunityPage.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../test/renderWithProviders'
import { CommunityPage } from './CommunityPage'

describe('CommunityPage', () => {
  it('renders the Community heading', () => {
    renderWithProviders(<CommunityPage />)
    expect(screen.getByRole('heading', { name: 'Community' })).toBeInTheDocument()
  })

  it('links to submit, digest, and team', () => {
    renderWithProviders(<CommunityPage />)
    expect(screen.getByRole('link', { name: /Submit a resource/i })).toHaveAttribute('href', '/submit')
    expect(screen.getByRole('link', { name: /Weekly digest/i })).toHaveAttribute('href', '/digest')
    expect(screen.getByRole('link', { name: /Team/i })).toHaveAttribute('href', '/team')
  })
})
```

- [ ] **Step 2: Run — verify it FAILS.** `npx vitest run src/components/CommunityPage.test.tsx`

- [ ] **Step 3: Create `src/components/CommunityPage.module.css`:**

```css
.page { max-width: 860px; margin: 0 auto; padding: var(--space-6) var(--space-5); }
.title { font-family: var(--serif); font-size: var(--text-2xl); color: var(--text-strong); margin: 0 0 var(--space-2); }
.intro { font-size: var(--text-base); color: var(--text-muted); margin: 0 0 var(--space-6); }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4); }
.card { text-decoration: none; display: block; }
.cardTitle { font-size: var(--text-lg); color: var(--text-strong); font-weight: var(--weight-semibold); margin: 0 0 var(--space-1); }
.cardSub { font-size: var(--text-sm); color: var(--text-muted); margin: 0; }
```

- [ ] **Step 4: Create `src/components/CommunityPage.tsx`:**

```tsx
import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleProvider'
import { Card } from './ui'
import styles from './CommunityPage.module.css'

export function CommunityPage() {
  const { t } = useLocale()
  const links = [
    { to: '/submit', title: t.communityHub.submit, sub: t.communityHub.submitSub },
    { to: '/digest', title: t.communityHub.digest, sub: t.communityHub.digestSub },
    { to: '/team', title: t.communityHub.team, sub: t.communityHub.teamSub },
  ]
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t.communityHub.title}</h1>
      <p className={styles.intro}>{t.communityHub.intro}</p>
      <div className={styles.grid}>
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={styles.card}>
            <Card interactive>
              <p className={styles.cardTitle}>{l.title}</p>
              <p className={styles.cardSub}>{l.sub}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run — verify it PASSES** (2 tests). `npx vitest run src/components/CommunityPage.test.tsx`

- [ ] **Step 6: Commit**

```bash
git add src/components/CommunityPage.tsx src/components/CommunityPage.module.css src/components/CommunityPage.test.tsx
git commit -m "feat(e4a): add /community stub hub"
```

---

## Task 5: Extract LearnSidebar from Sidebar

**Files:**
- Create: `src/components/LearnSidebar.tsx`, `src/components/LearnSidebar.module.css`
- Reference (then delete in Task 6): `src/components/Sidebar.tsx`

- [ ] **Step 1: Create `src/components/LearnSidebar.tsx`** by adapting the current `Sidebar.tsx`. Keep: Overview, Search, News Radar links + the Phases `<ol>`. REMOVE the Community section (Submit/Digest/Team/Embed/Admin — now in TopNav/CommunityPage) and the brand block (now in TopNav). Keep the footer (curriculum version, locale switch, Privacy) OR move it to a slim global footer — for E4a keep it at the bottom of LearnSidebar to avoid losing the locale switch. Use the SAME props interface as Sidebar (`personaId`, `completedCount`, `totalCount`). Concretely, copy `Sidebar.tsx` to `LearnSidebar.tsx`, rename the function to `LearnSidebar`, delete the `sidebar-brand` block and the entire `<div className="nav-divider">Community</div> ... /admin NavLink` block, and keep everything else. Point the root `<nav className="sidebar">` to use a new scoped class if desired, but reusing the existing `.sidebar` global CSS class is acceptable for E4a (visual refinement is E4b).

- [ ] **Step 2: Create `src/components/LearnSidebar.module.css`** with only any NEW rules you need (may be empty if reusing global `.sidebar` styles). If empty, skip creating the file and don't import it.

- [ ] **Step 3: Typecheck.** Run: `npx tsc -b`
Expected: exits 0 (LearnSidebar compiles; Sidebar still present and unused is fine for now).

- [ ] **Step 4: Commit**

```bash
git add src/components/LearnSidebar.tsx src/components/LearnSidebar.module.css
git commit -m "feat(e4a): extract LearnSidebar (phases + discovery) from Sidebar"
```

---

## Task 6: Integrate into AppShell + routes (the wiring)

**Files:**
- Modify: `src/App.tsx`
- Delete: `src/components/Sidebar.tsx`

- [ ] **Step 1: Update imports in `src/App.tsx`.** Remove `import { Sidebar } ...`; add:

```tsx
import { TopNav } from './components/TopNav'
import { LearnSidebar } from './components/LearnSidebar'
import { MyLearningPage } from './components/MyLearningPage'
import { CommunityPage } from './components/CommunityPage'
```

- [ ] **Step 2: Define which routes are "Learn".** Inside `AppShell`, near the existing `isPhaseView`, add:

```tsx
const learnPaths = ['/', '/search', '/news-radar']
const isLearnRoute =
  learnPaths.includes(location.pathname) || location.pathname.startsWith('/phase/')
```

- [ ] **Step 3: Restructure the `AppShell` return.** Replace the current top-level structure so `TopNav` is first, then a row holding the conditional `LearnSidebar` and `<main>`. Remove the `<AuthButton />` usage inside the main `.top-bar` (it now lives in `TopNav`); leave `ProgressBar` and `ProgressActions` where they are. Concretely, the return becomes:

```tsx
return (
  <div className="app-shell">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <TopNav />
    <div className="app-body">
      {isLearnRoute && (
        <LearnSidebar
          personaId={personaId}
          completedCount={phaseCompleted}
          totalCount={phaseTotal}
        />
      )}
      <main id="main-content" className="main-content" tabIndex={-1}>
        <div className="top-bar">
          <ProgressBar completed={progressDone} total={progressTotal} label={progressLabel} />
          <div className="top-bar-actions">
            <div className="top-bar-tools">
              {isEssentialTrack(personaId) && isPhaseView && (
                <label className="toggle-skipped">
                  <input
                    type="checkbox"
                    checked={showSkipped}
                    onChange={(e) => setShowSkipped(e.target.checked)}
                  />
                  Show skipped
                </label>
              )}
              <ProgressActions count={count} onExport={exportProgress} onImport={importProgress} onReset={reset} />
            </div>
          </div>
        </div>
        <PersonaBanner
          personaId={personaId}
          onChangePersona={(id) => {
            setPersona(id)
            if (id === 'swe-manager' && isPhaseView) {
              navigate('/phase/llm-fundamentals')
            }
          }}
          essentialCount={essentialIds.length}
          essentialDone={essentialDone}
        />
        <Outlet
          context={{ personaId, isComplete, toggle, showSkipped, getPhaseStat, communityStatsLoading }}
        />
      </main>
    </div>
  </div>
)
```

Remove the now-unused `AuthButton` import from `App.tsx` if it is no longer referenced anywhere in the file.

- [ ] **Step 4: Add the new routes.** In the `<Routes>` block, add alongside the existing child routes:

```tsx
<Route path="my" element={<MyLearningPage />} />
<Route path="community" element={<CommunityPage />} />
```

- [ ] **Step 5: Add minimal layout CSS.** In `src/index.css`, add (so the body row lays out beside the sidebar):

```css
.app-body { display: flex; flex: 1; min-height: 0; }
```
The existing `.app-shell` should be `display: flex; flex-direction: column;` so TopNav stacks above `.app-body`. If `.app-shell` currently sets `flex-direction: row`, change it to `column` and verify the sidebar+main still sit side by side inside `.app-body` (they will, because `.app-body` is the new row).

- [ ] **Step 6: Delete the old Sidebar.** Run: `git rm src/components/Sidebar.tsx`

- [ ] **Step 7: Typecheck + full test suite.** Run: `npx tsc -b && npx vitest run`
Expected: tsc exits 0; all tests pass (design-system + new nav/page tests + existing logic tests).

- [ ] **Step 8: Manual smoke check.** Run `npm run dev`, then verify in the browser (stop after): top bar shows Learn/My learning/Community; `/my` and `/community` render; the Learn sidebar appears on `/` and `/phase/...` but NOT on `/my` or `/community`; the account Dropdown shows Privacy/Embed (+ Admin if your email is in `VITE_ADMIN_EMAILS`). If anything is broken, report it before committing.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(e4a): mount TopNav + LearnSidebar, wire /my and /community routes"
```

---

## Task 7: Verify, lint, build, docs

- [ ] **Step 1: Full verification.** Run: `npx vitest run && npm run lint && npx tsc -b && npx vite build`
Expected: tests pass; lint clean (pre-existing AuthProvider/LocaleProvider fast-refresh warnings are acceptable); tsc 0; vite build 0.

- [ ] **Step 2: Update `docs/NORTHSTAR-VISION.md`.** Mark E4a done in the Phase E task table (change its `☐` to `☑`) and note `/my` + `/community` are minimal stubs pending E2/E3.

- [ ] **Step 3: Commit**

```bash
git add docs/NORTHSTAR-VISION.md
git commit -m "docs(e4a): mark E4a navigation complete"
```

---

## Self-Review Notes

- **Spec coverage:** Primary nav Learn/My learning/Community (Task 2); admin out of primary nav into account Dropdown (Task 2); in-section Learn sidebar shown only on Learn routes (Tasks 5–6); minimal `/my` + `/community` hubs (Tasks 3–4); existing routes (`/submit`, `/digest`, `/team`, `/embed`, `/admin`, `/privacy`) remain reachable (Community hub + account menu). Mobile bottom-tabs are explicitly E4c.
- **Type consistency:** `LearnSidebar` reuses `Sidebar`'s exact props (`personaId`, `completedCount`, `totalCount`). New pages use existing hooks (`usePersona`, `useProgress`, `useLocale`, `useAuth`) and the `Card`/`Dropdown` primitives by their established prop shapes.
- **Open verification (flagged for implementer):** Task 3 assumes `useProgress()` returns a numeric `count` and `PERSONAS[id].label` exists — both are used today in `App.tsx`/`Sidebar.tsx`, but the implementer must confirm and match the real shape rather than guess.
- **Risk:** the `.app-shell` flex-direction change (Task 6 Step 5) is the one layout-regression risk — the manual smoke check (Task 6 Step 8) covers it; deeper layout polish is E4b.
```