import { LEARNING_PATH } from '../data/learningPath'
import type { Difficulty, Resource, ResourceType } from '../types'

export interface IndexedResource extends Resource {
  phaseId: string
  phaseTitle: string
  stepTitle: string
}

export function buildResourceIndex(): IndexedResource[] {
  return LEARNING_PATH.flatMap((phase) =>
    phase.steps.flatMap((step) =>
      step.resources.map((resource) => ({
        ...resource,
        phaseId: phase.id,
        phaseTitle: phase.title,
        stepTitle: step.title,
      })),
    ),
  )
}

export const ALL_RESOURCE_TYPES: ResourceType[] = [
  'video',
  'repo',
  'guide',
  'book',
  'paper',
  'course',
  'newsletter',
]

export const ALL_DIFFICULTIES: Difficulty[] = [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]
