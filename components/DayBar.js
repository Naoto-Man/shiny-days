'use client';

import { timeToMinutes } from '@/lib/dates';

const COLORS = ['#4f6ef7', '#38b2ac', '#805ad5', '#ed8936', '#e53e3e'];

export default function DayBar({ sessions, onSelect }) {
  const todaySessions = sessions.filter((s) => s.work_date);

  return (
    <div className="mb-5 rounded-xl border border-[#e8ebf2] bg-[#f8f9fc] p-3.5">
      <h2 className="mb-3 text-[13px] font-semibold text-[#666]">今日の24時間スケジュール</h2>
      <div className="relative h-[88px] overflow-hidden rounded-lg bg-[#eef1f8]">
        <div className="pointer-events-none absolute inset-0 flex">
          {[0, 6, 12, 18, 24].map((h) => (
            <span
              key={h}
              className="flex-1 border-r border-dashed border-[#d0d5e3] pl-0.5 pt-0.5 text-[9px] text-[#aaa] last:border-r-0"
            >
              {h}
            </span>
          ))}
        </div>
        {todaySessions.map((s, i) => {
          const startMin = timeToMinutes(s.start_time);
          const endMin = timeToMinutes(s.end_time);
          const left = (startMin / 1440) * 100;
          const width = Math.max(((endMin - startMin) / 1440) * 100, 3);
          const color = COLORS[i % COLORS.length];
          const label = s.title.length > 4 ? s.title.slice(0, 4) : s.title;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect?.(s.id)}
              title={`${s.start_time?.slice(0, 5)}–${s.end_time?.slice(0, 5)}`}
              className="absolute flex items-center justify-center overflow-hidden rounded-md px-0.5 text-[10px] font-bold text-white"
              style={{
                top: 12,
                height: 64,
                left: `${left}%`,
                width: `${width}%`,
                background: color,
                writingMode: 'vertical-rl',
                textOrientation: 'upright',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2.5">
        {todaySessions.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1.5 text-[11px] text-[#666]">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            {s.start_time?.slice(0, 5)} {s.title}
          </div>
        ))}
      </div>
    </div>
  );
}
