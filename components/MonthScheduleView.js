'use client';

import { SCHEDULE_COLORS } from '@/components/scheduleColors';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function groupByDate(sessions) {
  const map = {};
  for (const s of sessions) {
    if (!map[s.work_date]) map[s.work_date] = [];
    map[s.work_date].push(s);
  }
  return map;
}

function firstSessionOfDay(sessions) {
  if (!sessions.length) return null;
  return [...sessions].sort((a, b) => a.start_time.localeCompare(b.start_time))[0];
}

export default function MonthScheduleView({ sessions, monthStart, todayStr, onSelect }) {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDate = groupByDate(sessions);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function dateStrForDay(day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return (
    <div className="mb-5 rounded-xl border border-[#e8ebf2] bg-[#f8f9fc] p-3.5">
      <h2 className="mb-3 text-[13px] font-semibold text-[#666]">
        {year}年{month + 1}月のスケジュール
      </h2>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w, i) => (
          <span
            key={w}
            className={`py-1 text-center text-[10px] font-semibold ${
              i === 0 ? 'text-red-500' : i === 6 ? 'text-[#4f6ef7]' : 'text-[#aaa]'
            }`}
          >
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = dateStrForDay(day);
          const daySessions = byDate[dateStr] || [];
          const first = firstSessionOfDay(daySessions);
          const isToday = dateStr === todayStr;
          const dow = new Date(year, month, day).getDay();
          const moreCount = daySessions.length > 1 ? daySessions.length - 1 : 0;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => first && onSelect?.(first.id)}
              className={`flex min-h-[72px] flex-col rounded-lg border border-[#e8ebf2] bg-white p-1.5 text-left ${
                isToday ? 'ring-2 ring-red-500 ring-inset' : ''
              } ${first ? 'cursor-pointer hover:bg-[#f8f9fc]' : 'cursor-default'}`}
            >
              <span
                className={`text-[11px] font-semibold leading-none ${
                  isToday
                    ? 'text-[#4f6ef7]'
                    : dow === 0
                      ? 'text-red-500'
                      : dow === 6
                        ? 'text-[#4f6ef7]'
                        : 'text-[#444]'
                }`}
              >
                {day}
              </span>
              {first ? (
                <div className="mt-1.5 flex min-h-0 flex-1 flex-col">
                  <span
                    className="mb-0.5 inline-block w-fit rounded px-1 py-0.5 text-[8px] font-bold text-white"
                    style={{ background: SCHEDULE_COLORS[0] }}
                  >
                    {first.start_time?.slice(0, 5)}
                  </span>
                  <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-[#333]">
                    {first.title}
                  </span>
                  {moreCount > 0 && (
                    <span className="mt-auto pt-0.5 text-[9px] text-[#aaa]">他{moreCount}件</span>
                  )}
                </div>
              ) : (
                <span className="mt-1.5 text-[9px] text-[#ccc]">—</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-[#aaa]">
        各マスには、その日の最初の予定を表示しています
      </p>
    </div>
  );
}
