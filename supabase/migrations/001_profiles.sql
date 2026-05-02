create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  username text not null unique,
  avatar_color text not null default 'orange'
);

alter table public.profiles enable row level security;

create policy "Users can read all profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup is handled in the signup server action
