alter table public.profiles
  add column in_coffee_break boolean not null default false;

-- Update the existing update policy to cover the new column (RLS on update uses the USING clause, so no change needed)
-- But we drop and recreate it to be explicit about allowed columns
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
