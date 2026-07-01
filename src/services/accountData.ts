import { supabase } from '../lib/supabase'

const USER_TABLES = [
  'user_progress',
  'user_resource_notes',
  'digest_subscriptions',
  'user_profiles',
] as const

const LOCAL_KEYS = ['ai-learning-path-progress', 'ai-learning-path-persona']

export async function deleteAccountData(
  userId: string,
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Sync not configured.' }

  for (const table of USER_TABLES) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId)
    if (error) return { error: error.message }
  }

  for (const key of LOCAL_KEYS) localStorage.removeItem(key)
  return {}
}
