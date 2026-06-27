-- 既存の Supabase プロジェクトで実行してください（初期メッセージのオン／オフ設定）
create table if not exists praise_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  use_default_praise boolean not null default true
);

alter table praise_settings enable row level security;

create policy "praise_settings_own" on praise_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
