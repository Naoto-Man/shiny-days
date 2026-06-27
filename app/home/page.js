'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import DayBar from '@/components/DayBar';
import WeekScheduleView from '@/components/WeekScheduleView';
import MonthScheduleView from '@/components/MonthScheduleView';
import CompactWorkList from '@/components/CompactWorkList';
import ColorPicker from '@/components/ColorPicker';
import { getSessionColor } from '@/components/scheduleColors';
import PraiseMessageEditor from '@/components/PraiseMessageEditor';
import { Btn, MemoPreview } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { pickLoginPraise } from '@/lib/praiseMessages';
import {
  compareDeadlines,
  formatDateJa,
  formatPeriodHeading,
  formatPeriodNavLabel,
  formatShortDate,
  formatShortDateTime,
  formatDeadlineRemaining,
  formatWorkListHeading,
  getDeadlineRemaining,
  getPeriodNavButtonLabels,
  getRangeForPeriod,
  getReturnToTodayLabel,
  isCurrentPeriod,
  isDateInRange,
  isDeadlineWithinDays,
  shiftViewDate,
  toDateInputValue,
} from '@/lib/dates';

function DeadlineBadge({ deadline }) {
  const label = formatDeadlineRemaining(deadline.deadline_date, deadline.deadline_time);
  if (!label) return null;
  const { hours } = getDeadlineRemaining(deadline.deadline_date, deadline.deadline_time);
  const urgent = hours <= 24;
  return (
    <span
      className={`ml-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
        urgent ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
      }`}
    >
      {label}
    </span>
  );
}

const MONTH_LIST_PREVIEW_LIMIT = 10;

