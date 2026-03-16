-- Listlet shared database setup
-- Run this in Supabase SQL Editor

create table if not exists lists (
    id uuid default gen_random_uuid() primary key,
    container text not null,
    name text not null,
    data jsonb not null default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(container, name)
);

-- Auto-update updated_at on changes
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists lists_updated_at on lists;
create trigger lists_updated_at
    before update on lists
    for each row
    execute function update_updated_at();

-- Row Level Security
alter table lists enable row level security;

create policy "Authenticated users can read all lists"
    on lists for select
    to authenticated
    using (true);

create policy "Authenticated users can insert lists"
    on lists for insert
    to authenticated
    with check (true);

create policy "Authenticated users can update lists"
    on lists for update
    to authenticated
    using (true);

-- Enable Realtime
alter publication supabase_realtime add table lists;
