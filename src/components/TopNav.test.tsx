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
