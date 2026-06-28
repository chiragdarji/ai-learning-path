import { useCallback, useEffect, useRef, useState } from 'react'
import type { PersonaId } from '../data/personas'
import { useAuth } from '../context/AuthProvider'
import { fetchCloudPersona, upsertCloudPersona } from '../services/userDataSync'

const STORAGE_KEY = 'ai-learning-path-persona'

function readStoredPersona(): PersonaId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as PersonaId | null
    if (stored === 'full' || stored === 'swe-manager') return stored
  } catch {
    /* ignore */
  }
  return 'swe-manager'
}

export function usePersona() {
  const { user } = useAuth()
  const [personaId, setPersonaId] = useState<PersonaId>(readStoredPersona)
  const loadedForUser = useRef<string | null>(null)

  useEffect(() => {
    setPersonaId(readStoredPersona())
  }, [])

  useEffect(() => {
    if (!user) {
      loadedForUser.current = null
      return
    }
    if (loadedForUser.current === user.id) return

    let cancelled = false

    ;(async () => {
      try {
        const cloudPersona = await fetchCloudPersona(user.id)
        if (cancelled) return

        if (cloudPersona) {
          setPersonaId(cloudPersona)
          localStorage.setItem(STORAGE_KEY, cloudPersona)
        } else {
          await upsertCloudPersona(user.id, readStoredPersona())
        }
        loadedForUser.current = user.id
      } catch (err) {
        console.error('Persona sync failed:', err)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user])

  const setPersona = useCallback(
    (id: PersonaId) => {
      setPersonaId(id)
      localStorage.setItem(STORAGE_KEY, id)
      if (user) {
        void upsertCloudPersona(user.id, id).catch((err) =>
          console.error('Persona sync failed:', err),
        )
      }
    },
    [user],
  )

  return { personaId, setPersona }
}
