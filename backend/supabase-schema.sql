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
  multiple_choice_score integer,
  writing_score integer,
  speaking_analysis jsonb,
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

-- ========================================================
-- PERSISTENT ATOMIC RATE LIMITER (FOR VERCEL SERVERLESS)
-- ========================================================

-- 6. Create table public.rate_limit_buckets
create table if not exists public.rate_limit_buckets (
  key text primary key,
  attempts integer not null default 1,
  reset_at timestamptz not null
);

-- 7. Enable RLS on rate_limit_buckets
alter table public.rate_limit_buckets enable row level security;

-- 8. Atomic Check-and-Increment RPC function (Thread-Safe with Row Lock FOR UPDATE)
create or replace function public.check_and_increment_rate_limit(
  p_key text,
  p_max_attempts integer,
  p_ttl_seconds integer
)
returns json
language plpgsql
security definer
as $$
declare
  v_now timestamptz := now();
  v_reset_at timestamptz;
  v_attempts integer;
  v_blocked boolean := false;
  v_wait_seconds integer := 0;
begin
  -- Lock row FOR UPDATE to prevent race conditions across serverless instances
  select attempts, reset_at into v_attempts, v_reset_at
  from public.rate_limit_buckets
  where key = p_key
  for update;

  if not found or v_now >= v_reset_at then
    -- Bucket does not exist or expired -> reset window
    v_reset_at := v_now + (p_ttl_seconds || ' seconds')::interval;
    v_attempts := 1;

    insert into public.rate_limit_buckets (key, attempts, reset_at)
    values (p_key, v_attempts, v_reset_at)
    on conflict (key) do update
      set attempts = v_attempts,
          reset_at = v_reset_at;
  else
    -- Bucket active within current window
    if v_attempts >= p_max_attempts then
      v_blocked := true;
      v_wait_seconds := greatest(1, extract(epoch from (v_reset_at - v_now))::integer);
    else
      v_attempts := v_attempts + 1;
      update public.rate_limit_buckets
      set attempts = v_attempts
      where key = p_key;
    end if;
  end if;

  return json_build_object(
    'blocked', v_blocked,
    'attempts', v_attempts,
    'reset_at', v_reset_at,
    'wait_seconds', v_wait_seconds
  );
end;
$$;
