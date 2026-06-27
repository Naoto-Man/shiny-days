'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import ColorPicker from '@/components/ColorPicker';
import { BackHeader, Btn, Input, Label, Textarea } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

export default function EditWorkPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [title, setTitle] = useState('');
  const [workDate, setWorkDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [memo, setMemo] = useState('');
  const [color, setColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('id', id)
        .single();
      if (fetchError || !data) {
        setError('データが見つかりません');
        setLoading(false);
        return;
      }
      setTitle(data.title);
      setWorkDate(data.work_date);
      setStartTime(data.start_time?.slice(0, 5) || '');
      setEndTime(data.end_time?.slice(0, 5) || '');
      setMemo(data.memo || '');
      setColor(data.color || null);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('work_sessions')
      .update({
        title,
        work_date: workDate,
        start_time: startTime,
        end_time: endTime,
        color: color || null,
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
    if (!confirm('この作業時間を削除しますか？')) return;
    const supabase = createClient();
    await supabase.from('work_sessions').delete().eq('id', id);
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
        <BackHeader href="/home" title="作業時間を編集" />
        <span className="mb-4 inline-block rounded-full bg-[#eef1ff] px-2.5 py-1 text-xs font-bold text-[#4f6ef7]">
          🕐 作業時間
        </span>

        <form onSubmit={handleSave}>
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <Label htmlFor="date">日付</Label>
          <Input
            id="date"
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            required
          />

          <div className="mb-4 flex gap-2.5">
            <div className="flex-1">
              <Label htmlFor="start">開始時刻</Label>
              <Input
                id="start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="!mb-0"
                required
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end">終了時刻</Label>
              <Input
                id="end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="!mb-0"
                required
              />
            </div>
          </div>

          <ColorPicker value={color} onChange={setColor} />

          <Label htmlFor="memo">メモ（任意）</Label>
          <Textarea id="memo" rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} />

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <Btn type="submit" disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </Btn>
          <Btn type="button" variant="danger" className="mt-2.5" onClick={handleDelete}>
            削除（この1件のみ）
          </Btn>
        </form>
      </section>
    </AppShell>
  );
}
