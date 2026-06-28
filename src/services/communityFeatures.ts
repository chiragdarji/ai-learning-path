import { supabase } from '../lib/supabase'

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface ResourceSubmission {
  id: string
  title: string
  url: string
  resource_type: string
  difficulty: string
  description: string
  suggested_phase_id: string | null
  status: SubmissionStatus
  admin_notes: string | null
  created_at: string
}

export async function submitResource(input: {
  title: string
  url: string
  resource_type: string
  difficulty: string
  description: string
  suggested_phase_id?: string
}): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Sign in required to submit resources.' }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Sign in required to submit resources.' }

  const { error } = await supabase.from('resource_submissions').insert({
    submitter_id: user.id,
    title: input.title.trim(),
    url: input.url.trim(),
    resource_type: input.resource_type,
    difficulty: input.difficulty,
    description: input.description.trim(),
    suggested_phase_id: input.suggested_phase_id ?? null,
  })

  return { error: error?.message }
}

export async function fetchPendingSubmissions(): Promise<ResourceSubmission[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('resource_submissions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ResourceSubmission[]
}

export async function reviewSubmission(
  id: string,
  status: 'approved' | 'rejected',
  admin_notes?: string,
): Promise<void> {
  if (!supabase) return

  const { error } = await supabase
    .from('resource_submissions')
    .update({
      status,
      admin_notes: admin_notes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw error
}

export async function fetchResourceNote(
  userId: string,
  resourceId: string,
): Promise<{ body: string; visibility: 'private' | 'shared' } | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('user_resource_notes')
    .select('body, visibility')
    .eq('user_id', userId)
    .eq('resource_id', resourceId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return {
    body: data.body,
    visibility: data.visibility === 'shared' ? 'shared' : 'private',
  }
}

export async function fetchSharedNotesForResource(
  resourceId: string,
): Promise<Array<{ body: string }>> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('user_resource_notes')
    .select('body')
    .eq('resource_id', resourceId)
    .eq('visibility', 'shared')
    .limit(5)

  if (error) throw error
  return data ?? []
}

export async function upsertResourceNote(
  userId: string,
  resourceId: string,
  body: string,
  visibility: 'private' | 'shared',
): Promise<void> {
  if (!supabase) return

  const trimmed = body.trim()
  if (!trimmed) {
    const { error } = await supabase
      .from('user_resource_notes')
      .delete()
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
    if (error) throw error
    return
  }

  const { error } = await supabase.from('user_resource_notes').upsert({
    user_id: userId,
    resource_id: resourceId,
    body: trimmed,
    visibility,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export async function subscribeDigest(
  email: string,
  userId?: string,
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Sync not configured.' }

  const { error } = await supabase.from('digest_subscriptions').upsert({
    email: email.trim(),
    user_id: userId ?? null,
  })

  return { error: error?.message }
}

export interface TeamSummary {
  id: string
  name: string
  owner_id: string
}

export interface AssignmentRow {
  id: string
  resource_id: string
  assignee_id: string
  note: string | null
  created_at: string
}

export async function fetchOwnedTeams(userId: string): Promise<TeamSummary[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('teams')
    .select('id, name, owner_id')
    .eq('owner_id', userId)

  if (error) throw error
  return data ?? []
}

export async function fetchMyAssignments(userId: string): Promise<AssignmentRow[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('resource_assignments')
    .select('id, resource_id, assignee_id, note, created_at')
    .eq('assignee_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createTeam(
  userId: string,
  name: string,
): Promise<{ error?: string; teamId?: string }> {
  if (!supabase) return { error: 'Sign in required.' }

  const { data, error } = await supabase
    .from('teams')
    .insert({ name: name.trim(), owner_id: userId })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await supabase.from('team_members').insert({
    team_id: data.id,
    user_id: userId,
    role: 'owner',
  })

  return { teamId: data.id }
}

export async function assignResource(input: {
  teamId: string
  resourceId: string
  assigneeId: string
  assignedBy: string
  note?: string
}): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Sign in required.' }

  const { error } = await supabase.from('resource_assignments').insert({
    team_id: input.teamId,
    resource_id: input.resourceId,
    assignee_id: input.assigneeId,
    assigned_by: input.assignedBy,
    note: input.note ?? null,
  })

  return { error: error?.message }
}

export async function fetchDigestSubscriberCount(): Promise<number> {
  if (!supabase) return 0
  const { count, error } = await supabase
    .from('digest_subscriptions')
    .select('*', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}
