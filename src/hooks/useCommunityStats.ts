import { useEffect, useState } from 'react'
import {
  fetchCommunityStats,
  type CommunityStats,
  type PhaseCompletionStat,
} from '../services/communityStats'

export function useCommunityStats() {
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    void fetchCommunityStats().then((result) => {
      if (!cancelled) {
        setStats(result)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const getPhaseStat = (phaseId: string): PhaseCompletionStat | undefined =>
    stats?.phases.get(phaseId)

  return { stats, loading, getPhaseStat }
}
