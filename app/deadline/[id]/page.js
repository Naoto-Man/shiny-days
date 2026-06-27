'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { BackHeader, Btn, Input, Label } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { normalizeTimeInput } from '@/lib/dates';

export default function EditDeadlinePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [title, setTitle] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('deadlines').select('*').eq('id', id).single();
      if (!data) {
        setError('データが見つかりません');
        setLoading(false);
        return;
      }
      setTitle(data.title);
      setDeadlineDate(data.deadline_date);
      setDeadlineTime(normalizeTimeInput(data.deadline_time));
      setMemo(data.memo || '');
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('deadlines')
      .update({
        title,
        deadline_date: deadlineDate,
        deadline_time: deadlineTime,
        memo: memo || null,
      })
      .eq('id', id);
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }
    router.push('/home');
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm('この締切を削除しますか？')) return;
    const supabase = createClient();
    await supabase.from('deadlines').delete().eq('id', id);
    router.push('/home');
    router.refresh();
  }

  if (loading) {
    return (
      <AppShell>
        <section className="px-5 py-6">
          <p className="text-sm text-[#888]">読み込み中…</p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="px-5 py-6">
        <BackHeader href="/home" title="締切を編集" />
        <span className="mb-4 inline-block rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
          📌 締切
        </span>

        <form onSubmit={handleSave}>
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Label>締切日時</Label>
          <div className="mb-4 flex gap-2.5">
            <div className="flex-[2]">
              <Label htmlFor="date">日付</Label>
              <Input
                id="date"
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="!mb-0"
                required
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="time">時刻</Label>
              <Input
                id="time"
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="!mb-0"
                required
              />
            </div>
          </div>
          <Label htmlFor="memo">メモ（任意）</Label>
          <Input id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} />
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <Btn type="submit" disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </Btn>
          <Btn type="button" variant="danger" className="mt-2.5" onClick={handleDelete}>
            削除
          </Btn>
        </form>
      </section>
    </AppShell>
  );
}
