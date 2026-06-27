'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import MultiCalendar from '@/components/MultiCalendar';
import ColorPicker from '@/components/ColorPicker';
import { BackHeader, Btn, Input, Label, Textarea } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

export default function NewWorkPage() {
  const router = useRouter();
  const today = new Date();
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [memo, setMemo] = useState('');
  const [color, setColor] = useState(null);
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleDay(dateStr) {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (selectedDays.size === 0) {
      setError('カレンダーから1日以上選んでください');
      return;
    }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError('ログインが必要です');
      setLoading(false);
      return;
    }

    const rows = [...selectedDays].map((work_date) => ({
      user_id: user.id,
      title,
      work_date,
      start_time: startTime,
      end_time: endTime,
      color: color || null,
      memo: memo || null,
    }));

    const { error: insertError } = await supabase.from('work_sessions').insert(rows);
    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }
    router.push('/home');
    router.refresh();
  }

  const count = selectedDays.size;

  return (
    <AppShell>
      <section className="px-5 py-6">
        <BackHeader href="/home" title="作業時間を追加" />
        <span className="mb-4 inline-block rounded-full bg-[#eef1ff] px-2.5 py-1 text-xs font-bold text-[#4f6ef7]">
          🕐 作業時間
        </span>
        <p className="-mt-2 mb-4 text-[13px] text-[#888]">同じ内容を複数の日にまとめて登録できます</p>

        <form onSubmit={handleSave}>
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />

          <Label>登録する日（カレンダーから複数選択）</Label>
          <p className="-mt-2 mb-3 text-xs leading-relaxed text-[#888]">
            カレンダー上の日付をタップして選びます
          </p>
          <MultiCalendar
            year={today.getFullYear()}
            month={today.getMonth()}
            selectedDays={selectedDays}
            onToggle={toggleDay}
            today={today}
          />
          <p className={`mb-4 text-xs font-semibold ${count === 0 ? 'text-red-600' : 'text-[#4f6ef7]'}`}>
            {count === 0 ? 'カレンダーから1日以上選んでください' : `${count}日分を登録予定`}
          </p>

          <Label>時間帯（すべての日に共通）</Label>
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
          <Btn type="submit" disabled={loading || count === 0}>
            {loading ? '保存中…' : count > 0 ? `${count}日分を保存` : '保存'}
          </Btn>
        </form>
      </section>
    </AppShell>
  );
}
