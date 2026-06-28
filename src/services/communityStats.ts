import { supabase } from '../lib/supabase'

export interface PhaseCompletionStat {
  phaseId: string
  completedLearners: number
  completionPct: number
}

export interface CommunityStats {
  totalLearners: number
  hidden: boolean
  phases: Map<string, PhaseCompletionStat>
}

interface RpcResponse {
  total_learners: number
  hidden: boolean
  phases: Array<{
    phase_id: string
    completed_learners: number
    completion_pct: number
  }>
}

export async function fetchCommunityStats(): Promise<CommunityStats | null> {
  if (!supabase) return null

  const { data, error } = await supabase.rpc('get_public_completion_stats')
  if (error) {
    console.warn('Community stats unavailable:', error.message)
    return null
  }

  const payload = data as RpcResponse
  const phases = new Map<string, PhaseCompletionStat>()
  for (const row of payload.phases ?? []) {
    phases.set(row.phase_id, {
      phaseId: row.phase_id,
      completedLearners: row.completed_learners,
      completionPct: row.completion_pct,
    })
  }

  return {
    totalLearners: payload.total_learners ?? 0,
    hidden: payload.hidden ?? true,
    phases,
  }
}

export function formatPhaseCommunityStat(stat: PhaseCompletionStat): string {
  if (stat.completedLearners === 1) {
    return '1 learner completed this phase'
  }
  return `${stat.completionPct}% of learners completed this phase`
}
