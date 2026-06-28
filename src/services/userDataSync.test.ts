import { describe, expect, it } from 'vitest'
import { mergeProgressSets } from '../services/userDataSync'

describe('mergeProgressSets', () => {
  it('unions local and cloud ids', () => {
    const merged = mergeProgressSets(new Set(['a', 'b']), new Set(['b', 'c']))
    expect([...merged].sort()).toEqual(['a', 'b', 'c'])
  })

  it('returns copy when one side is empty', () => {
    expect([...mergeProgressSets(new Set(['x']), new Set())]).toEqual(['x'])
  })
})
