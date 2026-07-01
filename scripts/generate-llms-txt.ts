import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { learningPathSchema } from '../src/schemas/content.ts'

const SITE_URL = 'https://www.vidyanix.ai'
const root = join(import.meta.dirname, '..')

const phases = learningPathSchema.parse(
  JSON.parse(readFileSync(join(root, 'content/learning-path.json'), 'utf8')),
)
const meta = JSON.parse(
  readFileSync(join(root, 'content/meta.json'), 'utf8'),
) as { version: string; label: string; description: string }

const phaseLines = phases
  .map(
    (p) =>
      `- [Phase ${p.number}: ${p.title}](${SITE_URL}/phase/${p.id}) — ${p.levelLabel}. ${p.description}`,
  )
  .join('\n')

const content = `# AI Learning Path (vidyanix.ai)

> The practitioner-validated, community-curated AI engineering curriculum — a sequenced path from LLM basics to production agents, updated with what is shipping in production. Browse free, no sign-in required. Curriculum version ${meta.version} (${meta.label}): ${meta.description}

This site helps working engineers, managers, and product people learn AI engineering through a curated, link-checked path organized into phases, with persona tracks (Manager, IC Engineer, PM, Data Scientist, Full) and a monthly news-to-curriculum ritual. It is not an AI chatbot; content is human-curated.

## Curriculum phases

${phaseLines}

## Data & reference

- [Curriculum JSON API](${SITE_URL}/api/v1/curriculum.json) — full machine-readable phases, steps, and resources
- [Search resources](${SITE_URL}/search) — every resource, filterable by type and difficulty
- [AI News Radar](${SITE_URL}/news-radar) — headlines mapped to curriculum phases
- [Sitemap](${SITE_URL}/sitemap.xml)

## Notes for AI crawlers

- Canonical content lives in the curriculum JSON API above; prefer it for structured queries.
- The curriculum is versioned (\`${meta.version}\`); the API includes a \`meta\` block with the current version.
- No user data, credentials, or private notes are exposed here — only the public curriculum.
`

writeFileSync(join(root, 'public/llms.txt'), content)
console.log(`Wrote public/llms.txt (${phases.length} phases)`)
