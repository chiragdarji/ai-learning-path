import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { ProfileHeader } from './ProfileHeader'
import { useAuth } from '../../context/AuthProvider'

function Probe() {
  const { signInOpen } = useAuth()
  return <span data-testid="open">{String(signInOpen)}</span>
}

describe('ProfileHeader', () => {
  it('shows the learning title and a progress summary', () => {
    renderWithProviders(<ProfileHeader done={40} total={65} pct={62} />)
    expect(screen.getByRole('heading', { name: 'Your learning' })).toBeInTheDocument()
    expect(screen.getByText(/40 of 65/)).toBeInTheDocument()
  })

  it('offers a sign-in prompt for guests that opens the modal', async () => {
    renderWithProviders(
      <>
        <ProfileHeader done={0} total={65} pct={0} />
        <Probe />
      </>,
    )
    await userEvent.click(screen.getByRole('button', { name: /Sign in to sync/i }))
    expect(screen.getByTestId('open')).toHaveTextContent('true')
  })
})
