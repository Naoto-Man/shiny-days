'use client';

import { useMemo } from 'react';
import { toDateInputValue } from '@/lib/dates';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export default function MultiCalendar({ year, month, selectedDays, onToggle, today }) {
  const { days, monthLabel } = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return {
      days: cells,
      monthLabel: `${year}年${month + 1}月`,
    };
  }, [year, month]);

  const todayStr = toDateInputValue(today);
  const todayDay =
    today.getFullYear() === year && today.getMonth() === month
      ? today.getDate()
      : null;

  return (
    <div className="rounded-xl border border-[#e8ebf2] bg-[#fafbfc] p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[#333]">{monthLabel}</h3>
      </div>
      <div className="mb-1.5 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w, i) => (
          <span
            key={w}
            className={`py-1 text-center text-[11px] font-semibold ${
              i === 0 ? 'text-red-500' : i === 6 ? 'text-[#4f6ef7]' : 'text-[#aaa]'
            }`}
          >
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dow = new Date(year, month, day).getDay();
          const isSelected = selectedDays.has(dateStr);
          const isToday = day === todayDay;

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onToggle(dateStr)}
              className={`aspect-square rounded-lg text-[13px] font-medium ${
                isSelected
                  ? 'bg-[#4f6ef7] font-bold text-white'
                  : 'text-[#333] hover:bg-[#f0f2f5]'
              } ${isToday ? 'ring-2 ring-red-500 ring-inset' : ''} ${
                !isSelected && dow === 0 ? 'text-red-500' : ''
              } ${!isSelected && dow === 6 ? 'text-[#4f6ef7]' : ''}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
