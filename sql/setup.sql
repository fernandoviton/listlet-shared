-- Listlet shared database setup
-- Run this in Supabase SQL Editor

create table if not exists listlet_sample (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    data jsonb not null default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Auto-update updated_at on changes
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists listlet_sample_updated_at on listlet_sample;
create trigger listlet_sample_updated_at
    before update on listlet_sample
    for each row
    execute function update_updated_at();

-- Row Level Security
alter table listlet_sample enable row level security;

create policy "Authenticated users can read all lists"
    on listlet_sample for select
    to authenticated
    using (true);

create policy "Authenticated users can insert lists"
    on listlet_sample for insert
    to authenticated
    with check (true);

create policy "Authenticated users can update lists"
    on listlet_sample for update
    to authenticated
    using (true);

-- Enable Realtime
alter publication supabase_realtime add table listlet_sample;
