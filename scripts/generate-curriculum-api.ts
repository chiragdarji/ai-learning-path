/**
 * Build public curriculum JSON API (D6).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { learningPathSchema, personasSchema, aiNewsRadarSchema } from '../src/schemas/content.ts'

const root = join(import.meta.dirname, '..')

const rawPersonas = JSON.parse(
  readFileSync(join(root, 'content/personas.json'), 'utf8'),
)
const phaseDPersonas = JSON.parse(
  readFileSync(join(root, 'content/personas-phase-d.json'), 'utf8'),
)

const mergedPersonas = {
  ...rawPersonas,
  ...phaseDPersonas,
  'product-manager': {
    ...phaseDPersonas['product-manager'],
    resources: rawPersonas['swe-manager'].resources,
  },
}

const learningPath = learningPathSchema.parse(
  JSON.parse(readFileSync(join(root, 'content/learning-path.json'), 'utf8')),
)
const personas = personasSchema.parse(mergedPersonas)
const news = aiNewsRadarSchema.parse(
  JSON.parse(readFileSync(join(root, 'content/ai-news-radar.json'), 'utf8')),
)
const meta = JSON.parse(readFileSync(join(root, 'content/meta.json'), 'utf8'))

const outDir = join(root, 'public/api/v1')
mkdirSync(outDir, { recursive: true })

const payload = {
  meta,
  generatedAt: new Date().toISOString(),
  learningPath,
  personas,
  newsRadar: news,
}

writeFileSync(join(outDir, 'curriculum.json'), JSON.stringify(payload, null, 2))
console.log('Wrote public/api/v1/curriculum.json')
