-- Supabase SQL Editor で実行してください

create table work_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  work_date date not null,
  start_time time not null,
  end_time time not null,
  color text,
  memo text,
  created_at timestamptz default now()
);

create table deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  deadline_date date not null,
  deadline_time time not null default '23:59:00',
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

create table praise_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period text not null check (period in ('morning', 'afternoon', 'evening')),
  message text not null,
  created_at timestamptz default now()
);

create table praise_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  use_default_praise boolean not null default true
);

alter table work_sessions enable row level security;
alter table deadlines enable row level security;
alter table todos enable row level security;
alter table praise_messages enable row level security;
alter table praise_settings enable row level security;

create policy "work_sessions_own" on work_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "deadlines_own" on deadlines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "todos_own" on todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "praise_messages_own" on praise_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "praise_settings_own" on praise_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
