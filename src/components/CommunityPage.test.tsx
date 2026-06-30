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
