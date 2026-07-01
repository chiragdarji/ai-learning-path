# E2 — /my Profile Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the `/my` stub into a decluttered "My learning" launchpad plus a separate `/my/account` settings page (with an honest full data-delete), add a global site footer, and move identity/sign-out into the top-nav account menu.

**Architecture:** Two pages — `/my` (learning: header, Continue, per-phase, track) and `/my/account` (preferences + danger zone) — composed from small components under `src/components/profile/`. Pure progress logic goes in `src/lib/progressSummary.ts`; a client-side `deleteAccountData` service (RLS-permitted deletes + one new migration) powers delete. A global `SiteFooter` replaces the Learn-sidebar footer. Everything reuses the design-system primitives.

**Tech Stack:** React 19, React Router v6, TypeScript, design-system primitives (`Card`, `Button`, `Input`, `Modal`), Supabase, Vitest + Testing Library + user-event.

**Spec:** `docs/superpowers/specs/2026-07-01-e2-profile-hub-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/lib/progressSummary.ts` (+`.test.ts`) | **Create.** Pure `phaseProgress()` + `nextResource()`. |
| `src/services/accountData.ts` (+`.test.ts`) | **Create.** `deleteAccountData(userId)`. |
| `supabase/migrations/004_profile_delete_policy.sql` | **Create.** `user_profiles` delete policy. |
| `src/components/SiteFooter.tsx` (+`.module.css`,`.test.tsx`) | **Create.** Global footer. |
| `src/components/profile/ProfileHeader.tsx` (+`.test.tsx`) | **Create.** `/my` header + guest strip. |
| `src/components/profile/ProgressOverview.tsx` (+`.module.css`,`.test.tsx`) | **Create.** Continue + per-phase rows. |
| `src/components/profile/TrackSelector.tsx` (+`.test.tsx`) | **Create.** Persona change. |
| `src/components/profile/ProfilePage.tsx` (+`.module.css`) | **Create.** `/my` composition (replaces `MyLearningPage`). |
| `src/components/profile/AccountPreferences.tsx` (+`.test.tsx`) | **Create.** Digest + export/import. |
| `src/components/profile/DangerZone.tsx` (+`.module.css`,`.test.tsx`) | **Create.** Reset + delete with confirm modals. |
| `src/components/profile/AccountSettingsPage.tsx` (+`.module.css`) | **Create.** `/my/account` composition. |
| `src/components/TopNav.tsx` | **Modify.** Account menu: email + Account settings + Sign out. |
| `src/components/LearnSidebar.tsx` | **Modify.** Remove the `sidebar-footer` block. |
| `src/App.tsx` | **Modify.** Routes `/my`, `/my/account`; render `<SiteFooter/>`; drop `MyLearningPage`. |
| `src/components/MyLearningPage.tsx` (+`.module.css`,`.test.tsx`) | **Delete** after `ProfilePage` replaces it. |

---

## Task 1: progressSummary pure helpers (TDD)

**Files:**
- Create: `src/lib/progressSummary.ts`, `src/lib/progressSummary.test.ts`

- [ ] **Step 1: Write the failing test** `src/lib/progressSummary.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { phaseProgress, nextResource, overallProgress } from './progressSummary'

const done = new Set(['r1'])
const isComplete = (id: string) => done.has(id)

describe('phaseProgress', () => {
  it('returns per-phase done/total/pct for the full track', () => {
    const rows = phaseProgress('full', isComplete)
    expect(rows.length).toBeGreaterThan(0)
    const row = rows[0]
    expect(row).toHaveProperty('phaseId')
    expect(row).toHaveProperty('pct')
    expect(row.total).toBeGreaterThan(0)
    expect(row.done).toBeLessThanOrEqual(row.total)
  })
})

describe('overallProgress', () => {
  it('aggregates done and total across the track', () => {
    const o = overallProgress('full', isComplete)
    expect(o.total).toBeGreaterThan(0)
    expect(o.pct).toBe(Math.round((o.done / o.total) * 100))
  })
})

describe('nextResource', () => {
  it('returns the first incomplete resource in track order', () => {
    const next = nextResource('full', () => false)
    expect(next).not.toBeNull()
    expect(next).toHaveProperty('id')
    expect(next).toHaveProperty('url')
    expect(next).toHaveProperty('phaseId')
  })

  it('returns null when everything is complete', () => {
    const next = nextResource('full', () => true)
    expect(next).toBeNull()
  })
})
```

- [ ] **Step 2: Run — verify it FAILS.** `npx vitest run src/lib/progressSummary.test.ts`

- [ ] **Step 3: Create `src/lib/progressSummary.ts`:**

