import { describe, it, expect, vi, beforeEach } from 'vitest'

const deleteChain = () => {
  const eq = vi.fn().mockResolvedValue({ error: null })
  return { delete: vi.fn(() => ({ eq })), _eq: eq }
}

const tables: Record<string, ReturnType<typeof deleteChain>> = {}
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn((name: string) => {
      tables[name] = tables[name] ?? deleteChain()
      return tables[name]
    }),
  },
}))

import { deleteAccountData } from './accountData'

const store: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (k: string) => (k in store ? store[k] : null),
  setItem: (k: string, v: string) => {
    store[k] = v
  },
  removeItem: (k: string) => {
    delete store[k]
  },
  clear: () => {
    for (const k of Object.keys(store)) delete store[k]
  },
})

beforeEach(() => {
  for (const k of Object.keys(tables)) delete tables[k]
  localStorage.clear()
  localStorage.setItem('ai-learning-path-progress', '["r1"]')
  localStorage.setItem('ai-learning-path-persona', 'full')
})

describe('deleteAccountData', () => {
  it('deletes rows from every user-owned table and clears local storage', async () => {
    const result = await deleteAccountData('user-1')
    expect(result.error).toBeUndefined()
    for (const table of [
      'user_progress',
      'user_resource_notes',
      'digest_subscriptions',
      'user_profiles',
    ]) {
      expect(tables[table].delete).toHaveBeenCalled()
    }
    expect(localStorage.getItem('ai-learning-path-progress')).toBeNull()
    expect(localStorage.getItem('ai-learning-path-persona')).toBeNull()
  })

  it('stops and reports when a table delete errors, leaving local storage intact', async () => {
    const failing = deleteChain()
    failing._eq.mockResolvedValueOnce({ error: { message: 'nope' } })
    tables['user_progress'] = failing
    const result = await deleteAccountData('user-1')
    expect(result.error).toBe('nope')
    expect(localStorage.getItem('ai-learning-path-progress')).not.toBeNull()
  })
})
