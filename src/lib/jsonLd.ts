import type { Phase } from '../types'

const SITE_URL = 'https://www.vidyanix.ai'

const provider = {
  '@type': 'Organization' as const,
  name: 'Vidyanix — AI Learning Path',
  url: SITE_URL,
}

export interface CourseJsonLd {
  '@context': 'https://schema.org'
  '@type': 'Course'
  name: string
  description: string
  url: string
  educationalLevel: string
  provider: typeof provider
}

export interface CurriculumJsonLd {
  '@context': 'https://schema.org'
  '@type': 'ItemList'
  name: string
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    url: string
  }>
}

export function phaseCourseJsonLd(phase: Phase): CourseJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: phase.title,
    description: phase.description,
    url: `${SITE_URL}/phase/${phase.id}`,
    educationalLevel: phase.levelLabel,
    provider,
  }
}

export function curriculumJsonLd(phases: Phase[]): CurriculumJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AI Engineering Curriculum',
    itemListElement: phases.map((phase, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: phase.title,
      url: `${SITE_URL}/phase/${phase.id}`,
    })),
  }
}
