import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleProvider'
import { useAuth } from '../context/AuthProvider'
import { usePersona } from '../hooks/usePersona'
import { useProgress } from '../hooks/useProgress'
import { PERSONAS } from '../data/personas'
import { Card } from './ui'
import styles from './MyLearningPage.module.css'

export function MyLearningPage() {
  const { t } = useLocale()
  const { user } = useAuth()
  const { personaId } = usePersona()
  const { count } = useProgress()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t.myLearning.title}</h1>
      <div className={styles.row}>
        <Card>
          <p className={styles.label}>{t.myLearning.progress}</p>
          <p className={styles.value}>{count} ✓</p>
        </Card>
        <Card>
          <p className={styles.label}>{t.myLearning.persona}</p>
          <p className={styles.value}>{PERSONAS[personaId].label}</p>
        </Card>
      </div>
      <Link to="/" className={styles.continue}>
        {t.myLearning.continue}
      </Link>
      {!user && <p className={styles.hint}>{t.myLearning.signInHint}</p>}
    </div>
  )
}
