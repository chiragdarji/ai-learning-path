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
