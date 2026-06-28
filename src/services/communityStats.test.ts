import { describe, expect, it } from 'vitest'
import { formatPhaseCommunityStat } from './communityStats'

describe('formatPhaseCommunityStat', () => {
  it('uses singular copy for one learner', () => {
    expect(
      formatPhaseCommunityStat({
        phaseId: 'llm-fundamentals',
        completedLearners: 1,
        completionPct: 20,
      }),
    ).toBe('1 learner completed this phase')
  })

  it('uses percentage for multiple learners', () => {
    expect(
      formatPhaseCommunityStat({
        phaseId: 'llm-fundamentals',
        completedLearners: 4,
        completionPct: 42,
      }),
    ).toBe('42% of learners completed this phase')
  })
})
