-- ═══════════════════════════════════════════════════════════
-- Trading Journal — Supabase Schema
-- Run this in your Supabase project's SQL Editor
-- ═══════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ───────────────────────────────────────────
-- TRADES
-- ───────────────────────────────────────────
create table public.trades (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  date          date not null,
  pair          text not null,
  entry_time    text not null default '',
  r             numeric not null,
  direction     text not null check (direction in ('Long', 'Short')),
  session       text not null check (session in ('London', 'NY', 'Asia')),
  tags          text[] not null default '{}',
  notes         text not null default '',
  screenshots   text[] not null default '{}',
  playbook_grade jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.trades enable row level security;
create policy "Users manage own trades"
  on public.trades for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_trades_user_date on public.trades(user_id, date);

-- ───────────────────────────────────────────
-- PLAYBOOKS
-- ───────────────────────────────────────────
create table public.playbooks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  rules       text[] not null default '{}',
  color       text not null default '#6366f1',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.playbooks enable row level security;
create policy "Users manage own playbooks"
  on public.playbooks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ───────────────────────────────────────────
-- HABITS
-- ───────────────────────────────────────────
create table public.habits (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  name              text not null,
  color             text not null default '#6366f1',
  target_frequency  integer,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.habits enable row level security;
create policy "Users manage own habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ───────────────────────────────────────────
-- HABIT LOGS
-- ───────────────────────────────────────────
create table public.habit_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  habit_id    uuid not null references public.habits(id) on delete cascade,
  date        date not null,
  done        boolean not null default true,
  created_at  timestamptz not null default now(),
  unique(habit_id, date)
);

alter table public.habit_logs enable row level security;
create policy "Users manage own habit_logs"
  on public.habit_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_habit_logs_user on public.habit_logs(user_id, habit_id, date);

-- ───────────────────────────────────────────
-- GOALS
-- ───────────────────────────────────────────
create table public.goals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text not null default '',
  target_date date not null,
  color       text not null default '#6366f1',
  status      text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  progress    integer not null default 0,
  milestones  jsonb not null default '[]',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.goals enable row level security;
create policy "Users manage own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ───────────────────────────────────────────
-- TRANSACTIONS
-- ───────────────────────────────────────────
create table public.transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('income', 'expense')),
  amount      numeric not null,
  category    text not null,
  date        date not null,
  notes       text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.transactions enable row level security;
create policy "Users manage own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index idx_transactions_user_date on public.transactions(user_id, date);

-- ───────────────────────────────────────────
-- SCREENSHOTS STORAGE BUCKET
-- ───────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

create policy "Users upload own screenshots"
  on storage.objects for insert
  with check (
    bucket_id = 'screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own screenshots"
  on storage.objects for delete
  using (
    bucket_id = 'screenshots'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Public read screenshots"
  on storage.objects for select
  using (bucket_id = 'screenshots');
