import { useState } from 'react'
import { useAuth } from '../context/AuthProvider'

function userInitial(email: string | undefined): string {
  if (!email) return '?'
  return email.charAt(0).toUpperCase()
}

function shortEmail(email: string | undefined): string {
  if (!email) return 'Account'
  const [name, domain] = email.split('@')
  if (!domain) return email
  const shortDomain = domain.split('.')[0]
  return `${name}@${shortDomain}`
}

export function AuthButton() {
  const {
    configured,
    loading,
    user,
    signInWithGoogle,
    signInWithEmail,
    signOut,
  } = useAuth()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!configured) return null

  if (loading) {
    return (
      <span className="account-loading" aria-live="polite">
        Account…
      </span>
    )
  }

  if (user) {
    const label = user.email ?? 'Signed in'
    return (
      <div className="account-menu">
        <div className="account-identity" title={label}>
          <span className="account-avatar" aria-hidden="true">
            {userInitial(user.email)}
          </span>
          <span className="account-label">{shortEmail(user.email)}</span>
        </div>
        <button
          type="button"
          className="action-btn account-signout"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        className="action-btn account-signin"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        Sign in to sync
      </button>

      {open && (
        <div
          className="auth-modal-backdrop"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="auth-modal"
            role="dialog"
            aria-labelledby="auth-modal-title"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="auth-modal-title">Sync progress across devices</h2>
            <p className="auth-lead">
              Sign in to keep checkmarks and track preference on phone and laptop.
            </p>

            <button
              type="button"
              className="auth-btn google"
              onClick={() => void signInWithGoogle()}
            >
              Continue with Google
            </button>

            <div className="auth-divider">or</div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitting(true)
                setMessage(null)
                void signInWithEmail(email).then((result) => {
                  setSubmitting(false)
                  setMessage(
                    result.error ?? 'Check your email for a magic link.',
                  )
                })
              }}
            >
              <label className="auth-email-label">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </label>
              <button type="submit" className="auth-btn primary" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send magic link'}
              </button>
            </form>

            {message && <p className="auth-message">{message}</p>}

            <button type="button" className="auth-close" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
