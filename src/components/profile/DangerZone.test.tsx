import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { DangerZone } from './DangerZone'

describe('DangerZone', () => {
  it('opens a confirm dialog before resetting', async () => {
    renderWithProviders(<DangerZone />)
    await userEvent.click(screen.getByRole('button', { name: /^Reset progress$/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Yes, reset progress/i })).toBeInTheDocument()
  })
})
