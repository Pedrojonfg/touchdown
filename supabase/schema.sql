-- Touchdown booth scores. Run once in the Supabase SQL editor.
-- Reset between event days:
--   truncate table public.scores;

create table public.scores (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 20),
  score integer not null check (score >= 0 and score <= 1000),
  fuel_remaining integer not null check (fuel_remaining >= 0 and fuel_remaining <= 100),
  impact_speed numeric not null,
  created_at timestamptz not null default now()
);

create index scores_score_desc_idx on public.scores (score desc);
create index scores_created_at_desc_idx on public.scores (created_at desc);

alter table public.scores enable row level security;

create policy "Anyone can read scores"
  on public.scores for select
  to anon, authenticated
  using (true);

create policy "Anyone can insert a score"
  on public.scores for insert
  to anon, authenticated
  with check (
    char_length(name) between 1 and 20
    and score between 0 and 1000
  );

-- Deliberately no update/delete policy.

grant select, insert on public.scores to anon, authenticated;

alter publication supabase_realtime add table public.scores;
