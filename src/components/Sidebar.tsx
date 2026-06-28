import { NavLink } from 'react-router-dom'
import { LEARNING_PATH } from '../data/learningPath'
import type { Phase } from '../types'
import type { PersonaId } from '../data/personas'
import { isEssentialTrack, PERSONAS } from '../data/personas'
import { difficultyLabel } from '../utils/helpers'
import { useLocale } from '../context/LocaleProvider'
import { CURRICULUM_META } from '../data/meta'

interface SidebarProps {
  personaId: PersonaId
  completedCount: (phase: Phase) => number
  totalCount: (phase: Phase) => number
}

export function Sidebar({ personaId, completedCount, totalCount }: SidebarProps) {
  const { t, locale, setLocale } = useLocale()
  const persona = PERSONAS[personaId]
  const orderedPhases = persona.phaseOrder
    .map((id) => LEARNING_PATH.find((p) => p.id === id))
    .filter(Boolean) as Phase[]

  const phasesToShow = isEssentialTrack(personaId) ? orderedPhases : LEARNING_PATH

  return (
    <nav className="sidebar" aria-label="Course navigation">
      <div className="sidebar-brand">
        <span className="brand-mark">AI</span>
        <div>
          <strong>Learning Path</strong>
          <small>{persona.label}</small>
        </div>
      </div>

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

      <div className="nav-divider">Community</div>
      <NavLink to="/submit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-num">+</span>
        <span className="nav-text">
          <strong>{t.nav.submit}</strong>
        </span>
      </NavLink>
      <NavLink to="/digest" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-num">✉</span>
        <span className="nav-text">
          <strong>{t.nav.digest}</strong>
        </span>
      </NavLink>
      <NavLink to="/team" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-num">👥</span>
        <span className="nav-text">
          <strong>{t.nav.team}</strong>
        </span>
      </NavLink>
      <NavLink to="/embed" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-num">{`</>`}</span>
        <span className="nav-text">
          <strong>{t.nav.embed}</strong>
        </span>
      </NavLink>
      <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-num">⚙</span>
        <span className="nav-text">
          <strong>{t.nav.admin}</strong>
        </span>
      </NavLink>

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
