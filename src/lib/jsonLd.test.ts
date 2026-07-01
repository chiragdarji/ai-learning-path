import { describe, it, expect } from 'vitest'
import { phaseCourseJsonLd, curriculumJsonLd } from './jsonLd'
import type { Phase } from '../types'

const phase = {
  id: 'llm-fundamentals',
  number: 2,
  title: 'LLM Fundamentals',
  level: 'beginner',
  levelLabel: 'Beginner → Intermediate',
  description: 'Understand how transformers work and how to prompt effectively.',
  estimatedWeeks: '3 weeks',
  steps: [],
} as unknown as Phase

describe('phaseCourseJsonLd', () => {
  it('builds a schema.org Course for a phase', () => {
    const data = phaseCourseJsonLd(phase)
    expect(data['@context']).toBe('https://schema.org')
    expect(data['@type']).toBe('Course')
    expect(data.name).toBe('LLM Fundamentals')
    expect(data.description).toBe(phase.description)
    expect(data.url).toBe('https://www.vidyanix.ai/phase/llm-fundamentals')
    expect(data.educationalLevel).toBe('Beginner → Intermediate')
    expect(data.provider).toMatchObject({ '@type': 'Organization' })
  })
})

describe('curriculumJsonLd', () => {
  it('builds an ItemList of phase courses', () => {
    const data = curriculumJsonLd([phase, { ...phase, id: 'applied-llm', number: 3, title: 'Applied LLM' } as Phase])
    expect(data['@type']).toBe('ItemList')
    expect(data.itemListElement).toHaveLength(2)
    expect(data.itemListElement[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      name: 'LLM Fundamentals',
      url: 'https://www.vidyanix.ai/phase/llm-fundamentals',
    })
    expect(data.itemListElement[1].position).toBe(2)
  })
})
