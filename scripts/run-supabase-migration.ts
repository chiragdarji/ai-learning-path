/**
 * Apply supabase/migrations/*.sql to the remote database.
 *
 * Requires SUPABASE_DB_PASSWORD in .env (Supabase Dashboard → Settings → Database).
 * Optional override: SUPABASE_DB_URL (full postgres connection string).
 *
 * Run: npx tsx scripts/run-supabase-migration.ts
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import postgres from 'postgres'

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
    /* .env optional if vars already exported */
  }
}

loadEnvFile()

const migrationPath = join(
  import.meta.dirname,
  '../supabase/migrations/001_phase_c.sql',
)
const sqlText = readFileSync(migrationPath, 'utf8')

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
  console.error(
    'Missing database credentials. Add to .env:\n' +
      '  SUPABASE_DB_PASSWORD=<from Supabase Dashboard → Settings → Database>\n' +
      'Or set SUPABASE_DB_URL to the full connection string.',
  )
  process.exit(1)
}

try {
  console.log('Applying supabase/migrations/001_phase_c.sql …')
  await sql.unsafe(sqlText)
  console.log('Migration applied successfully.')
} catch (err) {
  console.error('Migration failed:', err instanceof Error ? err.message : err)
  process.exit(1)
} finally {
  await sql.end()
}
