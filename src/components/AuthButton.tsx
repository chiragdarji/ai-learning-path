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
  const { configured, loading, user, signOut, openSignIn } = useAuth()

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
    <button
      type="button"
      className="action-btn account-signin"
      onClick={openSignIn}
      aria-haspopup="dialog"
    >
      Sign in to sync
    </button>
  )
}