```ts
import { LEARNING_PATH } from '../data/learningPath'
import type { Phase } from '../types'
import type { PersonaId } from '../data/personas'
import { PERSONAS, getResourcePriority, isEssentialTrack } from '../data/personas'

export interface PhaseProgressRow {
  phaseId: string
  number: number
  title: string
  done: number
  total: number
  pct: number
}

export interface NextResource {
  id: string
  title: string
  url: string
  phaseId: string
}

function orderedPhases(personaId: PersonaId): Phase[] {
  const persona = PERSONAS[personaId]
  const ordered = persona.phaseOrder
    .map((id) => LEARNING_PATH.find((p) => p.id === id))
    .filter(Boolean) as Phase[]
  return isEssentialTrack(personaId) ? ordered : LEARNING_PATH
}

function trackResources(phase: Phase, personaId: PersonaId) {
  return phase.steps
    .flatMap((s) => s.resources)
    .filter((r) => getResourcePriority(personaId, r.id) !== 'skip')
}

export function phaseProgress(
  personaId: PersonaId,
  isComplete: (id: string) => boolean,
): PhaseProgressRow[] {
  return orderedPhases(personaId).map((phase) => {
    const resources = trackResources(phase, personaId)
    const done = resources.filter((r) => isComplete(r.id)).length
    const total = resources.length
    return {
      phaseId: phase.id,
      number: phase.number,
      title: phase.title,
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
    }
  })
}

export function overallProgress(
  personaId: PersonaId,
  isComplete: (id: string) => boolean,
): { done: number; total: number; pct: number } {
  const rows = phaseProgress(personaId, isComplete)
  const done = rows.reduce((sum, r) => sum + r.done, 0)
  const total = rows.reduce((sum, r) => sum + r.total, 0)
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
}

export function nextResource(
  personaId: PersonaId,
  isComplete: (id: string) => boolean,
): NextResource | null {
  for (const phase of orderedPhases(personaId)) {
    for (const resource of trackResources(phase, personaId)) {
      if (!isComplete(resource.id)) {
        return {
          id: resource.id,
          title: resource.title,
          url: resource.url,
          phaseId: phase.id,
        }
      }
    }
  }
  return null
}
```

- [ ] **Step 4: Run — verify it PASSES** (4 tests). `npx vitest run src/lib/progressSummary.test.ts`

- [ ] **Step 5: Commit**

```bash
git add src/lib/progressSummary.ts src/lib/progressSummary.test.ts
git commit -m "feat(e2): progressSummary helpers (phase/overall/next)"
```

---

## Task 2: Delete policy migration + accountData service (TDD)

**Files:**
- Create: `supabase/migrations/004_profile_delete_policy.sql`, `src/services/accountData.ts`, `src/services/accountData.test.ts`

- [ ] **Step 1: Create the migration** `supabase/migrations/004_profile_delete_policy.sql`:

```sql
-- E2: allow a signed-in user to delete their own profile row (client-side
-- account-data delete). user_progress already has a delete policy; notes and
-- digest use FOR ALL "manage own" policies that include delete.
drop policy if exists "Users delete own profile" on public.user_profiles;
create policy "Users delete own profile"
  on public.user_profiles for delete
  using (auth.uid() = user_id);
```

- [ ] **Step 2: Write the failing test** `src/services/accountData.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const deleteChain = () => {
  const eq = vi.fn().mockResolvedValue({ error: null })
  return { delete: vi.fn(() => ({ eq })), _eq: eq }
}

const tables: Record<string, ReturnType<typeof deleteChain>> = {}
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn((name: string) => {
      tables[name] = tables[name] ?? deleteChain()
      return tables[name]
    }),
  },
}))

import { deleteAccountData } from './accountData'

beforeEach(() => {
  for (const k of Object.keys(tables)) delete tables[k]
  localStorage.setItem('ai-learning-path-progress', '["r1"]')
  localStorage.setItem('ai-learning-path-persona', 'full')
})

describe('deleteAccountData', () => {
  it('deletes rows from every user-owned table and clears local storage', async () => {
    const result = await deleteAccountData('user-1')
    expect(result.error).toBeUndefined()
    for (const table of [
      'user_progress',
      'user_resource_notes',
      'digest_subscriptions',
      'user_profiles',
    ]) {
      expect(tables[table].delete).toHaveBeenCalled()
    }
    expect(localStorage.getItem('ai-learning-path-progress')).toBeNull()
    expect(localStorage.getItem('ai-learning-path-persona')).toBeNull()
  })

  it('stops and reports when a table delete errors, leaving local storage intact', async () => {
    const failing = deleteChain()
    failing._eq.mockResolvedValueOnce({ error: { message: 'nope' } })
    tables['user_progress'] = failing
    const result = await deleteAccountData('user-1')
    expect(result.error).toBe('nope')
    expect(localStorage.getItem('ai-learning-path-progress')).not.toBeNull()
  })
})
```

- [ ] **Step 3: Run — verify it FAILS.** `npx vitest run src/services/accountData.test.ts`

- [ ] **Step 4: Create `src/services/accountData.ts`:**

```ts
import { supabase } from '../lib/supabase'

const USER_TABLES = [
  'user_progress',
  'user_resource_notes',
  'digest_subscriptions',
  'user_profiles',
] as const

const LOCAL_KEYS = ['ai-learning-path-progress', 'ai-learning-path-persona']

export async function deleteAccountData(
  userId: string,
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Sync not configured.' }

  for (const table of USER_TABLES) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId)
    if (error) return { error: error.message }
  }

  for (const key of LOCAL_KEYS) localStorage.removeItem(key)
  return {}
}
```

