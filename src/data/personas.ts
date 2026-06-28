import rawPersonas from '../../content/personas.json' with { type: 'json' }
import { personasSchema } from '../schemas/content.ts'

export type PersonaId = 'full' | 'swe-manager'

export type ResourcePriority = 'essential' | 'recommended' | 'optional' | 'skip'

export interface Persona {
  id: PersonaId
  label: string
  subtitle: string
  summary: string
  goals: string[]
  phaseOrder: string[]
  phaseOverrides: Record<
    string,
    { description?: string; estimatedWeeks?: string; note?: string }
  >
  resources: Record<string, ResourcePriority>
  resourceNotes: Record<string, string>
}

export const PERSONAS = personasSchema.parse(rawPersonas) as Record<
  PersonaId,
  Persona
>

export const PRIORITY_LABELS: Record<ResourcePriority, string> = {
  essential: 'Essential',
  recommended: 'Recommended',
  optional: 'Optional',
  skip: 'Skip',
}

export function getResourcePriority(
  personaId: PersonaId,
  resourceId: string,
): ResourcePriority {
  if (personaId === 'full') return 'essential'
  return PERSONAS[personaId].resources[resourceId] ?? 'optional'
}

export function getPersonaResourceIds(
  personaId: PersonaId,
  allIds: string[],
  priorities: ResourcePriority[],
): string[] {
  if (personaId === 'full') return allIds
  return allIds.filter((id) =>
    priorities.includes(getResourcePriority(personaId, id)),
  )
}
