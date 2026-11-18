-- Budget-in V3.5 — Supabase schema
-- Run this entire script in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null check (month_key ~ '^\\d{4}-(0[1-9]|1[0-2])$'),
  status text not null default 'draft' check (status in ('draft','submitted')),
  data jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month_key)
);

create index if not exists monthly_budgets_user_month_idx
  on public.monthly_budgets(user_id, month_key desc);

alter table public.monthly_budgets enable row level security;

drop policy if exists "Users can read own budgets" on public.monthly_budgets;
create policy "Users can read own budgets"
  on public.monthly_budgets for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own budgets" on public.monthly_budgets;
create policy "Users can insert own budgets"
  on public.monthly_budgets for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own budgets" on public.monthly_budgets;
create policy "Users can update own budgets"
  on public.monthly_budgets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own budgets" on public.monthly_budgets;
create policy "Users can delete own budgets"
  on public.monthly_budgets for delete
  using (auth.uid() = user_id);

-- No public read access. All requests must be authenticated and pass RLS.
