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
    expect(screen.getByText(/1 · Foundations/)).toBeInTheDocument()
    expect(screen.getByText(/2 · LLM Fundamentals/)).toBeInTheDocument()
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
