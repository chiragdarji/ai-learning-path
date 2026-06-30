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
