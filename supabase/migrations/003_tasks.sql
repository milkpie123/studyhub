create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

-- RLS: users can only access their own tasks (satisfies task data is private requirement)
create policy "Users can read own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);
