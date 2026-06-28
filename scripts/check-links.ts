import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  collectResourceIds,
  learningPathSchema,
  type LearningPathData,
} from '../src/schemas/content.ts'

const root = join(import.meta.dirname, '..')
const CONCURRENCY = 8
const TIMEOUT_MS = 15_000

interface LinkResult {
  id: string
  url: string
  status: number | 'error'
  error?: string
}

function loadLearningPath(): LearningPathData {
  const raw = JSON.parse(
    readFileSync(join(root, 'content/learning-path.json'), 'utf8'),
  )
  return learningPathSchema.parse(raw)
}

function collectUrls(phases: LearningPathData): { id: string; url: string }[] {
  const urls: { id: string; url: string }[] = []
  for (const phase of phases) {
    for (const step of phase.steps) {
      for (const resource of step.resources) {
        urls.push({ id: resource.id, url: resource.url })
      }
    }
  }
  return urls
}

async function checkUrl(
  id: string,
  url: string,
): Promise<LinkResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    let response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'ai-learning-path-link-checker/1.0' },
    })

    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'User-Agent': 'ai-learning-path-link-checker/1.0' },
      })
    }

    return { id, url, status: response.status }
  } catch (err) {
    return {
      id,
      url,
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
    }
  } finally {
    clearTimeout(timer)
  }
}

async function runPool<T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = []
  let index = 0

  async function next(): Promise<void> {
    const i = index++
    if (i >= items.length) return
    results[i] = await worker(items[i]!)
    await next()
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => next()),
  )
  return results
}

function isOk(status: number | 'error'): boolean {
  if (status === 'error') return false
  return status >= 200 && status < 400
}

async function main() {
  const phases = loadLearningPath()
  const urls = collectUrls(phases)
  const resourceCount = collectResourceIds(phases).length

  console.log(`Checking ${urls.length} resource URLs (${resourceCount} unique ids)...`)

  const results = await runPool(
    urls,
    ({ id, url }) => checkUrl(id, url),
    CONCURRENCY,
  )

  const failures = results.filter((r) => !isOk(r.status))

  for (const r of results) {
    const label = isOk(r.status) ? 'OK' : 'FAIL'
    const detail =
      r.status === 'error' ? r.error : String(r.status)
    console.log(`[${label}] ${r.id} (${detail}) — ${r.url}`)
  }

  console.log(
    `\n${results.length - failures.length}/${results.length} links OK`,
  )

  if (failures.length > 0) {
    process.exit(1)
  }
}

main()
