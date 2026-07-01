import { LEARNING_PATH } from '../data/learningPath'
import type { Phase } from '../types'
import type { PersonaId } from '../data/personas'
import { PERSONAS, getResourcePriority, isEssentialTrack } from '../data/personas'

export interface PhaseProgressRow {
  phaseId: string
  number: number
  title: string
  done: number
  total: number
  pct: number
}

export interface NextResource {
  id: string
  title: string
  url: string
  phaseId: string
}

function orderedPhases(personaId: PersonaId): Phase[] {
  const persona = PERSONAS[personaId]
  const ordered = persona.phaseOrder
    .map((id) => LEARNING_PATH.find((p) => p.id === id))
    .filter(Boolean) as Phase[]
  return isEssentialTrack(personaId) ? ordered : LEARNING_PATH
}

function trackResources(phase: Phase, personaId: PersonaId) {
  return phase.steps
    .flatMap((s) => s.resources)
    .filter((r) => getResourcePriority(personaId, r.id) !== 'skip')
}

export function phaseProgress(
  personaId: PersonaId,
  isComplete: (id: string) => boolean,
): PhaseProgressRow[] {
  return orderedPhases(personaId).map((phase) => {
    const resources = trackResources(phase, personaId)
    const done = resources.filter((r) => isComplete(r.id)).length
    const total = resources.length
    return {
      phaseId: phase.id,
      number: phase.number,
      title: phase.title,
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
    }
  })
}

export function overallProgress(
  personaId: PersonaId,
  isComplete: (id: string) => boolean,
): { done: number; total: number; pct: number } {
  const rows = phaseProgress(personaId, isComplete)
  const done = rows.reduce((sum, r) => sum + r.done, 0)
  const total = rows.reduce((sum, r) => sum + r.total, 0)
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
}

export function nextResource(
  personaId: PersonaId,
  isComplete: (id: string) => boolean,
): NextResource | null {
  for (const phase of orderedPhases(personaId)) {
    for (const resource of trackResources(phase, personaId)) {
      if (!isComplete(resource.id)) {
        return {
          id: resource.id,
          title: resource.title,
          url: resource.url,
          phaseId: phase.id,
        }
      }
    }
  }
  return null
}
