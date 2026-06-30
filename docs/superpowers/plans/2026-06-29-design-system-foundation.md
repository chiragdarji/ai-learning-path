# Design System Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Formalize the existing 19 CSS custom-property tokens into a documented token system and ship 6 accessible, token-styled UI primitives (Button, Badge, Card, Input, Modal, Tabs, Dropdown) that unblock the Phase E R1 professional shell.

**Architecture:** Brownfield approach — keep all existing tokens and the 2,127 lines of working CSS. Consolidate tokens into a single `src/styles/tokens.css` (existing 19 + new spacing/type/state/elevation/focus-ring scales), imported by `index.css`. Build primitives in `src/components/ui/` as self-contained units, each with a co-located `.module.css` (CSS Modules, scoped). Interactive primitives (Modal, Tabs, Dropdown) wrap **Radix UI** unstyled primitives so focus traps, ARIA, and keyboard navigation are correct by default — closing the WCAG 2.1 AA gap without a rewrite. **No Tailwind, no shadcn.**

**Tech Stack:** Vite 8, React 19.2, TypeScript, CSS Modules, Radix UI (`react-dialog`, `react-tabs`, `react-dropdown-menu`), Vitest 4 + Testing Library + user-event.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/styles/tokens.css` | **Create.** Single source of truth for all design tokens (existing 19 + new scales). |
| `src/index.css:1-23` | **Modify.** Remove the `:root{}` block; `@import './styles/tokens.css'` at top. |
| `src/components/ui/Button.tsx` + `Button.module.css` | **Create.** Token-styled button, variant + size props. |
| `src/components/ui/Badge.tsx` + `Badge.module.css` | **Create.** Token-styled status badge, tone prop. |
| `src/components/ui/Card.tsx` + `Card.module.css` | **Create.** Surface container with elevation. |
| `src/components/ui/Input.tsx` + `Input.module.css` | **Create.** Labeled text input with a11y association. |
| `src/components/ui/Modal.tsx` + `Modal.module.css` | **Create.** Radix Dialog wrapper. |
| `src/components/ui/Tabs.tsx` + `Tabs.module.css` | **Create.** Radix Tabs wrapper. |
| `src/components/ui/Dropdown.tsx` + `Dropdown.module.css` | **Create.** Radix DropdownMenu wrapper. |
| `src/components/ui/index.ts` | **Create.** Barrel export for all primitives. |
| `src/components/ui/*.test.tsx` | **Create.** One test file per interactive primitive. |
| `docs/DESIGN-SYSTEM.md` | **Create.** Token reference + primitive usage docs. |

---

## Task 1: Consolidate and extend design tokens

**Files:**
- Create: `src/styles/tokens.css`
- Modify: `src/index.css:1-23` (remove `:root{}` block, add import)

- [ ] **Step 1: Create `src/styles/tokens.css` with existing + new tokens**

```css
/* Design tokens — single source of truth. See docs/DESIGN-SYSTEM.md */
:root {
  /* ===== Existing palette (unchanged) ===== */
  --bg-deep: #0c0f14;
  --bg-panel: #12161e;
  --bg-card: #181d27;
  --bg-card-hover: #1e2430;
  --border: #2a3140;
  --border-soft: #1f2530;
  --text: #9aa3b5;
  --text-strong: #e8ecf4;
  --text-muted: #6b7385;
  --accent: #e8a838;
  --accent-dim: rgba(232, 168, 56, 0.12);
  --accent-glow: rgba(232, 168, 56, 0.25);
  --green: #3dd68c;
  --green-dim: rgba(61, 214, 140, 0.12);
  --serif: 'Fraunces', Georgia, serif;
  --sans: 'IBM Plex Sans', system-ui, sans-serif;
  --sidebar-w: 280px;
  --radius: 10px;
  --radius-sm: 6px;

  /* ===== NEW: radius ===== */
  --radius-lg: 14px;

  /* ===== NEW: spacing scale (4px base) ===== */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  /* ===== NEW: type scale ===== */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.5rem;
  --text-2xl: 2rem;
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* ===== NEW: state colors (distinct from amber accent) ===== */
  --danger: #f87171;
  --danger-dim: rgba(248, 113, 113, 0.12);
  --warning: #f5a623;
  --warning-dim: rgba(245, 166, 35, 0.12);
  --info: #60a5fa;
  --info-dim: rgba(96, 165, 250, 0.12);

  /* ===== NEW: elevation ===== */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.5);

  /* ===== NEW: focus ring (WCAG keyboard nav) ===== */
  --focus-ring: 0 0 0 3px var(--accent-glow);
}
```

- [ ] **Step 2: Remove the `:root{}` block from `index.css` and import tokens**

In `src/index.css`, delete lines 1-23 (the existing `:root { ... }` block, ending at its closing `}`) and replace with a single import line at the very top of the file:

```css
@import './styles/tokens.css';
```

Leave the rest of `index.css` untouched.

- [ ] **Step 3: Verify the build still compiles and tokens resolve**

Run: `npm run build`
Expected: build succeeds (`tsc -b && vite build && ...` exits 0). The `@import` is bundled; all existing `var(--*)` references resolve unchanged because the 19 tokens kept identical names and values.

- [ ] **Step 4: Verify the dev server renders unchanged**

Run: `npm run dev` then open `http://localhost:5173` (stop with Ctrl-C after confirming).
Expected: app looks identical to before — same colors, spacing, fonts. (Pure consolidation; no visual change.)

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.css src/index.css
git commit -m "feat(design-system): consolidate + extend design tokens"
```

---

## Task 2: Install Radix primitives, user-event, and CSS Module types

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install Radix UI primitives and the test helper**

Run:
```bash
npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-dropdown-menu
npm install -D @testing-library/user-event
```
Expected: packages added to `package.json`; install exits 0. (Recent Radix versions support React 19.)

- [ ] **Step 2: Confirm Vite recognizes CSS Modules (no config needed)**

Vite supports `*.module.css` out of the box. No config change required. Confirm by checking that `vite.config.ts` has no CSS overrides that would disable it:

Run: `grep -n "css" vite.config.ts || echo "no css overrides — defaults apply"`
Expected: prints "no css overrides — defaults apply" (or shows only unrelated config).

- [ ] **Step 3: Verify TypeScript resolves `.module.css` imports**

Vite's client types (`vite/client`) declare `*.module.css` modules. Confirm `src/vite-env.d.ts` references them:

Run: `cat src/vite-env.d.ts`
Expected: contains `/// <reference types="vite/client" />`. If it does NOT, add that line as the first line of the file (this is what types `.module.css` imports as `Record<string, string>`).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/vite-env.d.ts
git commit -m "build(design-system): add Radix primitives + user-event"
```

---

## Task 3: Button primitive (TDD)

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Button.module.css`
- Test: `src/components/ui/Button.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick} disabled>Go</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies the variant data attribute', () => {
    render(<Button variant="danger">Delete</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'danger')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/Button.test.tsx`
