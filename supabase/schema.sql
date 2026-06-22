-- Supabase SQL Editor で実行してください

create table work_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  work_date date not null,
  start_time time not null,
  end_time time not null,
  memo text,
  created_at timestamptz default now()
);

create table deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  deadline_date date not null,
  memo text,
  created_at timestamptz default now()
);

create table todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  duration_estimate text,
  memo text,
  created_at timestamptz default now()
);

alter table work_sessions enable row level security;
alter table deadlines enable row level security;
alter table todos enable row level security;

create policy "work_sessions_own" on work_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "deadlines_own" on deadlines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "todos_own" on todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
