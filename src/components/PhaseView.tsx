import type { Phase } from '../types'
import type { PersonaId } from '../data/personas'
import { PERSONAS, getResourcePriority } from '../data/personas'
import { difficultyLabel } from '../utils/helpers'
import { ResourceCard } from './ResourceCard'
import { CommunityStatBadge } from './CommunityStatBadge'
import type { PhaseCompletionStat } from '../services/communityStats'

interface PhaseViewProps {
  phase: Phase
  personaId: PersonaId
  isComplete: (id: string) => boolean
  onToggle: (id: string) => void
  showSkipped: boolean
  phaseCommunityStat?: PhaseCompletionStat
  communityStatsLoading?: boolean
}

export function PhaseView({
  phase,
  personaId,
  isComplete,
  onToggle,
  showSkipped,
  phaseCommunityStat,
  communityStatsLoading,
}: PhaseViewProps) {
  const persona = PERSONAS[personaId]
  const override = persona.phaseOverrides[phase.id]

  const visibleResources = phase.steps.flatMap((s) =>
    s.resources.filter((r) => {
      const p = getResourcePriority(personaId, r.id)
      return showSkipped || p !== 'skip'
    }),
  )

  const total = visibleResources.length
  const done = visibleResources.filter((r) => isComplete(r.id)).length

  const essentialInPhase = visibleResources.filter(
    (r) => getResourcePriority(personaId, r.id) === 'essential',
  ).length

  return (
    <div className="phase-view">
      <header className="page-header">
        <p className="eyebrow">
          Phase {phase.number} · {difficultyLabel(phase.level)}
        </p>
        <h1>{phase.title}</h1>
        <p className="lead">{override?.description ?? phase.description}</p>
        {override?.note && <p className="phase-note">{override.note}</p>}
        <div className="phase-meta">
          <span>{override?.estimatedWeeks ?? phase.estimatedWeeks}</span>
          <span>
            {done}/{total} complete
          </span>
          {personaId === 'swe-manager' && essentialInPhase > 0 && (
            <span className="essential-count">{essentialInPhase} essential</span>
          )}
          <CommunityStatBadge
            stat={phaseCommunityStat}
            loading={communityStatsLoading}
          />
        </div>
      </header>

      <ol className="steps-list">
        {phase.steps.map((step, index) => {
          const stepResources = step.resources.filter((r) => {
            const p = getResourcePriority(personaId, r.id)
            return showSkipped || p !== 'skip'
          })

          if (stepResources.length === 0) return null

          return (
            <li key={step.id} className="step-block">
              <div className="step-header">
                <span className="step-num">Step {index + 1}</span>
                <h2>{step.title}</h2>
                <p className="step-objective">{step.objective}</p>
              </div>
              <div className="resource-grid">
                {stepResources.map((resource) => {
                  const priority = getResourcePriority(personaId, resource.id)
                  const note = persona.resourceNotes[resource.id]

                  return (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      done={isComplete(resource.id)}
                      onToggle={onToggle}
                      priority={personaId === 'full' ? undefined : priority}
                      managerNote={note}
                      dimmed={priority === 'optional' || priority === 'skip'}
                    />
                  )
                })}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
