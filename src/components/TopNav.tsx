import { NavLink, useNavigate } from 'react-router-dom'
import { useLocale } from '../context/LocaleProvider'
import { useAuth } from '../context/AuthProvider'
import { isAdminEmail } from '../services/userProfile'
import { Dropdown } from './ui'
import styles from './TopNav.module.css'

const primary = [
  { to: '/', key: 'learn' as const },
  { to: '/my', key: 'myLearning' as const },
  { to: '/community', key: 'community' as const },
]

function shortEmail(email: string | undefined): string {
  if (!email) return 'Account'
  const [name, domain] = email.split('@')
  if (!domain) return email
  return `${name}@${domain.split('.')[0]}`
}

export function TopNav() {
  const { t } = useLocale()
  const { user, openSignIn, signOut } = useAuth()
  const navigate = useNavigate()
  const isAdmin = isAdminEmail(user?.email ?? undefined)

  const menuItems = [
    { label: t.nav.myLearning, onSelect: () => navigate('/my') },
    { label: 'Account settings', onSelect: () => navigate('/my/account') },
    ...(isAdmin ? [{ label: t.nav.admin, onSelect: () => navigate('/admin') }] : []),
    { label: t.nav.embed, onSelect: () => navigate('/embed') },
    { label: t.auth.signOut, onSelect: () => void signOut() },
  ]

  return (
    <nav className={styles.bar} aria-label="Primary">
      <NavLink to="/" className={styles.brand} end>
        <span className={styles.brandMark}>AI</span>
        Learning Path
      </NavLink>
      <div className={styles.primary}>
        {primary.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={styles.link}>
            {t.nav[item.key]}
          </NavLink>
        ))}
      </div>
      <div className={styles.account}>
        {user ? (
          <Dropdown trigger={shortEmail(user.email ?? undefined)} items={menuItems} />
        ) : (
          <button
            type="button"
            className="action-btn account-signin"
            onClick={openSignIn}
            aria-haspopup="dialog"
          >
            {t.auth.signIn}
          </button>
        )}
      </div>
    </nav>
  )
}
