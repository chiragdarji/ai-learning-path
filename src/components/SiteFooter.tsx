import { Link } from 'react-router-dom'
import { useLocale } from '../context/LocaleProvider'
import { CURRICULUM_META } from '../data/meta'
import styles from './SiteFooter.module.css'

export function SiteFooter() {
  const { t, locale, setLocale } = useLocale()
  return (
    <footer className={styles.footer}>
      <span>
        {t.community.curriculumVersion}: {CURRICULUM_META.version}
      </span>
      <Link to="/privacy">{t.nav.privacy}</Link>
      <a href="/api/v1/curriculum.json">Curriculum API</a>
      <a href="/llms.txt">llms.txt</a>
      <label className={styles.lang}>
        <span className="sr-only">Language</span>
        <select
          aria-label="Language"
          value={locale}
          onChange={(e) => setLocale(e.target.value === 'es' ? 'es' : 'en')}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </label>
    </footer>
  )
}
