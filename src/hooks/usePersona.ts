import { useCallback, useEffect, useState } from 'react'
import type { PersonaId } from '../data/personas'

const STORAGE_KEY = 'ai-learning-path-persona'

export function usePersona() {
  const [personaId, setPersonaId] = useState<PersonaId>('swe-manager')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as PersonaId | null
      if (stored === 'full' || stored === 'swe-manager') setPersonaId(stored)
    } catch {
      /* ignore */
    }
  }, [])

  const setPersona = useCallback((id: PersonaId) => {
    setPersonaId(id)
    localStorage.setItem(STORAGE_KEY, id)
  }, [])

  return { personaId, setPersona }
}
