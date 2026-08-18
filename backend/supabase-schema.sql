-- ========================================================
-- TAQYEEMY DATABASE SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- Run this script in the Supabase SQL Editor
-- ========================================================

-- 1. Create table public.test_results
create table if not exists public.test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  level text not null check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  score integer not null check (score >= 0 and score <= 100),
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  test_type text not null check (test_type in ('placement', 'specific')),
  target_level text check (target_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  completed_at timestamptz default now() not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.test_results enable row level security;

-- 3. Policy: Users can only view their own test results
create policy "Users can view their own test results"
  on public.test_results for select
  using (auth.uid() = user_id);

-- 4. Policy: Users can only insert their own test results
create policy "Users can insert their own test results"
  on public.test_results for insert
  with check (auth.uid() = user_id);

-- 5. Create index for fast user history lookup
create index if not exists idx_test_results_user_id on public.test_results(user_id);
