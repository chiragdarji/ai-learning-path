/**
 * Merge news-highlights-draft.json into content/ai-news-radar.json recentHighlights.
 * Run after sync-news-highlights.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { validateAllContent } from '../src/schemas/content.ts'

const root = join(import.meta.dirname, '..')
const draftPath = join(root, 'content/news-highlights-draft.json')
const newsPath = join(root, 'content/ai-news-radar.json')
const learningPath = join(root, 'content/learning-path.json')
const personasPath = join(root, 'content/personas.json')

interface DraftHighlight {
  headline: string
  month: string
  themeId: string
  learningAction: string
  phaseId: string
}

const THEME_RULES: { themeId: string; phaseId: string; keywords: RegExp }[] = [
  {
    themeId: 'agent-frameworks',
    phaseId: 'agent-foundations',
    keywords: /agent framework|agent sdk|agentic ide|openai agent|vercel eve|skills/i,
  },
  {
    themeId: 'coding-agents',
    phaseId: 'production-agents',
    keywords: /codex|claude code|cursor|copilot|karpathy|coding agent|xcode/i,
  },
  {
    themeId: 'mcp-protocols',
    phaseId: 'production-agents',
    keywords: /mcp|agent skills|a2a|protocol|agents\.md|commerce/i,
  },
  {
    themeId: 'voice-ai',
    phaseId: 'ai-news-radar',
    keywords: /voice|realtime|speech|translate|live api|deepgram|elevenlabs/i,
  },
  {
    themeId: 'model-releases',
    phaseId: 'llm-fundamentals',
    keywords: /gpt-|claude|gemini|qwen|deepseek|model release|open-weight|ollama/i,
  },
  {
    themeId: 'rag-retrieval',
    phaseId: 'applied-llm',
    keywords: /rag|retrieval|vector|file search|knowledge/i,
  },
  {
    themeId: 'multi-agent',
    phaseId: 'expert-mastery',
    keywords: /multi-agent|swarm|orchestr|crew|antigravity/i,
  },
  {
    themeId: 'enterprise-llmops',
    phaseId: 'expert-mastery',
    keywords: /enterprise|llmops|frontier|observability|testing|platform/i,
  },
]

function inferTheme(headline: string): { themeId: string; phaseId: string } {
  for (const rule of THEME_RULES) {
    if (rule.keywords.test(headline)) {
      return { themeId: rule.themeId, phaseId: rule.phaseId }
    }
  }
  return { themeId: 'agent-frameworks', phaseId: 'ai-news-radar' }
}

function main() {
  let draftRaw: unknown
  try {
    draftRaw = JSON.parse(readFileSync(draftPath, 'utf8'))
  } catch {
    console.error('No draft file — run sync-news-highlights.ts first')
    process.exit(1)
  }

  if (!Array.isArray(draftRaw) || draftRaw.length === 0) {
    console.error('Draft is empty')
    process.exit(1)
  }

  const news = JSON.parse(readFileSync(newsPath, 'utf8')) as {
    recentHighlights: DraftHighlight[]
    [key: string]: unknown
  }

  const highlights = (draftRaw as DraftHighlight[]).slice(0, 8).map((item, index) => {
    const inferred = inferTheme(item.headline)
    return {
      id: `h${index + 1}`,
      headline: item.headline,
      month: item.month,
      themeId: inferred.themeId,
      learningAction:
        item.learningAction ||
        `Review ${inferred.themeId} learning bridge → pick one curriculum resource`,
      phaseId: inferred.phaseId,
    }
  })

  news.recentHighlights = highlights
  writeFileSync(newsPath, `${JSON.stringify(news, null, 2)}\n`)

  validateAllContent(
    JSON.parse(readFileSync(learningPath, 'utf8')),
    JSON.parse(readFileSync(personasPath, 'utf8')),
    news,
  )

  console.log(`Merged ${highlights.length} highlights into content/ai-news-radar.json`)
}

main()
