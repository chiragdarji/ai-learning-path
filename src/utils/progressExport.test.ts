import { describe, expect, it } from 'vitest'
import {
  buildProgressExport,
  parseProgressFile,
} from './progressExport'

describe('buildProgressExport', () => {
  it('sorts completed ids and sets version', () => {
    const result = buildProgressExport(new Set(['b', 'a', 'c']))
    expect(result.version).toBe(1)
    expect(result.completed).toEqual(['a', 'b', 'c'])
    expect(result.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})

describe('parseProgressFile', () => {
  it('parses versioned export format', () => {
    const json = JSON.stringify({
      version: 1,
      exportedAt: '2026-06-01T00:00:00.000Z',
      completed: ['llm-intro-video', 'prompt-guide'],
    })
    expect(parseProgressFile(json)).toEqual([
      'llm-intro-video',
      'prompt-guide',
    ])
  })

  it('parses legacy array format', () => {
    expect(parseProgressFile(JSON.stringify(['a', 'b']))).toEqual(['a', 'b'])
  })

  it('filters non-string entries', () => {
    const json = JSON.stringify({
      version: 1,
      exportedAt: '2026-06-01T00:00:00.000Z',
      completed: ['valid', 42, null],
    })
    expect(parseProgressFile(json)).toEqual(['valid'])
  })

  it('throws on invalid format', () => {
    expect(() => parseProgressFile('{"foo": 1}')).toThrow(
      'Invalid progress file format',
    )
  })
})

describe('import merge behavior', () => {
  it('merges exported progress with existing set', () => {
    const existing = new Set(['a'])
    const imported = parseProgressFile(
      JSON.stringify({ version: 1, exportedAt: '', completed: ['b', 'c'] }),
    )
    const merged = new Set([...existing, ...imported])
    expect([...merged].sort()).toEqual(['a', 'b', 'c'])
  })
})
