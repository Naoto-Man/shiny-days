'use client';

import { useEffect, useState } from 'react';
import { normalizeTimeInput, timeToMinutes } from '@/lib/dates';
import { DEADLINE_COLORS, getSessionColor } from '@/components/scheduleColors';

const BAR_TOP = 12;
const BAR_HEIGHT = 64;

function getNowMinutes() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

export default function DayBar({
  sessions,
  deadlines = [],
  showNow = false,
  onSelect,
  onDeadlineSelect,
  title = '24時間スケジュール',
}) {
  const [nowMinutes, setNowMinutes] = useState(getNowMinutes);
  const todaySessions = sessions.filter((s) => s.work_date);

  useEffect(() => {
    if (!showNow) return;
    setNowMinutes(getNowMinutes());
    const id = setInterval(() => setNowMinutes(getNowMinutes()), 60000);
    return () => clearInterval(id);
  }, [showNow]);

  const nowLeft = (nowMinutes / 1440) * 100;

  return (
    <div className="mb-5 rounded-xl border border-[#e8ebf2] bg-[#f8f9fc] p-3.5">
      <h2 className="mb-3 text-[13px] font-semibold text-[#666]">{title}</h2>
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
        {todaySessions.map((s) => {
          const startMin = timeToMinutes(s.start_time);
          const endMin = timeToMinutes(s.end_time);
          const left = (startMin / 1440) * 100;
          const width = Math.max(((endMin - startMin) / 1440) * 100, 3);
          const color = getSessionColor(s);
          const label = s.title.length > 4 ? s.title.slice(0, 4) : s.title;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect?.(s.id)}
              title={`${s.start_time?.slice(0, 5)}–${s.end_time?.slice(0, 5)}`}
              className="absolute z-10 flex items-center justify-center overflow-hidden rounded-md px-0.5 text-[10px] font-bold text-white"
              style={{
                top: BAR_TOP,
                height: BAR_HEIGHT,
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
        {deadlines.map((d, i) => {
          const min = timeToMinutes(normalizeTimeInput(d.deadline_time));
          const left = (min / 1440) * 100;
          const color = DEADLINE_COLORS[i % DEADLINE_COLORS.length];
          const timeLabel = normalizeTimeInput(d.deadline_time);

          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onDeadlineSelect?.(d.id)}
              title={`締切 ${timeLabel} ${d.title}`}
              className="absolute z-20 w-1 -translate-x-1/2 rounded-full"
              style={{
                left: `${left}%`,
                top: BAR_TOP - 2,
                height: BAR_HEIGHT + 4,
                background: color,
                boxShadow: `0 0 0 1px ${color}40`,
              }}
              aria-label={`締切 ${timeLabel} ${d.title}`}
            />
          );
        })}
        {showNow && (
          <div
            className="pointer-events-none absolute z-30 w-0.5 -translate-x-1/2 bg-black"
            style={{
              left: `${nowLeft}%`,
              top: BAR_TOP - 2,
              height: BAR_HEIGHT + 4,
            }}
            aria-hidden
          />
        )}
      </div>
      {todaySessions.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2.5">
          {todaySessions.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5 text-[11px] text-[#666]">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: getSessionColor(s) }} />
              <span style={{ color: getSessionColor(s) }} className="font-semibold">
                {s.start_time?.slice(0, 5)} {s.title}
              </span>
            </div>
          ))}
        </div>
      )}
      {deadlines.length > 0 && (
        <div className={`${todaySessions.length > 0 ? 'mt-2' : 'mt-2.5'} flex flex-wrap gap-2.5`}>
          {deadlines.map((d, i) => {
            const color = DEADLINE_COLORS[i % DEADLINE_COLORS.length];
            const timeLabel = normalizeTimeInput(d.deadline_time);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onDeadlineSelect?.(d.id)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#666] hover:text-[#333]"
              >
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
                <span style={{ color }}>{timeLabel}</span>
                {d.title}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
