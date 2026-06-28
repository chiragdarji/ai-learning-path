/**
 * Sync phase → resource mapping from content/learning-path.json to Supabase.
 * Run after migrations: npm run sync:phase-resources
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import postgres from 'postgres'
import { learningPathSchema } from '../src/schemas/content.ts'

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
    /* optional */
  }
}

loadEnvFile()

const phases = learningPathSchema.parse(
  JSON.parse(
    readFileSync(join(import.meta.dirname, '../content/learning-path.json'), 'utf8'),
  ),
)

const rows = phases.flatMap((phase) =>
  phase.steps.flatMap((step) =>
    step.resources.map((resource) => ({
      phase_id: phase.id,
      resource_id: resource.id,
    })),
  ),
)

const dbUrl = process.env.SUPABASE_DB_URL
const password = process.env.SUPABASE_DB_PASSWORD

const sql = dbUrl
  ? postgres(dbUrl, { ssl: 'require', max: 1 })
  : password
    ? postgres({
        host: `db.${PROJECT_REF}.supabase.co`,
        port: 5432,
        database: 'postgres',
        username: 'postgres',
        password,
        ssl: 'require',
        max: 1,
      })
    : null

if (!sql) {
  console.error('Missing SUPABASE_DB_PASSWORD or SUPABASE_DB_URL in .env')
  process.exit(1)
}

try {
  await sql`delete from public.phase_resources`
  if (rows.length > 0) {
    await sql`
      insert into public.phase_resources ${sql(rows, 'phase_id', 'resource_id')}
    `
  }
  console.log(`Synced ${rows.length} phase-resource rows (${phases.length} phases).`)
} catch (err) {
  console.error('Sync failed:', err instanceof Error ? err.message : err)
  process.exit(1)
} finally {
  await sql.end()
}