- [ ] **Step 5: Run — verify it PASSES** (2 tests). `npx vitest run src/services/accountData.test.ts`

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/004_profile_delete_policy.sql src/services/accountData.ts src/services/accountData.test.ts
git commit -m "feat(e2): accountData delete service + user_profiles delete policy"
```

---

## Task 3: SiteFooter component (TDD)

**Files:**
- Create: `src/components/SiteFooter.tsx`, `src/components/SiteFooter.module.css`, `src/components/SiteFooter.test.tsx`

- [ ] **Step 1: Write the failing test** `src/components/SiteFooter.test.tsx`:

```tsx
import { screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../test/renderWithProviders'
import { SiteFooter } from './SiteFooter'

describe('SiteFooter', () => {
  it('links to privacy and the curriculum API', () => {
    renderWithProviders(<SiteFooter />)
    expect(screen.getByRole('link', { name: /Privacy/i })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: /API/i })).toHaveAttribute('href', '/api/v1/curriculum.json')
  })

  it('shows the curriculum version', () => {
    renderWithProviders(<SiteFooter />)
    expect(screen.getByText(/2026-q2/)).toBeInTheDocument()
  })

  it('switches language via the select', () => {
    renderWithProviders(<SiteFooter />)
    const select = screen.getByLabelText(/Language/i) as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'es' } })
    expect(select.value).toBe('es')
  })
})
```

- [ ] **Step 2: Run — verify it FAILS.** `npx vitest run src/components/SiteFooter.test.tsx`

- [ ] **Step 3: Create `src/components/SiteFooter.module.css`:**

```css
.footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border);
  font-family: var(--sans);
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.footer a {
  color: var(--text);
  text-decoration: none;
}
.footer a:hover {
  color: var(--text-strong);
}
.lang {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.lang select {
  font-size: var(--text-xs);
  color: var(--text);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 2px 6px;
}
```

- [ ] **Step 4: Create `src/components/SiteFooter.tsx`:**

```tsx
import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleProvider'
import { CURRICULUM_META } from '../data/meta'
import styles from './SiteFooter.module.css'

export function SiteFooter() {
  const { t, locale, setLocale } = useLocale()
  return (
    <footer className={styles.footer}>
      <span>
        {t.community.curriculumVersion}: {CURRICULUM_META.version}
      </span>
      <Link to="/privacy">{t.nav.privacy}</Link>
      <a href="/api/v1/curriculum.json">Curriculum API</a>
      <a href="/llms.txt">llms.txt</a>
      <label className={styles.lang}>
        <span className="sr-only">Language</span>
        <select
          aria-label="Language"
          value={locale}
          onChange={(e) => setLocale(e.target.value === 'es' ? 'es' : 'en')}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </label>
    </footer>
  )
}
```

- [ ] **Step 5: Run — verify it PASSES** (3 tests). `npx vitest run src/components/SiteFooter.test.tsx`

- [ ] **Step 6: Commit**

```bash
git add src/components/SiteFooter.tsx src/components/SiteFooter.module.css src/components/SiteFooter.test.tsx
git commit -m "feat(e2): global SiteFooter (version, privacy, API, language)"
```

---

## Task 4: Wire SiteFooter into AppShell + remove LearnSidebar footer

**Files:**
- Modify: `src/App.tsx`, `src/components/LearnSidebar.tsx`

- [ ] **Step 1: Render the footer in `App.tsx`.** Add `import { SiteFooter } from './components/SiteFooter'`. In `AppShell`'s return, add `<SiteFooter />` immediately after the closing `</div>` of `.app-body` (a direct child of `.app-shell`, before `<MobileTabBar />`):

```tsx
      </div>
      <SiteFooter />
      <MobileTabBar />
    </div>
```

- [ ] **Step 2: Remove the footer block from `LearnSidebar.tsx`.** Delete the entire `<div className="sidebar-footer"> … </div>` block (curriculum version, `locale-switch`, and the privacy `NavLink`). Remove the now-unused `locale`/`setLocale` from the `useLocale()` destructure (keep `t`), and remove the `CURRICULUM_META` import if no longer referenced.

- [ ] **Step 3: Typecheck + full suite.** `npx tsc -b && npx vitest run`
Expected: tsc 0; all pass (LearnSidebar test, if any, still fine; footer now global).

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/LearnSidebar.tsx
git commit -m "feat(e2): mount global footer; drop LearnSidebar footer block"
```

---

## Task 5: TopNav account menu (email + Account settings + Sign out)

**Files:**
- Modify: `src/components/TopNav.tsx`, `src/components/TopNav.test.tsx`

- [ ] **Step 1: Update the test** `src/components/TopNav.test.tsx` — add a signed-out assertion that Sign in shows, and keep the primary-nav tests. Replace the file body's `describe` with:

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

  it('shows the sign-in control for signed-out users', () => {
    renderWithProviders(<TopNav />)
    expect(screen.getByRole('button', { name: /Sign in to sync/i })).toBeInTheDocument()
  })
})
```

(Signed-in menu contents are covered by a browser smoke check in Task 13, since the test env has no Supabase session.)

- [ ] **Step 2: Run — verify the new test FAILS or the file still passes.** `npx vitest run src/components/TopNav.test.tsx`
Expected: the three original tests pass; the "sign-in control" test passes only after Step 3 if the current render already shows AuthButton (it does — AuthButton renders nothing when `!configured`). Because the test env is unconfigured, `AuthButton` returns `null`. So this test will FAIL now (no button). That failure drives Step 3, where we render a real fallback sign-in button independent of `configured`.

- [ ] **Step 3: Update `src/components/TopNav.tsx`** so the account area is a single adaptive control — guests get a sign-in button, signed-in users get the account `Dropdown` with Account settings + Sign out:

```tsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useLocale } from '../context/LocaleProvider'
import { useAuth } from '../context/AuthProvider'
import { isAdminEmail } from '../services/userProfile'
import { Dropdown } from './ui'
import styles from './TopNav.module.css'

