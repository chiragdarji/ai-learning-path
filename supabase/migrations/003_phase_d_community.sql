-- Phase D: community features (D2–D10)

-- Extend user profiles (D3 persona ids, D4 admin, D7 version, D10 locale)
alter table public.user_profiles drop constraint if exists user_profiles_persona_id_check;
alter table public.user_profiles
  add constraint user_profiles_persona_id_check
  check (persona_id in (
    'full', 'swe-manager', 'product-manager', 'ic-engineer', 'data-scientist'
  ));

alter table public.user_profiles
  add column if not exists is_admin boolean not null default false;

alter table public.user_profiles
  add column if not exists curriculum_version text not null default '2026-q2';

alter table public.user_profiles
  add column if not exists locale text not null default 'en'
  check (locale in ('en', 'es'));

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.user_profiles where user_id = auth.uid()),
    false
  );
$$;

-- D2: user-submitted resources
create table if not exists public.resource_submissions (
  id uuid primary key default gen_random_uuid(),
  submitter_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  url text not null,
  resource_type text not null,
  difficulty text not null,
  description text not null,
  suggested_phase_id text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists resource_submissions_status_idx
  on public.resource_submissions (status, created_at desc);

alter table public.resource_submissions enable row level security;

drop policy if exists "Users insert own submissions" on public.resource_submissions;
create policy "Users insert own submissions"
  on public.resource_submissions for insert
  with check (auth.uid() = submitter_id);

drop policy if exists "Users read own submissions" on public.resource_submissions;
create policy "Users read own submissions"
  on public.resource_submissions for select
  using (auth.uid() = submitter_id);

drop policy if exists "Admins read all submissions" on public.resource_submissions;
create policy "Admins read all submissions"
  on public.resource_submissions for select
  using (public.is_admin_user());

drop policy if exists "Admins update submissions" on public.resource_submissions;
create policy "Admins update submissions"
  on public.resource_submissions for update
  using (public.is_admin_user());

-- D8: per-resource notes
create table if not exists public.user_resource_notes (
  user_id uuid not null references auth.users (id) on delete cascade,
  resource_id text not null,
  body text not null,
  visibility text not null default 'private'
    check (visibility in ('private', 'shared')),
  updated_at timestamptz not null default now(),
  primary key (user_id, resource_id)
);

alter table public.user_resource_notes enable row level security;

drop policy if exists "Users manage own notes" on public.user_resource_notes;
create policy "Users manage own notes"
  on public.user_resource_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Read shared notes" on public.user_resource_notes;
create policy "Read shared notes"
  on public.user_resource_notes for select
  using (visibility = 'shared');

-- D9: team assignments
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'member')),
  primary key (team_id, user_id)
);

create table if not exists public.resource_assignments (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  resource_id text not null,
  assignee_id uuid not null references auth.users (id) on delete cascade,
  assigned_by uuid not null references auth.users (id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists resource_assignments_assignee_idx
  on public.resource_assignments (assignee_id);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.resource_assignments enable row level security;

drop policy if exists "Owners manage teams" on public.teams;
create policy "Owners manage teams"
  on public.teams for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Members read teams" on public.teams;
create policy "Members read teams"
  on public.teams for select
  using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = teams.id and tm.user_id = auth.uid()
    )
  );

drop policy if exists "Team membership read" on public.team_members;
create policy "Team membership read"
  on public.team_members for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.teams t
      where t.id = team_members.team_id and t.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners manage members" on public.team_members;
create policy "Owners manage members"
  on public.team_members for insert
  with check (
    exists (
      select 1 from public.teams t
      where t.id = team_members.team_id and t.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners delete members" on public.team_members;
create policy "Owners delete members"
  on public.team_members for delete
  using (
    exists (
      select 1 from public.teams t
      where t.id = team_members.team_id and t.owner_id = auth.uid()
    )
  );

drop policy if exists "Team assignment read" on public.resource_assignments;
create policy "Team assignment read"
  on public.resource_assignments for select
  using (
    assignee_id = auth.uid()
    or assigned_by = auth.uid()
    or exists (
      select 1 from public.teams t
      where t.id = resource_assignments.team_id and t.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners create assignments" on public.resource_assignments;
create policy "Owners create assignments"
  on public.resource_assignments for insert
  with check (
    assigned_by = auth.uid()
    and exists (
      select 1 from public.teams t
      where t.id = resource_assignments.team_id and t.owner_id = auth.uid()
    )
  );

drop policy if exists "Owners delete assignments" on public.resource_assignments;
create policy "Owners delete assignments"
  on public.resource_assignments for delete
  using (
    exists (
      select 1 from public.teams t
      where t.id = resource_assignments.team_id and t.owner_id = auth.uid()
    )
  );

-- D5: digest subscriptions
create table if not exists public.digest_subscriptions (
  email text primary key,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.digest_subscriptions enable row level security;

drop policy if exists "Users manage own digest subscription" on public.digest_subscriptions;
create policy "Users manage own digest subscription"
  on public.digest_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins read digest subscriptions" on public.digest_subscriptions;
create policy "Admins read digest subscriptions"
  on public.digest_subscriptions for select
  using (public.is_admin_user());