Expected: FAIL — cannot resolve `./Button`.

- [ ] **Step 3: Create `Button.module.css`**

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--sans);
  font-weight: var(--weight-semibold);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.button:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* sizes */
.sm { padding: var(--space-1) var(--space-3); font-size: var(--text-sm); }
.md { padding: var(--space-2) var(--space-4); font-size: var(--text-base); }

/* variants */
.button[data-variant='primary'] {
  background: var(--accent);
  color: var(--bg-deep);
}
.button[data-variant='primary']:hover:not(:disabled) { background: #f0b94e; }

.button[data-variant='secondary'] {
  background: var(--bg-card);
  color: var(--text-strong);
  border-color: var(--border);
}
.button[data-variant='secondary']:hover:not(:disabled) { background: var(--bg-card-hover); }

.button[data-variant='danger'] {
  background: var(--danger-dim);
  color: var(--danger);
  border-color: var(--danger);
}
.button[data-variant='danger']:hover:not(:disabled) { background: var(--danger); color: var(--bg-deep); }

.button[data-variant='ghost'] {
  background: transparent;
  color: var(--text);
}
.button[data-variant='ghost']:hover:not(:disabled) { background: var(--bg-card); color: var(--text-strong); }
```

- [ ] **Step 4: Create `Button.tsx`**

```tsx
import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      data-variant={variant}
      className={`${styles.button} ${styles[size]} ${className ?? ''}`.trim()}
      {...props}
    />
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Button.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Button.tsx src/components/ui/Button.module.css src/components/ui/Button.test.tsx
git commit -m "feat(design-system): add Button primitive"
```

---

## Task 4: Badge primitive (TDD)

**Files:**
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Badge.module.css`
- Test: `src/components/ui/Badge.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('applies the tone data attribute', () => {
    render(<Badge tone="success">Done</Badge>)
    expect(screen.getByText('Done')).toHaveAttribute('data-tone', 'success')
  })

  it('defaults to the neutral tone', () => {
    render(<Badge>Plain</Badge>)
    expect(screen.getByText('Plain')).toHaveAttribute('data-tone', 'neutral')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/Badge.test.tsx`
Expected: FAIL — cannot resolve `./Badge`.

- [ ] **Step 3: Create `Badge.module.css`**

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: 999px;
  font-family: var(--sans);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  line-height: 1;
}
.badge[data-tone='neutral'] { background: var(--bg-card); color: var(--text); }
.badge[data-tone='accent'] { background: var(--accent-dim); color: var(--accent); }
.badge[data-tone='success'] { background: var(--green-dim); color: var(--green); }
.badge[data-tone='warning'] { background: var(--warning-dim); color: var(--warning); }
.badge[data-tone='danger'] { background: var(--danger-dim); color: var(--danger); }
.badge[data-tone='info'] { background: var(--info-dim); color: var(--info); }
```

- [ ] **Step 4: Create `Badge.tsx`**

```tsx
import type { HTMLAttributes } from 'react'
import styles from './Badge.module.css'

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      data-tone={tone}
      className={`${styles.badge} ${className ?? ''}`.trim()}
      {...props}
    />
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Badge.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Badge.tsx src/components/ui/Badge.module.css src/components/ui/Badge.test.tsx
git commit -m "feat(design-system): add Badge primitive"
```

---

## Task 5: Card primitive (TDD)

**Files:**
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Card.module.css`
- Test: `src/components/ui/Card.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>Body content</Card>)
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })

  it('forwards a custom className', () => {
    render(<Card className="extra">x</Card>)
    expect(screen.getByText('x')).toHaveClass('extra')
  })

  it('sets the interactive data attribute when interactive', () => {
    render(<Card interactive>x</Card>)
    expect(screen.getByText('x')).toHaveAttribute('data-interactive', 'true')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/Card.test.tsx`
