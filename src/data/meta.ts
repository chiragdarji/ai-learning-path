import meta from '../../content/meta.json' with { type: 'json' }

export interface CurriculumMeta {
  version: string
  label: string
  releasedAt: string
  description: string
}

export const CURRICULUM_META = meta as CurriculumMeta
