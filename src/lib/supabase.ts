import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url =
  import.meta.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL
const publishableKey =
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && publishableKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, publishableKey!)
  : null

export interface UserProfileRow {
  user_id: string
  persona_id: 'full' | 'swe-manager'
  updated_at: string
}

export interface UserProgressRow {
  user_id: string
  resource_id: string
  completed_at: string
}