const primary = [
  { to: '/', key: 'learn' as const },
  { to: '/my', key: 'myLearning' as const },
  { to: '/community', key: 'community' as const },
]

function shortEmail(email: string | undefined): string {
  if (!email) return 'Account'
  const [name, domain] = email.split('@')
  if (!domain) return email
  return `${name}@${domain.split('.')[0]}`
}

export function TopNav() {
  const { t } = useLocale()
  const { user, openSignIn, signOut } = useAuth()
  const navigate = useNavigate()
  const isAdmin = isAdminEmail(user?.email ?? undefined)

  const menuItems = [
    { label: t.nav.myLearning, onSelect: () => navigate('/my') },
    { label: 'Account settings', onSelect: () => navigate('/my/account') },
    ...(isAdmin ? [{ label: t.nav.admin, onSelect: () => navigate('/admin') }] : []),
    { label: t.nav.embed, onSelect: () => navigate('/embed') },
    { label: t.auth.signOut, onSelect: () => void signOut() },
  ]

  return (
    <nav className={styles.bar} aria-label="Primary">
      <NavLink to="/" className={styles.brand} end>
        <span className={styles.brandMark}>AI</span>
        Learning Path
      </NavLink>
      <div className={styles.primary}>
        {primary.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={styles.link}>
            {t.nav[item.key]}
          </NavLink>
        ))}
      </div>
      <div className={styles.account}>
        {user ? (
          <Dropdown trigger={shortEmail(user.email ?? undefined)} items={menuItems} />
        ) : (
          <button
            type="button"
            className="action-btn account-signin"
            onClick={openSignIn}
            aria-haspopup="dialog"
          >
            {t.auth.signIn}
          </button>
        )}
      </div>
    </nav>
  )
}
```

Note: `t.auth.signIn` is "Sign in to sync" and `t.auth.signOut` is "Sign out" (existing i18n keys). The old `<AuthButton />` usage is removed from TopNav; `AuthButton.tsx` is now unused — leave the file (harmless) or delete it in Task 13 after confirming no other references.

- [ ] **Step 4: Run — verify it PASSES** (4 tests). `npx vitest run src/components/TopNav.test.tsx`

- [ ] **Step 5: Commit**

```bash
git add src/components/TopNav.tsx src/components/TopNav.test.tsx
git commit -m "feat(e2): TopNav account menu with settings + sign out"
```

---

## Task 6: ProfileHeader (TDD)

**Files:**
- Create: `src/components/profile/ProfileHeader.tsx`, `src/components/profile/ProfileHeader.test.tsx`

- [ ] **Step 1: Write the failing test** `src/components/profile/ProfileHeader.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { ProfileHeader } from './ProfileHeader'
import { useAuth } from '../../context/AuthProvider'

function Probe() {
  const { signInOpen } = useAuth()
  return <span data-testid="open">{String(signInOpen)}</span>
}

describe('ProfileHeader', () => {
  it('shows the learning title and a progress summary', () => {
    renderWithProviders(<ProfileHeader done={40} total={65} pct={62} />)
    expect(screen.getByRole('heading', { name: 'Your learning' })).toBeInTheDocument()
    expect(screen.getByText(/40 of 65/)).toBeInTheDocument()
  })

  it('offers a sign-in prompt for guests that opens the modal', async () => {
    renderWithProviders(
      <>
        <ProfileHeader done={0} total={65} pct={0} />
        <Probe />
      </>,
    )
    await userEvent.click(screen.getByRole('button', { name: /Sign in to sync/i }))
    expect(screen.getByTestId('open')).toHaveTextContent('true')
  })
})
```

- [ ] **Step 2: Run — verify it FAILS.** `npx vitest run src/components/profile/ProfileHeader.test.tsx`

- [ ] **Step 3: Create `src/components/profile/ProfileHeader.tsx`:**

```tsx
import { useAuth } from '../../context/AuthProvider'
import { PageHeader } from '../PageHeader'
import { Button } from '../ui'

interface ProfileHeaderProps {
  done: number
  total: number
  pct: number
}

