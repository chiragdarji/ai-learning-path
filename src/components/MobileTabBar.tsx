import { NavLink } from 'react-router-dom'
import { useLocale } from '../context/LocaleProvider'
import styles from './MobileTabBar.module.css'

const tabs = [
  { to: '/', key: 'learn' as const, icon: '◎' },
  { to: '/my', key: 'myLearning' as const, icon: '☑' },
  { to: '/community', key: 'community' as const, icon: '◍' },
]

export function MobileTabBar() {
  const { t } = useLocale()
  return (
    <nav className={styles.bar} aria-label="Primary mobile">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.to === '/'} className={styles.tab}>
          <span className={styles.icon} aria-hidden="true">
            {tab.icon}
          </span>
          {t.nav[tab.key]}
        </NavLink>
      ))}
    </nav>
  )
}
