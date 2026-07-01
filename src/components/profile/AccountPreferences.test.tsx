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
