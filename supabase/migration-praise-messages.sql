-- 既存の Supabase プロジェクトで実行してください（ログインメッセージ用）
create table if not exists praise_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period text not null check (period in ('morning', 'afternoon', 'evening')),
  message text not null,
  created_at timestamptz default now()
);

alter table praise_messages enable row level security;

create policy "praise_messages_own" on praise_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
