/**
 * One-time / maintenance script: export TS content modules to JSON.
 * Run: npx tsx scripts/extract-content.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { LEARNING_PATH } from '../src/data/learningPath.ts'
import { PERSONAS } from '../src/data/personas.ts'
import {
  AWESOME_AI_NEWS,
  LEARNING_BRIDGES,
  MONTHLY_RITUAL,
  RECENT_HIGHLIGHTS,
} from '../src/data/aiNewsRadar.ts'

mkdirSync('content', { recursive: true })

writeFileSync(
  'content/learning-path.json',
  `${JSON.stringify(LEARNING_PATH, null, 2)}\n`,
)
writeFileSync('content/personas.json', `${JSON.stringify(PERSONAS, null, 2)}\n`)
writeFileSync(
  'content/ai-news-radar.json',
  `${JSON.stringify(
    {
      awesomeAiNews: AWESOME_AI_NEWS,
      monthlyRitual: MONTHLY_RITUAL,
      learningBridges: LEARNING_BRIDGES,
      recentHighlights: RECENT_HIGHLIGHTS,
    },
    null,
    2,
  )}\n`,
)

console.log('Wrote content/learning-path.json, personas.json, ai-news-radar.json')
