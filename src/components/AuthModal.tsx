import { useState } from 'react'
import { useAuth } from '../context/AuthProvider'
import { Modal, Input, Button } from './ui'

export function AuthModal() {
  const { signInOpen, closeSignIn, signInWithGoogle, signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // The modal is only opened via openSignIn(), whose triggers (AuthButton,
  // SignInPrompt) are themselves gated on `configured`; Modal renders nothing
  // while closed, so no extra guard is needed here.
  return (
    <Modal
      open={signInOpen}
      onOpenChange={(open) => {
        if (!open) closeSignIn()
      }}
      title="Sync progress across devices"
    >
      <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
        Sign in to keep your checkmarks and track preference on phone and laptop.
      </p>

      <Button variant="secondary" onClick={() => void signInWithGoogle()} style={{ width: '100%' }}>
        Continue with Google
      </Button>

      <div
        style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          margin: 'var(--space-3) 0',
          fontSize: 'var(--text-sm)',
        }}
      >
        or
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitting(true)
          setMessage(null)
          void signInWithEmail(email).then((result) => {
            setSubmitting(false)
            setMessage(result.error ?? 'Check your email for a magic link.')
          })
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
      >
        <Input
          id="auth-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          required
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send magic link'}
        </Button>
      </form>

      {message && (
        <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
          {message}
        </p>
      )}
    </Modal>
  )
}
