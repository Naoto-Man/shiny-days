'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { BackHeader, Btn, Input, Label, Textarea } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { toDateInputValue } from '@/lib/dates';

export default function NewDeadlinePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [deadlineDate, setDeadlineDate] = useState(toDateInputValue());
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from('deadlines').insert({
      user_id: user.id,
      title,
      deadline_date: deadlineDate,
      memo: memo || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }
    router.push('/home');
    router.refresh();
  }

  return (
    <AppShell>
      <section className="px-5 py-6">
        <BackHeader href="/home" title="締切を追加" />
        <span className="mb-4 inline-block rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
          📌 締切
        </span>
        <p className="-mt-2 mb-4 text-[13px] text-[#888]">提出期限や返却日などを登録します</p>

        <form onSubmit={handleSave}>
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Label htmlFor="date">締切日</Label>
          <Input
            id="date"
            type="date"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
            required
          />
          <Label htmlFor="memo">メモ（任意）</Label>
          <Input
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="例: レポート3000字、PDF提出"
          />
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <Btn type="submit" disabled={loading}>
            {loading ? '保存中…' : '保存'}
          </Btn>
        </form>
      </section>
    </AppShell>
  );
}