export default function HomePage() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const todayStr = toDateInputValue(today);

  const [period, setPeriod] = useState('day');
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [praise, setPraise] = useState('');
  const [showPraiseEditor, setShowPraiseEditor] = useState(false);
  const [workSessions, setWorkSessions] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [memoModal, setMemoModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllMonthWork, setShowAllMonthWork] = useState(false);
  const [bulkActionMode, setBulkActionMode] = useState(null);
  const [selectedWorkIds, setSelectedWorkIds] = useState(() => new Set());
  const [bulkColorValue, setBulkColorValue] = useState(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const stored = sessionStorage.getItem('praise');
      const supabase = createClient();
      if (stored) {
        setPraise(stored);
        sessionStorage.removeItem('praise');
      } else {
        const msg = await pickLoginPraise(supabase);
        setPraise(msg);
      }
      await loadData();
    }
    init();
  }, []);

  useEffect(() => {
    setShowAllMonthWork(false);
    setBulkActionMode(null);
    setSelectedWorkIds(new Set());
    setBulkColorValue(null);
  }, [period, viewDate]);

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
      .order('deadline_date')
      .order('deadline_time');
    setWorkSessions(work || []);
    setDeadlines(dl || []);
    setLoading(false);
  }

  const { start, end } = getRangeForPeriod(period, viewDate);
  const viewDateStr = toDateInputValue(viewDate);
  const monthStart = useMemo(
    () => new Date(viewDate.getFullYear(), viewDate.getMonth(), 1),
    [viewDate]
  );
  const periodNav = getPeriodNavButtonLabels(period);
  const showingCurrentPeriod = isCurrentPeriod(period, viewDate);

  const dayWork = workSessions.filter((w) => w.work_date === viewDateStr);
  const dayDeadlines = deadlines
    .filter((d) => d.deadline_date === viewDateStr)
    .sort(compareDeadlines);
  const rangeWork = workSessions.filter((w) => isDateInRange(w.work_date, start, end));
  const monthWorkOverflow = period === 'month' && rangeWork.length > MONTH_LIST_PREVIEW_LIMIT;
  const compactListItems =
    monthWorkOverflow && !showAllMonthWork
      ? rangeWork.slice(0, MONTH_LIST_PREVIEW_LIMIT)
      : rangeWork;

  const goWork = (id) => router.push(`/work/${id}`);
  const goDeadline = (id) => router.push(`/deadline/${id}`);
  const goToDay = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    d.setHours(0, 0, 0, 0);
    setViewDate(d);
    setPeriod('day');
  };
  const urgentDeadlines = deadlines
    .filter((d) => isDeadlineWithinDays(d.deadline_date, d.deadline_time, 7))
    .sort(compareDeadlines);

  function toggleWorkSelection(id) {
    setSelectedWorkIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function enterBulkMode(mode) {
    setBulkActionMode(mode);
    setSelectedWorkIds(new Set());
    setBulkColorValue(null);
    if (monthWorkOverflow) setShowAllMonthWork(true);
  }

  function exitBulkMode() {
    setBulkActionMode(null);
    setSelectedWorkIds(new Set());
    setBulkColorValue(null);
  }

  async function handleBulkDelete() {
    if (selectedWorkIds.size === 0) return;
    if (!confirm(`選択した${selectedWorkIds.size}件の予定を削除しますか？`)) return;
    setBulkActionLoading(true);
    const supabase = createClient();
    const ids = [...selectedWorkIds];
    const { error } = await supabase.from('work_sessions').delete().in('id', ids);
    if (error) {
      alert(error.message);
      setBulkActionLoading(false);
      return;
    }
    await loadData();
    exitBulkMode();
    setBulkActionLoading(false);
  }

  async function handleBulkColorChange() {
    if (selectedWorkIds.size === 0) return;
    setBulkActionLoading(true);
    const supabase = createClient();
    const ids = [...selectedWorkIds];
    const { error } = await supabase
      .from('work_sessions')
      .update({ color: bulkColorValue })
      .in('id', ids);
    if (error) {
      alert(error.message);
      setBulkActionLoading(false);
      return;
    }
    await loadData();
    exitBulkMode();
    setBulkActionLoading(false);
  }

  const bulkActionItems = rangeWork;

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
            <button
              type="button"
              onClick={() => setShowPraiseEditor(true)}
              className="mt-2 text-xs font-semibold text-[#7a6200] underline"
            >
              メッセージを編集
            </button>
          </div>
        )}

        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold">{formatPeriodHeading(period, viewDate)}</h1>
            {period === 'day' && showingCurrentPeriod && (
              <p className="text-[13px] text-[#888]">{formatDateJa(viewDate)}</p>
            )}
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

        <div className="mb-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setViewDate((d) => shiftViewDate(d, period, -1))}
            className="shrink-0 rounded-lg border border-[#e8ebf2] bg-white px-3 py-2 text-[13px] font-semibold text-[#555] hover:bg-[#f8f9fc]"
          >
            ‹ {periodNav.prev}
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[13px] font-semibold text-[#333]">
              {formatPeriodNavLabel(period, viewDate)}
            </p>
            {!showingCurrentPeriod && (
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setHours(0, 0, 0, 0);
                  setViewDate(d);
                }}
                className="mt-0.5 text-xs font-semibold text-[#4f6ef7]"
              >
                {getReturnToTodayLabel(period)}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setViewDate((d) => shiftViewDate(d, period, 1))}
            className="shrink-0 rounded-lg border border-[#e8ebf2] bg-white px-3 py-2 text-[13px] font-semibold text-[#555] hover:bg-[#f8f9fc]"
          >
            {periodNav.next} ›
          </button>
        </div>

        {period === 'day' && (
          <DayBar
            sessions={dayWork}
            deadlines={dayDeadlines}
            showNow={showingCurrentPeriod}
            onSelect={goWork}
            onDeadlineSelect={goDeadline}
            title={showingCurrentPeriod ? '今日の24時間スケジュール' : '24時間スケジュール'}
          />
        )}
        {period === 'week' && (
          <WeekScheduleView
            sessions={rangeWork}
            start={start}
            end={end}
            todayStr={todayStr}
            onSelect={goWork}
            title={showingCurrentPeriod ? '今週のスケジュール' : '週のスケジュール'}
          />
        )}
        {period === 'month' && (
          <MonthScheduleView
            sessions={rangeWork}
            monthStart={monthStart}
            todayStr={todayStr}
            onDateSelect={goToDay}
            title={
              showingCurrentPeriod
                ? '今月のスケジュール'
                : `${monthStart.getFullYear()}年${monthStart.getMonth() + 1}月のスケジュール`
            }
          />
        )}

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-[#888]">
              {urgentDeadlines.length > 0 ? '⚠ 締切が近い' : '締切'}
            </h3>
            <Link
              href="/deadline/new"
              className="shrink-0 rounded-lg border border-[#ffc9c9] bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              ＋ 締切
            </Link>
          </div>
          {urgentDeadlines.length > 0 ? (
            <ul className="rounded-lg border-l-4 border-red-500 bg-red-50 px-3.5 py-1">
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
                          <DeadlineBadge deadline={d} />
                        </div>
                        <p className="text-xs text-[#aaa]">
                          {formatShortDateTime(d.deadline_date, d.deadline_time)}まで
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#888]">7日以内の締切はありません</p>
          )}
        </div>

        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#888]">
            {bulkActionMode === 'delete'
              ? '削除する予定を選択'
              : bulkActionMode === 'color'
                ? '色を変更する予定を選択'
                : formatWorkListHeading(period, viewDate, rangeWork.length)}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            {bulkActionMode ? (
              <button
                type="button"
                onClick={exitBulkMode}
                className="text-xs font-semibold text-[#888]"
              >
                キャンセル
              </button>
            ) : (
              <>
                {monthWorkOverflow && (
                  <button
                    type="button"
                    onClick={() => setShowAllMonthWork((v) => !v)}
                    className="text-xs font-semibold text-[#4f6ef7]"
                  >
                    {showAllMonthWork
                      ? '一部だけ表示'
                      : `すべて表示（${rangeWork.length}件）`}
                  </button>
                )}
                {rangeWork.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => enterBulkMode('color')}
                      className="text-xs font-semibold text-[#4f6ef7]"
                    >
                      まとめて色変更
                    </button>
                    <button
                      type="button"
                      onClick={() => enterBulkMode('delete')}
                      className="text-xs font-semibold text-red-600"
                    >
                      まとめて削除
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        {loading ? (
          <p className="text-sm text-[#888]">読み込み中…</p>
        ) : rangeWork.length === 0 ? (
          <p className="text-sm text-[#888]">予定がありません</p>
        ) : bulkActionMode ? (
          <>
            <CompactWorkList
              items={bulkActionItems}
              showDate={period !== 'day'}
              selectionMode
              selectedIds={selectedWorkIds}
              onToggleSelect={toggleWorkSelection}
            />
            {bulkActionMode === 'color' && (
              <div className="mt-3">
                <ColorPicker value={bulkColorValue} onChange={setBulkColorValue} />
              </div>
            )}
            {bulkActionMode === 'delete' ? (
              <Btn
                variant="danger"
                className="mt-3"
                onClick={handleBulkDelete}
                disabled={bulkActionLoading || selectedWorkIds.size === 0}
              >
                {bulkActionLoading
                  ? '削除中…'
                  : selectedWorkIds.size > 0
                    ? `${selectedWorkIds.size}件を削除`
                    : '削除する予定を選択してください'}
              </Btn>
            ) : (
              <Btn
                className="mt-3"
                onClick={handleBulkColorChange}
                disabled={bulkActionLoading || selectedWorkIds.size === 0}
              >
                {bulkActionLoading
                  ? '変更中…'
                  : selectedWorkIds.size > 0
                    ? `${selectedWorkIds.size}件の色を変更`
                    : '変更する予定を選択してください'}
              </Btn>
            )}
          </>
        ) : period === 'week' || period === 'month' ? (
          <CompactWorkList items={compactListItems} onSelect={goWork} showDate />
        ) : (
          <ul>
            {rangeWork.map((w) => {
              const itemColor = getSessionColor(w);
              return (
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
                        <span
                          className="mr-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                          style={{ background: itemColor }}
                        >
                          作業
                        </span>
                        <span style={{ color: itemColor }}>{w.title}</span>
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
              );
            })}
          </ul>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/work/new"
            className="block rounded-[10px] bg-[#4f6ef7] py-3.5 text-center text-[15px] font-semibold text-white hover:bg-[#3d5ce0]"
          >
            ＋ 作業時間
          </Link>
          <Link
            href="/todos"
            className="block rounded-[10px] bg-[#eef1ff] py-3.5 text-center text-[15px] font-semibold text-[#4f6ef7]"
          >
            やりたいことリスト
          </Link>
        </div>
      </section>

      {showPraiseEditor && (
        <PraiseMessageEditor
          onClose={() => setShowPraiseEditor(false)}
        />
      )}

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
