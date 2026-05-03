create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users not null,
  recipient_id uuid references auth.users not null,
  text text not null check (char_length(text) <= 100),
  created_at timestamptz default now(),
  read_at timestamptz
);

alter table public.messages enable row level security;

create policy "Sender can insert own messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Recipient can select own messages"
  on public.messages for select
  using (auth.uid() = recipient_id);

create policy "Recipient can update own messages"
  on public.messages for update
  using (auth.uid() = recipient_id);

alter table public.messages replica identity full;
