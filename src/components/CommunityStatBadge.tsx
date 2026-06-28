import {
  formatPhaseCommunityStat,
  type PhaseCompletionStat,
} from '../services/communityStats'

interface CommunityStatBadgeProps {
  stat: PhaseCompletionStat | undefined
  loading?: boolean
}

export function CommunityStatBadge({ stat, loading }: CommunityStatBadgeProps) {
  if (loading || !stat || stat.completedLearners === 0) return null

  return (
    <span className="community-stat" title={formatPhaseCommunityStat(stat)}>
      {formatPhaseCommunityStat(stat)}
    </span>
  )
}
