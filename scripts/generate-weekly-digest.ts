/**
 * Weekly digest generator (D5) — outputs markdown for email or GitHub Action artifact.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { learningPathSchema } from '../src/schemas/content.ts'
import { personasSchema } from '../src/schemas/content.ts'

const root = join(import.meta.dirname, '..')
const phases = learningPathSchema.parse(
  JSON.parse(readFileSync(join(root, 'content/learning-path.json'), 'utf8')),
)
const personas = personasSchema.parse(
  JSON.parse(readFileSync(join(root, 'content/personas.json'), 'utf8')),
)
const news = JSON.parse(
  readFileSync(join(root, 'content/ai-news-radar.json'), 'utf8'),
)

const manager = personas['swe-manager']
const essentialIds = Object.entries(manager.resources)
  .filter(([, p]) => p === 'essential')
  .map(([id]) => id)
  .slice(0, 3)

const resources = phases.flatMap((p) =>
  p.steps.flatMap((s) => s.resources.map((r) => ({ ...r, phaseTitle: p.title }))),
)
const picks = essentialIds
  .map((id) => resources.find((r) => r.id === id))
  .filter(Boolean)

const highlight = news.recentHighlights?.[0]

const lines = [
  '# AI Learning Path — Weekly Digest',
  '',
  `Generated: ${new Date().toISOString().slice(0, 10)}`,
  '',
  '## 3 essential resources this week',
  ...picks.map(
    (r, i) =>
      `${i + 1}. **${r!.title}** (${r!.phaseTitle}) — ${r!.url}`,
  ),
  '',
  '## Top news → learning action',
  highlight
    ? `- **${highlight.headline}** (${highlight.month})\n  → ${highlight.learningAction}`
    : '- Check [awesome-ai-news](https://github.com/GetStream/awesome-ai-news) for this month.',
  '',
  '---',
  'Browse the full path: https://www.vidyanix.ai',
]

const outDir = join(root, 'dist-digest')
mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, 'weekly-digest.md')
writeFileSync(outPath, lines.join('\n'))
console.log(`Wrote ${outPath}`)
