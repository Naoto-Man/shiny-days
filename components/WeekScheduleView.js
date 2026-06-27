'use client';

import MiniDayBar from '@/components/MiniDayBar';
import { formatShortDate, getDatesInRange } from '@/lib/dates';

function groupByDate(sessions) {
  const map = {};
  for (const s of sessions) {
    if (!map[s.work_date]) map[s.work_date] = [];
    map[s.work_date].push(s);
  }
  return map;
}

export default function WeekScheduleView({ sessions, start, end, todayStr, onSelect, title = '今週のスケジュール' }) {
  const dates = getDatesInRange(start, end);
  const byDate = groupByDate(sessions);

  return (
    <div className="mb-5 rounded-xl border border-[#e8ebf2] bg-[#f8f9fc] p-3.5">
      <h2 className="mb-3 text-[13px] font-semibold text-[#666]">{title}</h2>
      <div className="space-y-2.5">
        {dates.map((dateStr) => {
          const daySessions = byDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          return (
            <div key={dateStr}>
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={`text-[12px] font-semibold ${isToday ? 'text-[#4f6ef7]' : 'text-[#555]'}`}
                >
                  {formatShortDate(dateStr)}
                  {isToday && (
                    <span className="ml-1.5 rounded bg-[#eef1ff] px-1.5 py-0.5 text-[10px] text-[#4f6ef7]">
                      今日
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-[#aaa]">
                  {daySessions.length > 0 ? `${daySessions.length}件` : '予定なし'}
                </span>
              </div>
              <MiniDayBar sessions={daySessions} onSelect={onSelect} height={64} showLabels />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between px-0.5 text-[9px] text-[#aaa]">
        <span>0時</span>
        <span>6時</span>
        <span>12時</span>
        <span>18時</span>
        <span>24時</span>
      </div>
    </div>
  );
}
