-- 既存の Supabase プロジェクトで実行してください（予定に色を追加）
alter table work_sessions
  add column if not exists color text;
