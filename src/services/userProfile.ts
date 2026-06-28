import type { PersonaId } from '../data/personas'
import { supabase } from '../lib/supabase'

export interface UserProfile {
  persona_id: PersonaId
  is_admin: boolean
  curriculum_version: string
  locale: 'en' | 'es'
}

const PERSONA_IDS: PersonaId[] = [
  'full',
  'swe-manager',
  'product-manager',
  'ic-engineer',
  'data-scientist',
]

function parsePersonaId(value: string | undefined): PersonaId | null {
  if (value && PERSONA_IDS.includes(value as PersonaId)) {
    return value as PersonaId
  }
  return null
}

export async function fetchUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('user_profiles')
    .select('persona_id, is_admin, curriculum_version, locale')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const persona = parsePersonaId(data.persona_id)
  if (!persona) return null

  return {
    persona_id: persona,
    is_admin: Boolean(data.is_admin),
    curriculum_version: data.curriculum_version ?? '2026-q2',
    locale: data.locale === 'es' ? 'es' : 'en',
  }
}

export async function upsertUserLocale(
  userId: string,
  locale: 'en' | 'es',
): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('user_profiles').upsert({
    user_id: userId,
    locale,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  const raw = import.meta.env.VITE_ADMIN_EMAILS ?? ''
  const list = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return list.includes(email.toLowerCase())
}
