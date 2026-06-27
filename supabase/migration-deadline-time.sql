-- 既存の Supabase プロジェクトで実行してください（締切に時刻を追加）
alter table deadlines
  add column if not exists deadline_time time not null default '23:59:00';
