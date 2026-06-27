import { NavLink } from 'react-router-dom'
import { LEARNING_PATH } from '../data/learningPath'
import type { Phase } from '../types'
import type { PersonaId } from '../data/personas'
import { PERSONAS } from '../data/personas'
import { difficultyLabel } from '../utils/helpers'

interface SidebarProps {
  personaId: PersonaId
  completedCount: (phase: Phase) => number
  totalCount: (phase: Phase) => number
}

export function Sidebar({ personaId, completedCount, totalCount }: SidebarProps) {
  const persona = PERSONAS[personaId]
  const orderedPhases = persona.phaseOrder
    .map((id) => LEARNING_PATH.find((p) => p.id === id))
    .filter(Boolean) as Phase[]

  const phasesToShow = personaId === 'swe-manager' ? orderedPhases : LEARNING_PATH

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
          <strong>Roadmap Overview</strong>
          <small>Full journey map</small>
        </span>
      </NavLink>

      <NavLink
        to="/news-radar"
        className={({ isActive }) => `nav-item news-radar ${isActive ? 'active' : ''}`}
      >
        <span className="nav-num">📡</span>
        <span className="nav-text">
          <strong>AI News Radar</strong>
          <small>Stay current · Phase 7</small>
        </span>
      </NavLink>

      <div className="nav-divider">Phases</div>

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
    </nav>
  )
}
