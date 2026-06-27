'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import MultiCalendar from '@/components/MultiCalendar';
import { BackHeader, Btn, Input, Label, MemoPreview, Textarea } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

export default function TodosPage() {
  const router = useRouter();
  const today = new Date();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [memo, setMemo] = useState('');
  const [memoModal, setMemoModal] = useState(null);
  const [scheduleTodo, setScheduleTodo] = useState(null);
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('20:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    const supabase = createClient();
    const { data } = await supabase.from('todos').select('*').order('created_at', { ascending: false });
    setTodos(data || []);
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from('todos').insert({
      user_id: user.id,
      title: title.trim(),
      duration_estimate: duration || null,
      memo: memo || null,
    });
    setTitle('');
    setDuration('');
    setMemo('');
    await loadTodos();
    setSaving(false);
  }

  async function handleDelete(todo) {
    if (!confirm(`「${todo.title}」をやりたいことリストから削除しますか？`)) return;
    const supabase = createClient();
    await supabase.from('todos').delete().eq('id', todo.id);
    await loadTodos();
  }

  function openSchedule(todo) {
    setScheduleTodo(todo);
    setSelectedDays(new Set());
    setStartTime('19:00');
    setEndTime('20:00');
  }

  function toggleDay(dateStr) {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  }

  async function handleScheduleSave() {
    if (!scheduleTodo || selectedDays.size === 0) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const rows = [...selectedDays].map((work_date) => ({
      user_id: user.id,
      title: scheduleTodo.title,
      work_date,
      start_time: startTime,
      end_time: endTime,
      memo: scheduleTodo.memo,
    }));

    await supabase.from('work_sessions').insert(rows);
    setScheduleTodo(null);
    setSaving(false);
    router.push('/home');
    router.refresh();
  }

  const count = selectedDays.size;

  return (
    <AppShell>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 px-5 py-6 pb-4">
          <BackHeader href="/home" title="やりたいこと" />
          <p className="-mt-4 mb-4 text-[13px] text-[#888]">作業時間を選んで予定に入れられます</p>

          <p className="mb-3 text-[13px] font-semibold text-[#888]">登録済みリスト</p>
          {loading ? (
            <p className="text-sm text-[#888]">読み込み中…</p>
          ) : todos.length === 0 ? (
            <p className="text-sm text-[#888]">まだ登録がありません</p>
          ) : (
            <ul>
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-start justify-between gap-3 border-b border-[#f0f2f5] py-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold">{todo.title}</div>
                    {todo.duration_estimate && (
                      <div className="mt-0.5 text-xs text-[#888]">目安: {todo.duration_estimate}</div>
                    )}
                    {todo.memo && (
                      <MemoPreview
                        text={todo.memo}
                        onClick={() => setMemoModal({ title: todo.title, text: todo.memo })}
                      />
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <Btn variant="secondary" className="!w-auto whitespace-nowrap !py-2 !text-[13px]" onClick={() => openSchedule(todo)}>
                      作業時間に入れる
                    </Btn>
                    <Btn variant="danger" className="!w-auto whitespace-nowrap !py-2 !text-[13px]" onClick={() => handleDelete(todo)}>
                      削除
                    </Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-auto rounded-t-2xl border-t border-[#e8ebf2] bg-[#f8f9fc] px-5 py-4 pb-7 shadow-[0_-4px_12px_rgba(0,0,0,.06)]">
          <h3 className="mb-3 text-[13px] font-semibold text-[#666]">＋ 新しく追加</h3>
          <form onSubmit={handleAdd}>
            <Label htmlFor="todo-title">やりたいこと</Label>
            <Input
              id="todo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 英語の勉強"
              required
            />
            <Label htmlFor="todo-duration">目安時間（任意）</Label>
            <Input
              id="todo-duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="例: 1時間"
            />
            <Label htmlFor="todo-memo">メモ（任意）</Label>
            <Textarea
              id="todo-memo"
              rows={2}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="例: 単語帳10ページ、リスニング教材を使う"
            />
            <Btn type="submit" disabled={saving} className="!text-[13px]">
              {saving ? '追加中…' : '追加'}
            </Btn>
          </form>
        </div>
      </div>

      {memoModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setMemoModal(null)}>
          <div className="w-full max-w-[420px] rounded-t-2xl bg-white px-5 py-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold">メモ</h2>
            <p className="mt-1 text-sm text-[#888]">{memoModal.title}</p>
            <p className="mt-4 whitespace-pre-wrap rounded-lg bg-[#f8f9fc] p-4">{memoModal.text}</p>
            <Btn className="mt-4" onClick={() => setMemoModal(null)}>閉じる</Btn>
          </div>
        </div>
      )}

      {scheduleTodo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setScheduleTodo(null)}>
          <div className="max-h-[90vh] w-full max-w-[420px] overflow-y-auto rounded-t-2xl bg-white px-5 py-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold">作業時間を選んで予定に入れる</h2>
            <p className="mt-1 mb-3 text-xs text-[#888]">{scheduleTodo.title}</p>
            <Label>登録する日（カレンダーから複数選択）</Label>
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
            <Label htmlFor="modal-start">開始時刻</Label>
            <Input id="modal-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <Label htmlFor="modal-end">終了時刻</Label>
            <Input id="modal-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            <Btn onClick={handleScheduleSave} disabled={saving || count === 0}>
              {count > 0 ? `${count}日分を作業時間に追加` : '作業時間に追加'}
            </Btn>
            <Btn variant="secondary" className="mt-2" onClick={() => setScheduleTodo(null)}>
              キャンセル
            </Btn>
          </div>
        </div>
      )}
    </AppShell>
  );
}
