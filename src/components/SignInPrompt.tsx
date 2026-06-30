import { useAuth } from '../context/AuthProvider'
import { Button } from './ui'

interface SignInPromptProps {
  message: string
}

export function SignInPrompt({ message }: SignInPromptProps) {
  const { openSignIn } = useAuth()
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        alignItems: 'flex-start',
        padding: 'var(--space-4)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius)',
      }}
    >
      <p style={{ margin: 0, color: 'var(--text)' }}>{message}</p>
      <Button onClick={openSignIn}>Sign in to sync</Button>
    </div>
  )
}
