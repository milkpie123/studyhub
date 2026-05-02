create table public.seats (
  id int primary key check (id between 1 and 8),
  occupied_by uuid unique references public.profiles(id) on delete set null,
  occupied_at timestamptz
);

alter table public.seats enable row level security;

create policy "Anyone can read seats"
  on public.seats for select
  using (true);

create policy "Users can update seats"
  on public.seats for update
  using (true);

-- Seed all 8 seats as empty
insert into public.seats (id) values (1),(2),(3),(4),(5),(6),(7),(8);

-- Enable Realtime (replica identity FULL so we get old+new row data)
alter table public.seats replica identity full;
