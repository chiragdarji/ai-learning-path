import { NavLink } from 'react-router-dom'
import { LEARNING_PATH } from '../data/learningPath'
import type { Phase } from '../types'
import type { PersonaId } from '../data/personas'
import { isEssentialTrack, PERSONAS } from '../data/personas'
import { difficultyLabel } from '../utils/helpers'
import { useLocale } from '../context/LocaleProvider'
import { CURRICULUM_META } from '../data/meta'

interface LearnSidebarProps {
  personaId: PersonaId
  completedCount: (phase: Phase) => number
  totalCount: (phase: Phase) => number
}

export function LearnSidebar({ personaId, completedCount, totalCount }: LearnSidebarProps) {
  const { t, locale, setLocale } = useLocale()
  const persona = PERSONAS[personaId]
  const orderedPhases = persona.phaseOrder
    .map((id) => LEARNING_PATH.find((p) => p.id === id))
    .filter(Boolean) as Phase[]

  const phasesToShow = isEssentialTrack(personaId) ? orderedPhases : LEARNING_PATH

  return (
    <nav className="sidebar" aria-label="Course navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `nav-item overview ${isActive ? 'active' : ''}`}
      >
        <span className="nav-num">◎</span>
        <span className="nav-text">
          <strong>{t.nav.overview}</strong>
          <small>{t.nav.overviewSub}</small>
        </span>
      </NavLink>

      <NavLink
        to="/search"
        className={({ isActive }) => `nav-item search ${isActive ? 'active' : ''}`}
      >
        <span className="nav-num">⌕</span>
        <span className="nav-text">
          <strong>{t.nav.search}</strong>
          <small>{t.nav.searchSub}</small>
        </span>
      </NavLink>

      <NavLink
        to="/news-radar"
        className={({ isActive }) => `nav-item news-radar ${isActive ? 'active' : ''}`}
      >
        <span className="nav-num">📡</span>
        <span className="nav-text">
          <strong>{t.nav.newsRadar}</strong>
          <small>{t.nav.newsRadarSub}</small>
        </span>
      </NavLink>

      <div className="nav-divider">{t.nav.phases}</div>

      <ol className="phase-nav">
        {phasesToShow.map((phase) => {
          const done = completedCount(phase)
          const total = totalCount(phase)
          const pct = total > 0 ? Math.round((done / total) * 100) : 0

          return (
            <li key={phase.id}>
              <NavLink
                to={`/phase/${phase.id}`}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-num">{phase.number}</span>
                <span className="nav-text">
                  <strong>{phase.title}</strong>
                  <small>
                    {difficultyLabel(phase.level)} · {pct}%
                  </small>
                </span>
              </NavLink>
            </li>
          )
        })}
      </ol>

      <div className="sidebar-footer">
        <p className="curriculum-version" title={CURRICULUM_META.description}>
          {t.community.curriculumVersion}: {CURRICULUM_META.version}
        </p>
        <label className="locale-switch">
          <span className="sr-only">Language</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value === 'es' ? 'es' : 'en')}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </label>
        <NavLink to="/privacy" className="sidebar-footer-link">
          {t.nav.privacy}
        </NavLink>
      </div>
    </nav>
  )
}
