import type { Difficulty, ResourceType } from '../types'

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
}

export function difficultyLabel(d: Difficulty) {
  return DIFFICULTY_LABELS[d]
}

export function typeIcon(type: ResourceType): string {
  const icons: Record<ResourceType, string> = {
    video: '▶',
    repo: '⎇',
    guide: '◈',
    book: '▤',
    paper: '◎',
    course: '◉',
    newsletter: '✉',
  }
  return icons[type]
}
