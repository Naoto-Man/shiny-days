'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import DayBar from '@/components/DayBar';
import WeekScheduleView from '@/components/WeekScheduleView';
import MonthScheduleView from '@/components/MonthScheduleView';
import CompactWorkList from '@/components/CompactWorkList';
import { Btn, MemoPreview } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import {
  daysUntil,
  formatDateJa,
  formatShortDate,
  getRangeForPeriod,
  isDateInRange,
  toDateInputValue,
} from '@/lib/dates';

function DeadlineBadge({ dateStr }) {
  const days = daysUntil(dateStr);
  if (days < 0) return null;
  if (days <= 1) {
    return (
      <span className="ml-1.5 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-600">
        あと{days === 0 ? '今日' : '1日'}
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="ml-1.5 inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-bold text-yellow-700">
        あと{days}日
      </span>
    );
  }
  return null;
}

export default function HomePage() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const todayStr = toDateInputValue(today);

  const [period, setPeriod] = useState('day');
  const [praise, setPraise] = useState('');
  const [workSessions, setWorkSessions] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [memoModal, setMemoModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const msg = sessionStorage.getItem('praise');
    if (msg) {
      setPraise(msg);
      sessionStorage.removeItem('praise');
    }
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: work } = await supabase
      .from('work_sessions')
      .select('*')
      .order('work_date')
      .order('start_time');
    const { data: dl } = await supabase
      .from('deadlines')
      .select('*')
      .order('deadline_date');
    setWorkSessions(work || []);
    setDeadlines(dl || []);
    setLoading(false);
  }

  const { start, end } = getRangeForPeriod(period, today);
  const monthStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today]
  );

  const todayWork = workSessions.filter((w) => w.work_date === todayStr);
  const rangeWork = workSessions.filter((w) => isDateInRange(w.work_date, start, end));
  const goWork = (id) => router.push(`/work/${id}`);
  const urgentDeadlines = deadlines
    .filter((d) => daysUntil(d.deadline_date) >= 0 && daysUntil(d.deadline_date) <= 7)
    .sort((a, b) => a.deadline_date.localeCompare(b.deadline_date));

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <AppShell>
      <section className="px-5 py-6 pb-8">
        {praise && (
          <div className="mb-5 rounded-xl border border-[#f6d860] bg-gradient-to-br from-[#fff9e6] to-[#fff3cc] p-4 text-center">
            <div className="text-3xl">🌟</div>
            <p className="mt-1.5 text-sm font-semibold text-[#7a6200]">{praise}</p>
          </div>
        )}

        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold">今日の予定</h1>
            <p className="text-[13px] text-[#888]">{formatDateJa(today)}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-[#888] underline"
          >
            ログアウト
          </button>
        </div>

        <div className="mb-5 flex rounded-[10px] bg-[#f0f2f5] p-1">
          {[
            ['day', '1日'],
            ['week', '1週間'],
            ['month', '1か月'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriod(key)}
              className={`flex-1 rounded-lg py-2 text-[13px] font-semibold ${
                period === key ? 'bg-white text-[#4f6ef7] shadow-sm' : 'text-[#888]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {period === 'day' && <DayBar sessions={todayWork} onSelect={goWork} />}
        {period === 'week' && (
          <WeekScheduleView
            sessions={rangeWork}
            start={start}
            end={end}
            todayStr={todayStr}
            onSelect={goWork}
          />
        )}
        {period === 'month' && (
          <MonthScheduleView
            sessions={rangeWork}
            monthStart={monthStart}
            todayStr={todayStr}
            onSelect={goWork}
          />
        )}

        {urgentDeadlines.length > 0 && (
          <div className="mb-4 rounded-lg border-l-4 border-red-500 bg-red-50 px-3.5 py-3">
            <h3 className="mb-2 text-xs font-bold tracking-wide text-red-600">⚠ 締切が近い</h3>
            <ul>
              {urgentDeadlines.map((d) => (
                <li key={d.id}>
                  <Link href={`/deadline/${d.id}`} className="block border-b border-red-100 py-3 last:border-0">
                    <div className="flex gap-3">
                      <span className="min-w-[44px] pt-0.5 text-xs font-semibold text-[#888]">締切</span>
                      <div>
                        <div className="text-[15px] font-semibold">
                          <span className="mr-1.5 rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600">
                            締切
                          </span>
                          {d.title}
                          <DeadlineBadge dateStr={d.deadline_date} />
                        </div>
                        <p className="text-xs text-[#aaa]">{formatShortDate(d.deadline_date)}まで</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <h2 className="mb-2 text-sm font-semibold text-[#888]">
          {period === 'day'
            ? '今日の作業時間'
            : period === 'week'
              ? `今週の作業時間（${rangeWork.length}件）`
              : `今月の作業時間（${rangeWork.length}件）`}
        </h2>
        {loading ? (
          <p className="text-sm text-[#888]">読み込み中…</p>
        ) : rangeWork.length === 0 ? (
          <p className="text-sm text-[#888]">予定がありません</p>
        ) : period === 'week' || period === 'month' ? (
          <CompactWorkList items={rangeWork} onSelect={goWork} />
        ) : (
          <ul>
            {rangeWork.map((w) => (
              <li key={w.id} className="border-b border-[#f0f2f5] py-3.5">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/work/${w.id}`)}
                    className="flex min-w-0 flex-1 gap-3 text-left"
                  >
                    <span className="min-w-[44px] pt-0.5 text-xs font-semibold text-[#888]">
                      {w.start_time?.slice(0, 5)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold">
                        <span className="mr-1.5 rounded bg-[#eef1ff] px-1.5 py-0.5 text-[10px] text-[#4f6ef7]">
                          作業
                        </span>
                        {w.title}
                      </div>
                      <p className="text-xs text-[#aaa]">
                        {period !== 'day' && `${formatShortDate(w.work_date)} · `}
                        {w.start_time?.slice(0, 5)} – {w.end_time?.slice(0, 5)}
                      </p>
                    </div>
                  </button>
                </div>
                {w.memo && (
                  <MemoPreview text={w.memo} onClick={() => setMemoModal({ title: w.title, text: w.memo })} />
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          <div className="flex gap-2.5">
            <Link
              href="/work/new"
              className="flex-1 rounded-[10px] bg-[#4f6ef7] py-3.5 text-center text-[15px] font-semibold text-white hover:bg-[#3d5ce0]"
            >
              ＋ 作業時間
            </Link>
            <Link
              href="/deadline/new"
              className="flex-1 rounded-[10px] border-[1.5px] border-[#ffc9c9] bg-red-50 py-3.5 text-center text-[15px] font-semibold text-red-600"
            >
              ＋ 締切
            </Link>
          </div>
          <Link
            href="/todos"
            className="block rounded-[10px] bg-[#eef1ff] py-3.5 text-center text-[15px] font-semibold text-[#4f6ef7]"
          >
            やりたいことリスト
          </Link>
        </div>
      </section>

      {memoModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setMemoModal(null)}
        >
          <div
            className="w-full max-w-[420px] rounded-t-2xl bg-white px-5 py-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">メモ</h2>
            <p className="mt-1 text-sm text-[#888]">{memoModal.title}</p>
            <p className="mt-4 whitespace-pre-wrap rounded-lg bg-[#f8f9fc] p-4 text-[15px] leading-relaxed">
              {memoModal.text}
            </p>
            <Btn className="mt-4" onClick={() => setMemoModal(null)}>
              閉じる
            </Btn>
          </div>
        </div>
      )}
    </AppShell>
  );
}
