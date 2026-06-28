/**
 * Apply migration via Supabase Management API (uses SUPABASE_ACCESS_TOKEN).
 * Fallback: scripts/run-supabase-migration.ts with SUPABASE_DB_PASSWORD.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const PROJECT_REF = 'zzwavrajcrpruubfbjnm'

function loadEnvFile() {
  try {
    const text = readFileSync(join(import.meta.dirname, '../.env'), 'utf8')
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim()
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    /* ignore */
  }
}

loadEnvFile()

const token =
  process.env.SUPABASE_ACCESS_TOKEN ?? process.env.SUPABASE_SECRET_KEY
if (!token) {
  console.error('Set SUPABASE_ACCESS_TOKEN or SUPABASE_SECRET_KEY in .env')
  process.exit(1)
}

const query = readFileSync(
  join(import.meta.dirname, '../supabase/migrations/001_phase_c.sql'),
  'utf8',
)

const response = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  },
)

const body = await response.text()
if (!response.ok) {
  console.error(`API error (${response.status}):`, body)
  process.exit(1)
}

console.log('Migration applied successfully.')
if (body.trim()) console.log(body)