Expected: FAIL — cannot resolve `./Card`.

- [ ] **Step 3: Create `Card.module.css`**

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
}
.card[data-interactive='true'] {
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
.card[data-interactive='true']:hover {
  background: var(--bg-card-hover);
  border-color: var(--border);
  box-shadow: var(--shadow-md);
}
```

- [ ] **Step 4: Create `Card.tsx`**

```tsx
import type { HTMLAttributes } from 'react'
import styles from './Card.module.css'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export function Card({ interactive, className, ...props }: CardProps) {
  return (
    <div
      data-interactive={interactive ? 'true' : undefined}
      className={`${styles.card} ${className ?? ''}`.trim()}
      {...props}
    />
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Card.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Card.tsx src/components/ui/Card.module.css src/components/ui/Card.test.tsx
git commit -m "feat(design-system): add Card primitive"
```

---

## Task 6: Input primitive (TDD)

**Files:**
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Input.module.css`
- Test: `src/components/ui/Input.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('associates the label with the input for accessibility', () => {
    render(<Input id="email" label="Email address" />)
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
  })

  it('fires onChange with typed value', () => {
    const onChange = vi.fn()
    render(<Input id="name" label="Name" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('renders an error message linked via aria-describedby', () => {
    render(<Input id="pw" label="Password" error="Too short" />)
    const input = screen.getByLabelText('Password')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBe('pw-error')
    expect(screen.getByText('Too short')).toHaveAttribute('id', 'pw-error')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/Input.test.tsx`
Expected: FAIL — cannot resolve `./Input`.

- [ ] **Step 3: Create `Input.module.css`**

```css
.field { display: flex; flex-direction: column; gap: var(--space-1); }
.label {
  font-family: var(--sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-strong);
}
.input {
  font-family: var(--sans);
  font-size: var(--text-base);
  color: var(--text-strong);
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
}
.input:focus-visible {
  outline: none;
  border-color: var(--accent);
  box-shadow: var(--focus-ring);
}
.input[aria-invalid='true'] { border-color: var(--danger); }
.error { font-size: var(--text-xs); color: var(--danger); }
```

- [ ] **Step 4: Create `Input.tsx`**

```tsx
import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
}

export function Input({ id, label, error, className, ...props }: InputProps) {
  const errorId = `${id}-error`
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`${styles.input} ${className ?? ''}`.trim()}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Input.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Input.tsx src/components/ui/Input.module.css src/components/ui/Input.test.tsx
git commit -m "feat(design-system): add Input primitive"
```

---

## Task 7: Modal primitive on Radix Dialog (TDD)

**Files:**
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Modal.module.css`
- Test: `src/components/ui/Modal.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders title and content when open', () => {
    render(
      <Modal open onOpenChange={() => {}} title="Sign in">
        <p>Body</p>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    render(
      <Modal open={false} onOpenChange={() => {}} title="Sign in">
        <p>Body</p>
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onOpenChange(false) when Escape is pressed', async () => {
    const onOpenChange = vi.fn()
    render(
      <Modal open onOpenChange={onOpenChange} title="Sign in">
        <p>Body</p>
      </Modal>,
    )
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/Modal.test.tsx`
Expected: FAIL — cannot resolve `./Modal`.

- [ ] **Step 3: Create `Modal.module.css`**

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  animation: fade 0.15s ease;
}
.content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(440px, calc(100vw - var(--space-6)));
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-5);
}
.title {
  margin: 0 0 var(--space-3);
  font-family: var(--serif);
  font-size: var(--text-xl);
  color: var(--text-strong);
}
.close {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: var(--text-lg);
  cursor: pointer;
  line-height: 1;
}
.close:hover { color: var(--text-strong); }
.close:focus-visible { outline: none; box-shadow: var(--focus-ring); border-radius: var(--radius-sm); }
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
```

- [ ] **Step 4: Create `Modal.tsx`**

```tsx
import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import styles from './Modal.module.css'

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
}

export function Modal({ open, onOpenChange, title, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          <Dialog.Close className={styles.close} aria-label="Close">
            ×
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Modal.test.tsx`
Expected: PASS (3 tests). Radix supplies `role="dialog"`, focus trap, and Escape handling.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Modal.tsx src/components/ui/Modal.module.css src/components/ui/Modal.test.tsx
git commit -m "feat(design-system): add Modal primitive on Radix Dialog"
```

---

## Task 8: Tabs primitive on Radix Tabs (TDD)

**Files:**
- Create: `src/components/ui/Tabs.tsx`
- Create: `src/components/ui/Tabs.module.css`
- Test: `src/components/ui/Tabs.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Tabs } from './Tabs'

const items = [
  { value: 'a', label: 'First', content: <p>Panel A</p> },
  { value: 'b', label: 'Second', content: <p>Panel B</p> },
]

describe('Tabs', () => {
  it('renders the default tab panel', () => {
    render(<Tabs defaultValue="a" items={items} />)
    expect(screen.getByText('Panel A')).toBeVisible()
    expect(screen.queryByText('Panel B')).not.toBeInTheDocument()
  })

  it('switches panel when another tab is clicked', async () => {
    render(<Tabs defaultValue="a" items={items} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Second' }))
    expect(screen.getByText('Panel B')).toBeVisible()
  })

  it('exposes tablist semantics', () => {
    render(<Tabs defaultValue="a" items={items} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/Tabs.test.tsx`
Expected: FAIL — cannot resolve `./Tabs`.

- [ ] **Step 3: Create `Tabs.module.css`**

```css
.list {
  display: flex;
  gap: var(--space-1);
  border-bottom: 1px solid var(--border);
  margin-bottom: var(--space-4);
}
.trigger {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  padding: var(--space-2) var(--space-3);
  font-family: var(--sans);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-muted);
  cursor: pointer;
}
.trigger:hover { color: var(--text-strong); }
.trigger[data-state='active'] { color: var(--accent); border-bottom-color: var(--accent); }
.trigger:focus-visible { outline: none; box-shadow: var(--focus-ring); border-radius: var(--radius-sm); }
```

- [ ] **Step 4: Create `Tabs.tsx`**

```tsx
import type { ReactNode } from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'
import styles from './Tabs.module.css'

export interface TabItem {
  value: string
  label: string
  content: ReactNode
}

export interface TabsProps {
  defaultValue: string
  items: TabItem[]
}

export function Tabs({ defaultValue, items }: TabsProps) {
  return (
    <RadixTabs.Root defaultValue={defaultValue}>
      <RadixTabs.List className={styles.list}>
        {items.map((item) => (
          <RadixTabs.Trigger key={item.value} value={item.value} className={styles.trigger}>
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content key={item.value} value={item.value}>
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Tabs.test.tsx`
Expected: PASS (3 tests). Radix supplies `tablist`/`tab` roles and arrow-key navigation.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Tabs.tsx src/components/ui/Tabs.module.css src/components/ui/Tabs.test.tsx
git commit -m "feat(design-system): add Tabs primitive on Radix Tabs"
```

---

## Task 9: Dropdown primitive on Radix DropdownMenu (TDD)

**Files:**
- Create: `src/components/ui/Dropdown.tsx`
- Create: `src/components/ui/Dropdown.module.css`
- Test: `src/components/ui/Dropdown.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Dropdown } from './Dropdown'

describe('Dropdown', () => {
  it('shows menu items after the trigger is clicked', async () => {
    render(
      <Dropdown
        trigger="Menu"
        items={[
          { label: 'Profile', onSelect: () => {} },
          { label: 'Sign out', onSelect: () => {} },
        ]}
      />,
    )
    expect(screen.queryByText('Profile')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(await screen.findByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Sign out')).toBeInTheDocument()
  })

  it('calls onSelect when an item is chosen', async () => {
    const onSelect = vi.fn()
    render(<Dropdown trigger="Menu" items={[{ label: 'Profile', onSelect }]} />)
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }))
    await userEvent.click(await screen.findByText('Profile'))
    expect(onSelect).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/Dropdown.test.tsx`
Expected: FAIL — cannot resolve `./Dropdown`.

- [ ] **Step 3: Create `Dropdown.module.css`**

```css
.trigger {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  font-family: var(--sans);
  font-size: var(--text-sm);
  color: var(--text-strong);
  cursor: pointer;
}
.trigger:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.content {
  min-width: 180px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  padding: var(--space-1);
}
.item {
  display: flex;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  font-family: var(--sans);
  font-size: var(--text-sm);
  color: var(--text);
  border-radius: var(--radius-sm);
  cursor: pointer;
  outline: none;
}
.item[data-highlighted] { background: var(--bg-card-hover); color: var(--text-strong); }
```

- [ ] **Step 4: Create `Dropdown.tsx`**

```tsx
import type { ReactNode } from 'react'
import * as Menu from '@radix-ui/react-dropdown-menu'
import styles from './Dropdown.module.css'

export interface DropdownItem {
  label: string
  onSelect: () => void
}

export interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
}

export function Dropdown({ trigger, items }: DropdownProps) {
  return (
    <Menu.Root>
      <Menu.Trigger className={styles.trigger}>{trigger}</Menu.Trigger>
      <Menu.Portal>
        <Menu.Content className={styles.content} sideOffset={4}>
          {items.map((item) => (
            <Menu.Item
              key={item.label}
              className={styles.item}
              onSelect={item.onSelect}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Dropdown.test.tsx`
Expected: PASS (2 tests). Radix supplies menu roles, roving focus, and outside-click close.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Dropdown.tsx src/components/ui/Dropdown.module.css src/components/ui/Dropdown.test.tsx
git commit -m "feat(design-system): add Dropdown primitive on Radix DropdownMenu"
```

---

## Task 10: Barrel export, docs, and full-suite verification

**Files:**
- Create: `src/components/ui/index.ts`
- Create: `docs/DESIGN-SYSTEM.md`

- [ ] **Step 1: Create the barrel export `src/components/ui/index.ts`**

```ts
export { Button } from './Button'
export type { ButtonProps } from './Button'
export { Badge } from './Badge'
export type { BadgeProps } from './Badge'
export { Card } from './Card'
export type { CardProps } from './Card'
export { Input } from './Input'
export type { InputProps } from './Input'
export { Modal } from './Modal'
export type { ModalProps } from './Modal'
export { Tabs } from './Tabs'
export type { TabItem, TabsProps } from './Tabs'
export { Dropdown } from './Dropdown'
export type { DropdownItem, DropdownProps } from './Dropdown'
```

- [ ] **Step 2: Create `docs/DESIGN-SYSTEM.md`**

```markdown
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
```

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS — all new `ui/*.test.tsx` suites plus the pre-existing logic tests are green.

- [ ] **Step 4: Run lint and the production build**

Run: `npm run lint && npm run build`
Expected: lint clean; build exits 0 (tokens import, CSS Modules, and Radix all compile).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/index.ts docs/DESIGN-SYSTEM.md
git commit -m "docs(design-system): add barrel export + DESIGN-SYSTEM.md"
```

---

## Self-Review Notes

- **Spec coverage:** Tokens (Task 1) cover every gap named in the North Star E4 pre-work — spacing, type scale, state colors, elevation, `--radius-lg`, and `--focus-ring`. Primitives (Tasks 3-9) deliver the 6 named components (Button, Card, Input, Badge + Modal/Tabs/Dropdown on Radix). Docs (Task 10) satisfy the "document in DESIGN-SYSTEM.md" requirement. WCAG gap is addressed via Radix + `--focus-ring` on every interactive primitive.
- **Type consistency:** Prop names are stable across tasks — `variant`/`size` (Button), `tone` (Badge), `interactive` (Card), `id`/`label`/`error` (Input), `open`/`onOpenChange`/`title` (Modal), `defaultValue`/`items` with `TabItem` (Tabs), `trigger`/`items` with `DropdownItem` (Dropdown). The barrel in Task 10 re-exports exactly these names.
- **No placeholders:** every code step contains complete, runnable code.
- **Out of scope (intentional):** migrating existing components (ResourceCard, AuthButton, etc.) to the primitives — that happens during E4a/b as those surfaces are rebuilt, not in this foundation plan.
```