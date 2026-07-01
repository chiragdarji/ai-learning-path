-- E2: allow a signed-in user to delete their own profile row (client-side
-- account-data delete). user_progress already has a delete policy; notes and
-- digest use FOR ALL "manage own" policies that include delete.
drop policy if exists "Users delete own profile" on public.user_profiles;
create policy "Users delete own profile"
  on public.user_profiles for delete
  using (auth.uid() = user_id);
