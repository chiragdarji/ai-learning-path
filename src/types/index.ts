export type ResourceType =
  | 'video'
  | 'repo'
  | 'guide'
  | 'book'
  | 'paper'
  | 'course'
  | 'newsletter'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface Resource {
  id: string
  title: string
  url: string
  type: ResourceType
  difficulty: Difficulty
  duration?: string
  description: string
  tags: string[]
}

export interface Step {
  id: string
  title: string
  objective: string
  resources: Resource[]
}

export interface Phase {
  id: string
  number: number
  title: string
  level: Difficulty
  levelLabel: string
  description: string
  estimatedWeeks: string
  steps: Step[]
}

export const DIFFICULTY_ORDER: Difficulty[] = [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]

export const TYPE_LABELS: Record<ResourceType, string> = {
  video: 'Video',
  repo: 'Repository',
  guide: 'Guide',
  book: 'Book',
  paper: 'Paper',
  course: 'Course',
  newsletter: 'Newsletter',
}
