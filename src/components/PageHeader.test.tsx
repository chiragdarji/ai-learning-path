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
