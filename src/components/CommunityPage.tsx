import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleProvider'
import { Card } from './ui'
import styles from './CommunityPage.module.css'

export function CommunityPage() {
  const { t } = useLocale()
  const links = [
    { to: '/submit', title: t.communityHub.submit, sub: t.communityHub.submitSub },
    { to: '/digest', title: t.communityHub.digest, sub: t.communityHub.digestSub },
    { to: '/team', title: t.communityHub.team, sub: t.communityHub.teamSub },
  ]
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t.communityHub.title}</h1>
      <p className={styles.intro}>{t.communityHub.intro}</p>
      <div className={styles.grid}>
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={styles.card}>
            <Card interactive>
              <p className={styles.cardTitle}>{l.title}</p>
              <p className={styles.cardSub}>{l.sub}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
