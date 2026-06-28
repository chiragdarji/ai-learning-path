import { LEARNING_PATH } from '../data/learningPath'
import type { PersonaId } from '../data/personas'
import { getPersonaResourceIds } from '../data/personas'
import { PATH_STATS } from '../data/learningPath'

interface ProgressBarProps {
  completed: number
  total: number
  label?: string
}

export function ProgressBar({ completed, total, label = 'Overall progress' }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="progress-wrap">
      <div className="progress-meta">
        <span className="progress-label">{label}</span>
        <span className="progress-count">
          {completed} / {total} · {pct}%
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

interface PathStatsProps {
  personaId?: PersonaId
  isComplete?: (id: string) => boolean
}

export function PathStats({ personaId = 'full', isComplete }: PathStatsProps) {
  const allIds = LEARNING_PATH.flatMap((p) =>
    p.steps.flatMap((s) => s.resources.map((r) => r.id)),
  )

  const essentialIds =
    personaId === 'full'
      ? allIds
      : getPersonaResourceIds(personaId, allIds, ['essential'])

  const essentialDone = isComplete
    ? essentialIds.filter(isComplete).length
    : 0

  return (
    <div className="path-stats">
      <div className="stat">
        <span className="stat-num">{PATH_STATS.totalPhases}</span>
        <span className="stat-label">Phases</span>
      </div>
      <div className="stat">
        <span className="stat-num">
          {personaId === 'swe-manager' ? essentialIds.length : PATH_STATS.totalResources}
        </span>
        <span className="stat-label">
          {personaId === 'swe-manager' ? 'Essential for you' : 'Resources'}
        </span>
      </div>
      {personaId === 'swe-manager' && isComplete && (
        <div className="stat">
          <span className="stat-num">{essentialDone}</span>
          <span className="stat-label">Completed</span>
        </div>
      )}
    </div>
  )
}
