import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../test/renderWithProviders'
import { AuthModal } from './AuthModal'
import { useAuth } from '../context/AuthProvider'

function Opener() {
  const { openSignIn } = useAuth()
  return <button onClick={openSignIn}>open</button>
}

describe('AuthModal', () => {
  it('is hidden until opened', () => {
    renderWithProviders(<AuthModal />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens via openSignIn and shows Google + email options', async () => {
    renderWithProviders(
      <>
        <Opener />
        <AuthModal />
      </>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'open' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /magic link/i })).toBeInTheDocument()
  })
})