export function ProfileHeader({ done, total, pct }: ProfileHeaderProps) {
  const { user, openSignIn } = useAuth()
  return (
    <PageHeader eyebrow="My learning" title="Your learning" subtitle={`${done} of ${total} done · ${pct}%`}>
      {!user && (
        <div style={{ marginTop: 'var(--space-3)' }}>
          <Button onClick={openSignIn}>Sign in to sync</Button>
        </div>
      )}
    </PageHeader>
  )
}
```

- [ ] **Step 4: Run — verify it PASSES** (2 tests). `npx vitest run src/components/profile/ProfileHeader.test.tsx`

- [ ] **Step 5: Commit**

```bash
git add src/components/profile/ProfileHeader.tsx src/components/profile/ProfileHeader.test.tsx
git commit -m "feat(e2): ProfileHeader with guest sign-in prompt"
```

---

## Task 7: ProgressOverview (TDD)

**Files:**
- Create: `src/components/profile/ProgressOverview.tsx`, `src/components/profile/ProgressOverview.module.css`, `src/components/profile/ProgressOverview.test.tsx`

- [ ] **Step 1: Write the failing test** `src/components/profile/ProgressOverview.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { ProgressOverview } from './ProgressOverview'

const rows = [
  { phaseId: 'foundations', number: 1, title: 'Foundations', done: 3, total: 3, pct: 100 },
  { phaseId: 'llm-fundamentals', number: 2, title: 'LLM Fundamentals', done: 2, total: 5, pct: 40 },
]
const next = { id: 'r9', title: 'RAG evaluation', url: 'https://x', phaseId: 'llm-fundamentals' }

