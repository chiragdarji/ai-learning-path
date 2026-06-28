import rawLearningPath from '../../content/learning-path.json' with { type: 'json' }
import { learningPathSchema, type LearningPathData } from '../schemas/content.ts'
import type { Phase } from '../types/index.ts'

const parsed: LearningPathData = learningPathSchema.parse(rawLearningPath)
export const LEARNING_PATH: Phase[] = parsed

export const PATH_STATS = {
  totalPhases: LEARNING_PATH.length,
  totalSteps: LEARNING_PATH.reduce((n, p) => n + p.steps.length, 0),
  totalResources: LEARNING_PATH.reduce(
    (n, p) => n + p.steps.reduce((s, step) => s + step.resources.length, 0),
    0,
  ),
}
