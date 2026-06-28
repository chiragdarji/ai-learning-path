import type { PersonaId } from '../data/personas'
import { getPersonaResourceIds } from '../data/personas'

export function usePersonaProgress(
  personaId: PersonaId,
  allIds: string[],
  isComplete: (id: string) => boolean,
) {
  const trackIds =
    personaId === 'full' || personaId === 'ic-engineer'
      ? allIds
      : getPersonaResourceIds(personaId, allIds, ['essential', 'recommended', 'optional'])

  const essentialIds =
    personaId === 'full' || personaId === 'ic-engineer'
      ? allIds
      : getPersonaResourceIds(personaId, allIds, ['essential'])

  const trackDone = trackIds.filter(isComplete).length
  const essentialDone = essentialIds.filter(isComplete).length

  return { trackIds, essentialIds, trackDone, essentialDone }
}
