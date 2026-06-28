import { useEffect } from 'react'

const SITE_URL = 'https://www.vidyanix.ai'
const DEFAULT_TITLE = 'AI Learning Path — Beginner to Expert'
const DEFAULT_DESCRIPTION =
  'Step-by-step AI engineering curriculum: LLMs, RAG, agents, MCP, and production patterns.'

function upsertMeta(
  selector: string,
  attributes: Record<string, string>,
  content: string,
) {
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    for (const [key, value] of Object.entries(attributes)) {
      el.setAttribute(key, value)
    }
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta(title: string, description: string, path = '/') {
  useEffect(() => {
    const fullTitle = title === DEFAULT_TITLE ? title : `${title} · AI Learning Path`
    const url = `${SITE_URL}${path}`

    document.title = fullTitle
    upsertMeta('meta[name="description"]', { name: 'description' }, description)
    upsertMeta('meta[property="og:title"]', { property: 'og:title' }, fullTitle)
    upsertMeta(
      'meta[property="og:description"]',
      { property: 'og:description' },
      description,
    )
    upsertMeta('meta[property="og:url"]', { property: 'og:url' }, url)
    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, 'website')
    upsertMeta(
      'meta[name="twitter:card"]',
      { name: 'twitter:card' },
      'summary',
    )
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, fullTitle)
    upsertMeta(
      'meta[name="twitter:description"]',
      { name: 'twitter:description' },
      description,
    )
  }, [title, description, path])
}

export { DEFAULT_TITLE, DEFAULT_DESCRIPTION }
