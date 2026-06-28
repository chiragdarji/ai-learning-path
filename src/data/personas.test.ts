import { describe, expect, it } from 'vitest'
import { LEARNING_PATH } from './learningPath'
import {
  getPersonaResourceIds,
  getResourcePriority,
  PERSONAS,
} from './personas'

describe('getResourcePriority', () => {
  it('returns essential for all resources on full track', () => {
    expect(getResourcePriority('full', 'ml-beginners')).toBe('essential')
    expect(getResourcePriority('full', 'unknown-id')).toBe('essential')
  })

  it('returns essential for ic-engineer like full track', () => {
    expect(getResourcePriority('ic-engineer', 'ml-beginners')).toBe('essential')
  })

  it('returns persona-specific priority for manager track', () => {
    expect(getResourcePriority('swe-manager', 'dmls')).toBe('essential')
    expect(getResourcePriority('swe-manager', 'ml-beginners')).toBe('skip')
    expect(getResourcePriority('swe-manager', 'unknown-id')).toBe('optional')
  })
})

describe('getPersonaResourceIds', () => {
  const allIds = ['a', 'b', 'c', 'd']

  it('returns all ids for full track', () => {
    expect(getPersonaResourceIds('full', allIds, ['essential'])).toEqual(allIds)
  })

  it('filters manager track by priority', () => {
    const manager = PERSONAS['swe-manager']
    const essentialCount = Object.values(manager.resources).filter(
      (p) => p === 'essential',
    ).length
    const pathIds = LEARNING_PATH.flatMap((p) =>
      p.steps.flatMap((s) => s.resources.map((r) => r.id)),
    )
    const essentialIds = getPersonaResourceIds('swe-manager', pathIds, [
      'essential',
    ])
    expect(essentialIds.length).toBe(essentialCount)
    for (const id of essentialIds) {
      expect(getResourcePriority('swe-manager', id)).toBe('essential')
    }
  })
})

describe('manager persona phase order', () => {
  it('starts with llm-fundamentals and includes news radar early', () => {
    const order = PERSONAS['swe-manager'].phaseOrder
    expect(order[0]).toBe('llm-fundamentals')
    expect(order.indexOf('ai-news-radar')).toBeLessThan(
      order.indexOf('expert-mastery'),
    )
  })
})
