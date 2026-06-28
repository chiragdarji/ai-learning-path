/**
 * Post-build prerender for SEO (C10).
 * Run after vite build: npx tsx scripts/prerender-routes.ts
 */
import { spawn, type ChildProcess } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { chromium } from 'playwright'
import { learningPathSchema } from '../src/schemas/content.ts'

const PREVIEW_URL = 'http://127.0.0.1:4173'
const DIST = join(import.meta.dirname, '../dist')
const SKIP = process.env.SKIP_PRERENDER === '1'

function loadRoutes(): string[] {
  const phases = learningPathSchema.parse(
    JSON.parse(
      readFileSync(join(import.meta.dirname, '../content/learning-path.json'), 'utf8'),
    ),
  )
  return [
    '/',
    '/search',
    '/news-radar',
    '/privacy',
    ...phases.map((p) => `/phase/${p.id}`),
  ]
}

function routeToOutFile(route: string): string {
  if (route === '/') return join(DIST, 'index.html')
  return join(DIST, route.slice(1), 'index.html')
}

async function waitForServer(ms = 60_000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < ms) {
    try {
      const res = await fetch(PREVIEW_URL)
      if (res.ok) return
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Preview server did not start at ${PREVIEW_URL}`)
}

function startPreview(): ChildProcess {
  return spawn(
    'npm',
    ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'],
    { stdio: 'ignore', shell: true, cwd: join(import.meta.dirname, '..') },
  )
}

async function main() {
  if (SKIP) {
    console.log('SKIP_PRERENDER=1 — skipping prerender')
    return
  }

  const routes = loadRoutes()
  const preview = startPreview()

  try {
    await waitForServer()
    const browser = await chromium.launch()
    const page = await browser.newPage()

    for (const route of routes) {
      await page.goto(`${PREVIEW_URL}${route}`, { waitUntil: 'networkidle' })
      await page.waitForSelector('#main-content, .error-fallback', { timeout: 15_000 })
      const html = await page.content()
      const outFile = routeToOutFile(route)
      mkdirSync(dirname(outFile), { recursive: true })
      writeFileSync(outFile, html)
      console.log(`Prerendered ${route} → ${outFile.replace(DIST, 'dist')}`)
    }

    await browser.close()
    console.log(`Prerendered ${routes.length} routes`)
  } finally {
    preview.kill('SIGTERM')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
