/**
 * Draft news highlights from awesome-ai-news README.
 * Run: npx tsx scripts/sync-news-highlights.ts
 * Review output in content/news-highlights-draft.json before merging.
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const README_URL =
  'https://raw.githubusercontent.com/GetStream/awesome-ai-news/main/README.md'

interface DraftHighlight {
  id: string
  headline: string
  month: string
  themeId: string
  learningAction: string
  phaseId: string
}

function parseLatestMonthSection(markdown: string): {
  month: string
  headlines: string[]
} | null {
  const monthHeading = markdown.match(/^## ([A-Za-z]+ \d{4})\s*$/m)
  if (!monthHeading) return null

  const month = monthHeading[1]!
  const start = markdown.indexOf(monthHeading[0])
  const rest = markdown.slice(start + monthHeading[0].length)
  const nextHeading = rest.search(/^## /m)
  const section = nextHeading === -1 ? rest : rest.slice(0, nextHeading)

  const headlines = [...section.matchAll(/^- (.+)$/gm)]
    .map((m) => m[1]!.trim())
    .filter((line) => line.length > 0 && !line.startsWith('http'))

  return { month, headlines: headlines.slice(0, 12) }
}

async function main() {
  const response = await fetch(README_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch README: ${response.status}`)
  }

  const markdown = await response.text()
  const parsed = parseLatestMonthSection(markdown)

  if (!parsed || parsed.headlines.length === 0) {
    throw new Error('Could not parse headlines from README')
  }

  const drafts: DraftHighlight[] = parsed.headlines.map((headline, index) => ({
    id: `draft-${index + 1}`,
    headline,
    month: parsed.month,
    themeId: 'agent-frameworks',
    learningAction: 'Review theme bridges in ai-news-radar.json and pick one resource',
    phaseId: 'ai-news-radar',
  }))

  const outPath = join(import.meta.dirname, '../content/news-highlights-draft.json')
  writeFileSync(outPath, `${JSON.stringify(drafts, null, 2)}\n`)
  console.log(`Wrote ${drafts.length} draft highlights for ${parsed.month}`)
  console.log(`Review: ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
