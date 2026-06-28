import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { learningPathSchema } from '../src/schemas/content.ts'

const SITE_URL = 'https://www.vidyanix.ai'
const root = join(import.meta.dirname, '..')

const phases = learningPathSchema.parse(
  JSON.parse(readFileSync(join(root, 'content/learning-path.json'), 'utf8')),
)

const urls = [
  `${SITE_URL}/`,
  `${SITE_URL}/news-radar`,
  ...phases.map((p) => `${SITE_URL}/phase/${p.id}`),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n')}
</urlset>
`

writeFileSync(join(root, 'public/sitemap.xml'), xml)
console.log(`Wrote public/sitemap.xml (${urls.length} URLs)`)
