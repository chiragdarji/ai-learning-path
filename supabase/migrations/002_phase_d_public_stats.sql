-- Phase D1: anonymous public completion stats (no user IDs exposed)

create table if not exists public.phase_resources (
  phase_id text not null,
  resource_id text not null,
  primary key (phase_id, resource_id)
);

alter table public.phase_resources enable row level security;

-- Only service role / migration scripts write; reads go through RPC below.

create or replace function public.get_public_completion_stats()
returns json
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  total int;
  min_learners constant int := 5;
  phase_rows json;
begin
  select count(distinct user_id)::int into total from public.user_progress;

  if total < min_learners then
    return json_build_object(
      'total_learners', total,
      'hidden', true,
      'phases', '[]'::json
    );
  end if;

  with phase_counts as (
    select phase_id, count(*)::int as required
    from public.phase_resources
    group by phase_id
  ),
  user_phase_progress as (
    select pr.phase_id, up.user_id, count(distinct up.resource_id)::int as done
    from public.user_progress up
    join public.phase_resources pr on pr.resource_id = up.resource_id
    group by pr.phase_id, up.user_id
  ),
  completed as (
    select upp.phase_id, count(*)::int as completed_learners
    from user_phase_progress upp
    join phase_counts pc on pc.phase_id = upp.phase_id
    where upp.done >= pc.required
    group by upp.phase_id
  )
  select coalesce(
    json_agg(
      json_build_object(
        'phase_id', c.phase_id,
        'completed_learners', c.completed_learners,
        'completion_pct', round(100.0 * c.completed_learners / total)::int
      )
      order by c.phase_id
    ),
    '[]'::json
  )
  into phase_rows
  from completed c;

  return json_build_object(
    'total_learners', total,
    'hidden', false,
    'phases', coalesce(phase_rows, '[]'::json)
  );
end;
$$;

revoke all on function public.get_public_completion_stats() from public;
grant execute on function public.get_public_completion_stats() to anon, authenticated;
