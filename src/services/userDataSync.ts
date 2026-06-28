import type { PersonaId } from '../data/personas'
import { supabase } from '../lib/supabase'

export async function fetchCloudProgress(userId: string): Promise<Set<string>> {
  if (!supabase) return new Set()

  const { data, error } = await supabase
    .from('user_progress')
    .select('resource_id')
    .eq('user_id', userId)

  if (error) throw error
  return new Set((data ?? []).map((row) => row.resource_id))
}

export async function fetchCloudPersona(userId: string): Promise<PersonaId | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('user_profiles')
    .select('persona_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (data?.persona_id === 'full' || data?.persona_id === 'swe-manager') {
    return data.persona_id
  }
  return null
}

export async function syncProgressToCloud(
  userId: string,
  completed: Set<string>,
): Promise<void> {
  if (!supabase) return

  const { data: existing, error: fetchError } = await supabase
    .from('user_progress')
    .select('resource_id')
    .eq('user_id', userId)

  if (fetchError) throw fetchError

  const existingIds = new Set((existing ?? []).map((row) => row.resource_id))
  const toAdd = [...completed].filter((id) => !existingIds.has(id))
  const toRemove = [...existingIds].filter((id) => !completed.has(id))

  if (toAdd.length > 0) {
    const { error } = await supabase.from('user_progress').upsert(
      toAdd.map((resource_id) => ({
        user_id: userId,
        resource_id,
        completed_at: new Date().toISOString(),
      })),
    )
    if (error) throw error
  }

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId)
      .in('resource_id', toRemove)
    if (error) throw error
  }
}

export async function upsertProgressItem(
  userId: string,
  resourceId: string,
  complete: boolean,
): Promise<void> {
  if (!supabase) return

  if (complete) {
    const { error } = await supabase.from('user_progress').upsert({
      user_id: userId,
      resource_id: resourceId,
      completed_at: new Date().toISOString(),
    })
    if (error) throw error
    return
  }

  const { error } = await supabase
    .from('user_progress')
    .delete()
    .eq('user_id', userId)
    .eq('resource_id', resourceId)
  if (error) throw error
}

export async function clearCloudProgress(userId: string): Promise<void> {
  if (!supabase) return

  const { error } = await supabase
    .from('user_progress')
    .delete()
    .eq('user_id', userId)
  if (error) throw error
}

export async function upsertCloudPersona(
  userId: string,
  personaId: PersonaId,
): Promise<void> {
  if (!supabase) return

  const { error } = await supabase.from('user_profiles').upsert({
    user_id: userId,
    persona_id: personaId,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export function mergeProgressSets(
  local: Set<string>,
  cloud: Set<string>,
): Set<string> {
  return new Set([...local, ...cloud])
}
