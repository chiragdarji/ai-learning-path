import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../test/renderWithProviders'
import { SignInPrompt } from './SignInPrompt'
import { useAuth } from '../context/AuthProvider'

function Probe() {
  const { signInOpen } = useAuth()
  return <span data-testid="open">{String(signInOpen)}</span>
}

describe('SignInPrompt', () => {
  it('renders the provided message', () => {
    renderWithProviders(<SignInPrompt message="Sign in to suggest resources." />)
    expect(screen.getByText('Sign in to suggest resources.')).toBeInTheDocument()
  })

  it('opens the sign-in modal when its button is clicked', async () => {
    renderWithProviders(
      <>
        <SignInPrompt message="Sign in to suggest resources." />
        <Probe />
      </>,
    )
    expect(screen.getByTestId('open')).toHaveTextContent('false')
    await userEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    expect(screen.getByTestId('open')).toHaveTextContent('true')
  })
})
