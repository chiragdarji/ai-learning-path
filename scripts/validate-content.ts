import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { validateAllContent } from '../src/schemas/content.ts'

const root = join(import.meta.dirname, '..')

function loadJson(relativePath: string): unknown {
  const text = readFileSync(join(root, relativePath), 'utf8')
  return JSON.parse(text)
}

const rawPersonas = loadJson('content/personas.json') as Record<string, unknown>
const phaseDPersonas = loadJson('content/personas-phase-d.json') as Record<
  string,
  Record<string, unknown>
>

const mergedPersonas = {
  ...rawPersonas,
  ...phaseDPersonas,
  'product-manager': {
    ...phaseDPersonas['product-manager'],
    resources: (rawPersonas['swe-manager'] as Record<string, unknown>).resources,
  },
}

try {
  validateAllContent(
    loadJson('content/learning-path.json'),
    mergedPersonas,
    loadJson('content/ai-news-radar.json'),
  )
  console.log('Content validation passed.')
} catch (err) {
  console.error('Content validation failed:')
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
}
