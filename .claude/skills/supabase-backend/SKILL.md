---
name: supabase-backend
description: Use when touching the database — writing a migration, adding/altering RLS policies, an RPC, or a service that reads/writes Supabase. Explains the migration runner, RLS conventions, and the public-aggregate (SECURITY DEFINER) pattern.
---

# Supabase backend

Auth + Postgres + RLS. The client is `src/lib/supabase.ts`; it is `null` when unconfigured (`isSupabaseConfigured` is false), so **every service must handle a null client** and degrade gracefully (return `{ error: 'Sync not configured.' }` or a safe empty value).

## Migrations

Live in `supabase/migrations/NNN_name.sql` (numbered, e.g. `004_profile_delete_policy.sql`). Applied via `npm run migrate:supabase`, which:

- reads **all** `.sql` files, sorts by filename, and applies **every one in order, every run**.

So migrations **must be idempotent** — use `create table if not exists`, `drop policy if exists "…"` before `create policy`, `create or replace function`. Never write a migration that fails when re-applied. Requires `SUPABASE_DB_PASSWORD` (or `SUPABASE_DB_URL`) in `.env`.

## RLS conventions

Enable RLS on every user table and write per-operation policies keyed on the owner:

```sql
alter table public.my_table enable row level security;

create policy "Users read own rows"
  on public.my_table for select using (auth.uid() = user_id);
create policy "Users delete own rows"
  on public.my_table for delete using (auth.uid() = user_id);
```

- A `for all` "manage own" policy covers select/insert/update/delete in one (used by `user_resource_notes`, `digest_subscriptions`).
- **Check which operations a table actually allows before assuming a client-side write works.** Example: `user_progress` has a delete policy but `user_profiles` did not until migration 004 — a client delete silently fails (RLS deny) without the policy.
- User tables reference `auth.users(id) on delete cascade` so deleting the auth user cascades — but deleting the auth user itself needs the service role (an edge function), which this project does not yet have. Client-side "delete my data" instead deletes each owned row via RLS (see `src/services/accountData.ts`).

## Public aggregates (SECURITY DEFINER)

To expose aggregate data to anonymous visitors without leaking PII, use a `security definer` function granted to `anon` — never open a table to anon directly. Pattern (`get_public_completion_stats` in `002_phase_d_public_stats.sql`): compute the aggregate, apply a minimum-cohort threshold, `grant execute … to anon, authenticated`. This is the sanctioned way to add things like per-user badge counts or community stats.

## Services

Live in `src/services/*.ts`, return `{ error?: string }` (or typed data), and are unit-tested by mocking `../lib/supabase` (see `src/services/accountData.test.ts` for the `from().delete().eq()` mock pattern). Keep SQL/data access in services, not components.