describe('ProgressOverview', () => {
  it('renders a Continue link to the next resource phase and one row per phase', () => {
    render(
      <MemoryRouter>
        <ProgressOverview rows={rows} next={next} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /Continue/i })).toHaveAttribute('href', '/phase/llm-fundamentals')
    expect(screen.getByText('RAG evaluation')).toBeInTheDocument()
    expect(screen.getByText('Foundations')).toBeInTheDocument()
    expect(screen.getByText('LLM Fundamentals')).toBeInTheDocument()
  })

  it('shows a done state when there is no next resource', () => {
    render(
      <MemoryRouter>
        <ProgressOverview rows={rows} next={null} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/complete/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify it FAILS.** `npx vitest run src/components/profile/ProgressOverview.test.tsx`

- [ ] **Step 3: Create `src/components/profile/ProgressOverview.module.css`:**

```css
.continue {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--accent-dim);
  border-radius: var(--radius);
  text-decoration: none;
  margin-bottom: var(--space-4);
}
.continueLabel { font-size: var(--text-xs); color: var(--accent); margin: 0; }
.continueTitle { font-size: var(--text-base); font-weight: var(--weight-semibold); color: var(--accent); margin: 2px 0 0; }
.done { padding: var(--space-4); color: var(--green); font-size: var(--text-sm); }
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--border-soft);
  font-size: var(--text-sm);
}
.row:last-child { border-bottom: none; }
.rowTitle { color: var(--text); }
.rowPct { color: var(--text-muted); font-size: var(--text-xs); }
```

- [ ] **Step 4: Create `src/components/profile/ProgressOverview.tsx`:**

```tsx
import { Link } from 'react-router-dom'
import type { NextResource, PhaseProgressRow } from '../../lib/progressSummary'
import { Card } from '../ui'
import styles from './ProgressOverview.module.css'

interface ProgressOverviewProps {
  rows: PhaseProgressRow[]
  next: NextResource | null
}

export function ProgressOverview({ rows, next }: ProgressOverviewProps) {
  return (
    <div>
      {next ? (
        <Link to={`/phase/${next.phaseId}`} className={styles.continue}>
          <span aria-hidden="true">▶</span>
          <span>
            <span className={styles.continueLabel}>Continue where you left off</span>
            <span className={styles.continueTitle}>{next.title}</span>
          </span>
        </Link>
      ) : (
        <p className={styles.done}>You've completed your track. Nice work.</p>
      )}
      <Card>
        {rows.map((row) => (
          <div key={row.phaseId} className={styles.row}>
            <span className={styles.rowTitle}>
              {row.number} · {row.title}
            </span>
            <span className={styles.rowPct}>{row.pct}%</span>
          </div>
        ))}
      </Card>
    </div>
  )
}
```

Note: `continueTitle` / `continueLabel` are spans (not `<p>`) so they nest legally inside the `<Link>`; both are `display:block` via the CSS above — add `display:block;` to `.continueLabel` and `.continueTitle` if they must stack (they render inline otherwise; update the two rules to include `display:block;`).

- [ ] **Step 5: Add `display: block;` to `.continueLabel` and `.continueTitle`** in the module CSS so the label stacks above the title.

- [ ] **Step 6: Run — verify it PASSES** (2 tests). `npx vitest run src/components/profile/ProgressOverview.test.tsx`

- [ ] **Step 7: Commit**

```bash
git add src/components/profile/ProgressOverview.tsx src/components/profile/ProgressOverview.module.css src/components/profile/ProgressOverview.test.tsx
git commit -m "feat(e2): ProgressOverview (Continue + per-phase rows)"
```

---

## Task 8: TrackSelector (TDD)

**Files:**
- Create: `src/components/profile/TrackSelector.tsx`, `src/components/profile/TrackSelector.test.tsx`

- [ ] **Step 1: Write the failing test** `src/components/profile/TrackSelector.test.tsx`:

```tsx
import { screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { TrackSelector } from './TrackSelector'

describe('TrackSelector', () => {
  it('renders a labeled track select with persona options', () => {
    renderWithProviders(<TrackSelector />)
    const select = screen.getByLabelText(/Your track/i) as HTMLSelectElement
    expect(select).toBeInTheDocument()
    expect(select.options.length).toBeGreaterThan(1)
  })

  it('changes the selected track', () => {
    renderWithProviders(<TrackSelector />)
    const select = screen.getByLabelText(/Your track/i) as HTMLSelectElement
    fireEvent.change(select, { target: { value: 'ic-engineer' } })
    expect(select.value).toBe('ic-engineer')
  })
})
```

- [ ] **Step 2: Run — verify it FAILS.** `npx vitest run src/components/profile/TrackSelector.test.tsx`

- [ ] **Step 3: Create `src/components/profile/TrackSelector.tsx`:**

```tsx
import { usePersona } from '../../hooks/usePersona'
import { PERSONAS } from '../../data/personas'
import type { PersonaId } from '../../data/personas'

const ORDER: PersonaId[] = [
  'swe-manager',
  'ic-engineer',
  'product-manager',
  'data-scientist',
  'full',
]

export function TrackSelector() {
  const { personaId, setPersona } = usePersona()
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
        Your track
      </span>
      <select
        aria-label="Your track"
        value={personaId}
        onChange={(e) => setPersona(e.target.value as PersonaId)}
        style={{ padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-deep)', color: 'var(--text-strong)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
      >
        {ORDER.map((id) => (
          <option key={id} value={id}>
            {PERSONAS[id].label}
          </option>
        ))}
      </select>
    </label>
  )
}
```

- [ ] **Step 4: Run — verify it PASSES** (2 tests). `npx vitest run src/components/profile/TrackSelector.test.tsx`

- [ ] **Step 5: Commit**

```bash
git add src/components/profile/TrackSelector.tsx src/components/profile/TrackSelector.test.tsx
git commit -m "feat(e2): TrackSelector"
```

---

## Task 9: ProfilePage `/my` + route (replaces MyLearningPage)

**Files:**
- Create: `src/components/profile/ProfilePage.tsx`, `src/components/profile/ProfilePage.module.css`
- Modify: `src/App.tsx`
- Delete: `src/components/MyLearningPage.tsx`, `src/components/MyLearningPage.module.css`, `src/components/MyLearningPage.test.tsx`

- [ ] **Step 1: Create `src/components/profile/ProfilePage.module.css`:**

```css
.page {
  max-width: 760px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
```

- [ ] **Step 2: Create `src/components/profile/ProfilePage.tsx`:**

```tsx
import { useAuth } from '../../context/AuthProvider'
import { usePersona } from '../../hooks/usePersona'
import { useProgress } from '../../hooks/useProgress'
import { overallProgress, phaseProgress, nextResource } from '../../lib/progressSummary'
import { ProfileHeader } from './ProfileHeader'
import { ProgressOverview } from './ProgressOverview'
import { TrackSelector } from './TrackSelector'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  const { personaId } = usePersona()
  const { isComplete } = useProgress()
  useAuth() // ensures the page re-renders on auth changes

  const overall = overallProgress(personaId, isComplete)
  const rows = phaseProgress(personaId, isComplete)
  const next = nextResource(personaId, isComplete)

  return (
    <div className={styles.page}>
      <ProfileHeader done={overall.done} total={overall.total} pct={overall.pct} />
      <ProgressOverview rows={rows} next={next} />
      <TrackSelector />
    </div>
  )
}
```

- [ ] **Step 3: Update `App.tsx`.** Replace `import { MyLearningPage } from './components/MyLearningPage'` with `import { ProfilePage } from './components/profile/ProfilePage'`. Change the route element `<Route path="my" element={<MyLearningPage />} />` to `<Route path="my" element={<ProfilePage />} />`.

- [ ] **Step 4: Delete the old stub.**

```bash
git rm src/components/MyLearningPage.tsx src/components/MyLearningPage.module.css src/components/MyLearningPage.test.tsx
```

- [ ] **Step 5: Typecheck + full suite.** `npx tsc -b && npx vitest run`
Expected: tsc 0; all pass (the removed MyLearningPage tests are gone; ProfilePage is covered via its child component tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/ProfilePage.tsx src/components/profile/ProfilePage.module.css src/App.tsx
git commit -m "feat(e2): ProfilePage at /my (replaces MyLearningPage stub)"
```

---

## Task 10: AccountPreferences (TDD)

**Files:**
- Create: `src/components/profile/AccountPreferences.tsx`, `src/components/profile/AccountPreferences.test.tsx`

- [ ] **Step 1: Write the failing test** `src/components/profile/AccountPreferences.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { AccountPreferences } from './AccountPreferences'

describe('AccountPreferences', () => {
  it('renders digest subscribe and progress backup controls', () => {
    renderWithProviders(<AccountPreferences />)
    expect(screen.getByRole('button', { name: /Subscribe/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Import/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify it FAILS.** `npx vitest run src/components/profile/AccountPreferences.test.tsx`

- [ ] **Step 3: Create `src/components/profile/AccountPreferences.tsx`:**

```tsx
import { useRef, useState } from 'react'
import { useAuth } from '../../context/AuthProvider'
import { useProgress } from '../../hooks/useProgress'
import { subscribeDigest } from '../../services/communityFeatures'
import { Card, Button, Input } from '../ui'

export function AccountPreferences() {
  const { user } = useAuth()
  const { exportProgress, importProgress } = useProgress()
  const [email, setEmail] = useState(user?.email ?? '')
  const [message, setMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <form
          style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' }}
          onSubmit={(e) => {
            e.preventDefault()
            setMessage(null)
            void subscribeDigest(email, user?.id).then((r) =>
              setMessage(r.error ?? 'Subscribed. Check your inbox weekly.'),
            )
          }}
        >
          <div style={{ flex: 1 }}>
            <Input
              id="digest-email"
              label="Weekly digest"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
          </div>
          <Button type="submit">Subscribe</Button>
        </form>
        {message && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text)' }}>{message}</p>}

        <div>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', margin: '0 0 var(--space-2)' }}>
            Progress backup
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="secondary" onClick={() => exportProgress()}>
              Export
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              Import
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void importProgress(file)
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
```

Note: confirm `exportProgress`/`importProgress` signatures against `useProgress` (`exportProgress()` takes no args; `importProgress(file: File, merge = true)`). Match them exactly.

- [ ] **Step 4: Run — verify it PASSES** (1 test). `npx vitest run src/components/profile/AccountPreferences.test.tsx`

- [ ] **Step 5: Commit**

```bash
git add src/components/profile/AccountPreferences.tsx src/components/profile/AccountPreferences.test.tsx
git commit -m "feat(e2): AccountPreferences (digest + backup)"
```

---

## Task 11: DangerZone (TDD)

**Files:**
- Create: `src/components/profile/DangerZone.tsx`, `src/components/profile/DangerZone.module.css`, `src/components/profile/DangerZone.test.tsx`

- [ ] **Step 1: Write the failing test** `src/components/profile/DangerZone.test.tsx`:

```tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { DangerZone } from './DangerZone'

describe('DangerZone', () => {
  it('opens a confirm dialog before resetting', async () => {
    renderWithProviders(<DangerZone />)
    await userEvent.click(screen.getByRole('button', { name: /Reset progress/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/clears all checkmarks/i)).toBeInTheDocument()
  })

  it('opens a confirm dialog before deleting', async () => {
    renderWithProviders(<DangerZone />)
    await userEvent.click(screen.getByRole('button', { name: /Delete my data/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/sign-in email stays registered/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — verify it FAILS.** `npx vitest run src/components/profile/DangerZone.test.tsx`

- [ ] **Step 3: Create `src/components/profile/DangerZone.module.css`:**

```css
.zone {
  background: var(--danger-dim);
  border: 1px solid var(--danger);
  border-radius: var(--radius);
  padding: var(--space-2) var(--space-4);
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--danger);
}
.row:last-child { border-bottom: none; }
.rowText { color: var(--danger); font-size: var(--text-sm); margin: 0; }
.rowSub { color: var(--danger); opacity: 0.8; font-size: var(--text-xs); margin: 2px 0 0; }
.msg { color: var(--danger); font-size: var(--text-xs); margin: var(--space-2) 0 0; }
```

- [ ] **Step 4: Create `src/components/profile/DangerZone.tsx`:**

```tsx
import { useState } from 'react'
import { useAuth } from '../../context/AuthProvider'
import { useProgress } from '../../hooks/useProgress'
import { deleteAccountData } from '../../services/accountData'
import { Modal, Button } from '../ui'
import styles from './DangerZone.module.css'

export function DangerZone() {
  const { user, signOut } = useAuth()
  const { reset } = useProgress()
  const [confirm, setConfirm] = useState<null | 'reset' | 'delete'>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  return (
    <div className={styles.zone}>
      <div className={styles.row}>
        <div>
          <p className={styles.rowText}>Reset progress</p>
          <p className={styles.rowSub}>Clears all checkmarks on this device and in the cloud.</p>
        </div>
        <Button variant="danger" onClick={() => setConfirm('reset')}>
          Reset progress
        </Button>
      </div>

      {user && (
        <div className={styles.row}>
          <div>
            <p className={styles.rowText}>Delete my data</p>
            <p className={styles.rowSub}>Permanently removes your progress, profile, and notes.</p>
          </div>
          <Button variant="danger" onClick={() => setConfirm('delete')}>
            Delete my data
          </Button>
        </div>
      )}

      {error && <p className={styles.msg}>{error}</p>}

      <Modal
        open={confirm === 'reset'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Reset progress?"
      >
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          This clears all checkmarks on this device and in the cloud. It can't be undone.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            reset()
            setConfirm(null)
          }}
        >
          Yes, reset progress
        </Button>
      </Modal>

      <Modal
        open={confirm === 'delete'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Delete my data?"
      >
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          This permanently deletes your progress, profile, and notes. Your sign-in email stays
          registered. It can't be undone.
        </p>
        <Button
          variant="danger"
          disabled={busy}
          onClick={() => {
            if (!user) return
            setBusy(true)
            setError(null)
            void deleteAccountData(user.id).then((r) => {
              setBusy(false)
              if (r.error) {
                setError(r.error)
                return
              }
              setConfirm(null)
              void signOut()
            })
          }}
        >
          {busy ? 'Deleting…' : 'Yes, delete everything'}
        </Button>
      </Modal>
    </div>
  )
}
```

- [ ] **Step 5: Run — verify it PASSES** (2 tests). `npx vitest run src/components/profile/DangerZone.test.tsx`

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/DangerZone.tsx src/components/profile/DangerZone.module.css src/components/profile/DangerZone.test.tsx
git commit -m "feat(e2): DangerZone with reset + honest delete confirms"
```

---

## Task 12: AccountSettingsPage `/my/account` + route

**Files:**
- Create: `src/components/profile/AccountSettingsPage.tsx`, `src/components/profile/AccountSettingsPage.module.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/components/profile/AccountSettingsPage.module.css`:**

```css
.page {
  max-width: 680px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.dangerLabel {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--danger);
  margin: 0 0 var(--space-2);
}
```

- [ ] **Step 2: Create `src/components/profile/AccountSettingsPage.tsx`:**

```tsx
import { PageHeader } from '../PageHeader'
import { AccountPreferences } from './AccountPreferences'
import { DangerZone } from './DangerZone'
import styles from './AccountSettingsPage.module.css'

export function AccountSettingsPage() {
  return (
    <div className={styles.page}>
      <PageHeader eyebrow="My learning" title="Account settings" />
      <AccountPreferences />
      <div>
        <p className={styles.dangerLabel}>Danger zone</p>
        <DangerZone />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add the route in `App.tsx`.** Add `import { AccountSettingsPage } from './components/profile/AccountSettingsPage'` and, alongside the `my` route, add:

```tsx
<Route path="my/account" element={<AccountSettingsPage />} />
```

- [ ] **Step 4: Typecheck + full suite.** `npx tsc -b && npx vitest run`
Expected: tsc 0; all pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/profile/AccountSettingsPage.tsx src/components/profile/AccountSettingsPage.module.css src/App.tsx
git commit -m "feat(e2): AccountSettingsPage at /my/account"
```

---

## Task 13: Verify, browser smoke, docs

**Files:**
- Modify: `docs/NORTHSTAR-VISION.md`; possibly delete `src/components/AuthButton.tsx`

- [ ] **Step 1: Remove `AuthButton` if unused.** Run: `grep -rn "AuthButton" src/` — if the only hits are its own file, `git rm src/components/AuthButton.tsx`. If anything still imports it, leave it.

- [ ] **Step 2: Full verification.** `npx vitest run && npm run lint && npx tsc -b && npx vite build`
Expected: all tests pass; lint clean; tsc 0; vite build 0.

- [ ] **Step 3: Browser smoke check.** Start the dev server; verify at the real Vite port:
  - `/my` shows the header + summary, a Continue link, per-phase rows, and the track select; as a guest it also shows "Sign in to sync".
  - The top-nav account menu (signed-out) shows "Sign in to sync"; the global footer shows version + privacy + API + language on `/my`, `/community`, and a phase page.
  - `/my/account` shows preferences + a red danger zone; "Delete my data" and "Reset progress" each open a confirm dialog.
  (Use single-eval DOM reads if screenshots are blocked by the preview port mismatch.)

- [ ] **Step 4: Apply the migration (operational note in the PR).** Locally optional; document that production needs `npm run migrate:supabase` before delete works. The UI surfaces the RLS error inline if not applied.

- [ ] **Step 5: Update `docs/NORTHSTAR-VISION.md`.** Mark E2 ☑ in the Phase E task table with a note: "/my learning launchpad + /my/account settings + global footer; account menu holds sign-out; honest data delete (migration 004). N1 badge + E0c/E0e toast still pending."

- [ ] **Step 6: Commit**

```bash
git add docs/NORTHSTAR-VISION.md
git commit -m "docs(e2): mark /my profile hub complete"
```

---

## Self-Review Notes

- **Spec coverage:** IA split `/my` (Tasks 6–9) vs `/my/account` (Tasks 10–12); global footer replacing sidebar footer (Tasks 3–4); account menu with sign-out (Task 5); honest full delete + migration (Task 2); Continue/next-step (Tasks 1, 7); guest-first (ProfileHeader guest prompt, digest/delete hidden or gated). Language/privacy moved to footer.
- **Deferred (per spec):** N1 badge, E0c/E0e toast (errors inline), paths/notes/teams, deleting the auth identity.
- **Type consistency:** `phaseProgress`/`overallProgress`/`nextResource` shapes (`PhaseProgressRow`, `NextResource`) are defined in Task 1 and consumed unchanged in Tasks 7 and 9. `deleteAccountData(userId) → {error?}` defined in Task 2, used in Task 11. `useProgress` fields (`isComplete`, `reset`, `exportProgress`, `importProgress`) and `usePersona` (`personaId`, `setPersona`) match the current hooks.
- **Verification flags for implementers:** confirm `importProgress(file)` / `exportProgress()` signatures (Task 10 note); add `display:block` to the two continue spans (Task 7 Step 5); the signed-in account menu is verified in the browser, not jsdom (no Supabase session in tests).
- **No placeholders:** every code step contains complete, runnable code.
