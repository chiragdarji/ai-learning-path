import { NavLink, useNavigate } from 'react-router-dom'
import { useLocale } from '../context/LocaleProvider'
import { useAuth } from '../context/AuthProvider'
import { isAdminEmail } from '../services/userProfile'
import { AuthButton } from './AuthButton'
import { Dropdown } from './ui'
import styles from './TopNav.module.css'

const primary = [
  { to: '/', key: 'learn' as const },
  { to: '/my', key: 'myLearning' as const },
  { to: '/community', key: 'community' as const },
]

export function TopNav() {
  const { t } = useLocale()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = isAdminEmail(user?.email ?? undefined)

  const menuItems = [
    ...(isAdmin ? [{ label: t.nav.admin, onSelect: () => navigate('/admin') }] : []),
    { label: t.nav.embed, onSelect: () => navigate('/embed') },
    { label: t.nav.privacy, onSelect: () => navigate('/privacy') },
  ]

  return (
    <nav className={styles.bar} aria-label="Primary">
      <NavLink to="/" className={styles.brand} end>
        <span className={styles.brandMark}>AI</span>
        Learning Path
      </NavLink>
      <div className={styles.primary}>
        {primary.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={styles.link}
          >
            {t.nav[item.key]}
          </NavLink>
        ))}
      </div>
      <div className={styles.account}>
        <AuthButton />
        <Dropdown trigger={t.nav.account} items={menuItems} />
      </div>
    </nav>
  )
}
