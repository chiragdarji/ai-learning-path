-- Phase C: user profiles + progress sync
-- Run in Supabase SQL Editor or via supabase db push

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  persona_id text not null default 'swe-manager'
    check (persona_id in ('full', 'swe-manager')),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  resource_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, resource_id)
);

create index if not exists user_progress_user_id_idx
  on public.user_progress (user_id);

alter table public.user_profiles enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists "Users read own profile" on public.user_profiles;
create policy "Users read own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own profile" on public.user_profiles;
create policy "Users insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own profile" on public.user_profiles;
create policy "Users update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

drop policy if exists "Users read own progress" on public.user_progress;
create policy "Users read own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own progress" on public.user_progress;
create policy "Users insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own progress" on public.user_progress;
create policy "Users update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own progress" on public.user_progress;
create policy "Users delete own progress"
  on public.user_progress for delete
  using (auth.uid() = user_id);

-- Auto-create profile row on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
