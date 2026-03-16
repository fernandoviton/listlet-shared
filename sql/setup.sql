-- Listlet shared database setup
-- Run this in Supabase SQL Editor

drop table if exists listlet_sample cascade;

create table listlet_sample (
    id uuid default gen_random_uuid() primary key,
    list_name text not null,
    content text not null default '',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
create index idx_listlet_sample_list_name on listlet_sample(list_name);

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

create policy "Authenticated users can read all items"
    on listlet_sample for select
    to authenticated
    using (true);

create policy "Authenticated users can insert items"
    on listlet_sample for insert
    to authenticated
    with check (true);

create policy "Authenticated users can update items"
    on listlet_sample for update
    to authenticated
    using (true);

create policy "Authenticated users can delete items"
    on listlet_sample for delete
    to authenticated
    using (true);

-- Enable Realtime
alter publication supabase_realtime add table listlet_sample;
