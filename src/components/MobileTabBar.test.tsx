import { screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../test/renderWithProviders'
import { MobileTabBar } from './MobileTabBar'

describe('MobileTabBar', () => {
  it('renders the three primary tabs with correct destinations', () => {
    renderWithProviders(<MobileTabBar />)
    expect(screen.getByRole('link', { name: 'Learn' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'My learning' })).toHaveAttribute('href', '/my')
    expect(screen.getByRole('link', { name: 'Community' })).toHaveAttribute('href', '/community')
  })

  it('marks the active tab based on the route', () => {
    renderWithProviders(<MobileTabBar />, { route: '/my' })
    expect(screen.getByRole('link', { name: 'My learning' })).toHaveAttribute('aria-current', 'page')
  })

  it('exposes a navigation landmark', () => {
    renderWithProviders(<MobileTabBar />)
    expect(screen.getByRole('navigation', { name: /primary mobile/i })).toBeInTheDocument()
  })
})
