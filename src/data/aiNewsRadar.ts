import rawNews from '../../content/ai-news-radar.json' with { type: 'json' }
import { aiNewsRadarSchema } from '../schemas/content.ts'

const news = aiNewsRadarSchema.parse(rawNews)

export interface LearningBridge {
  id: string
  theme: string
  icon: string
  newsSignal: string
  recentExamples: string[]
  managerAction: string
  phaseId: string
  phaseTitle: string
  curriculumResourceIds: string[]
  phase7ResourceIds: string[]
}

export interface NewsHighlight {
  id: string
  headline: string
  month: string
  themeId: string
  learningAction: string
  phaseId: string
}

export const AWESOME_AI_NEWS = news.awesomeAiNews
export const MONTHLY_RITUAL = news.monthlyRitual
export const LEARNING_BRIDGES: LearningBridge[] = news.learningBridges
export const RECENT_HIGHLIGHTS: NewsHighlight[] = news.recentHighlights

export function getBridgeByTheme(themeId: string) {
  return LEARNING_BRIDGES.find((b) => b.id === themeId)
}
