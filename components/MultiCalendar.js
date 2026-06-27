'use client';

import { useMemo, useState } from 'react';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export default function MultiCalendar({ year, month, selectedDays, onToggle, today }) {
  const [viewYear, setViewYear] = useState(year);
  const [viewMonth, setViewMonth] = useState(month);

  const { days, monthLabel } = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return {
      days: cells,
      monthLabel: `${viewYear}年${viewMonth + 1}月`,
    };
  }, [viewYear, viewMonth]);

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const todayDay =
    today.getFullYear() === viewYear && today.getMonth() === viewMonth
      ? today.getDate()
      : null;

  return (
    <div className="rounded-xl border border-[#e8ebf2] bg-[#fafbfc] p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-[#666] hover:bg-[#f0f2f5]"
          aria-label="前の月"
        >
          ‹
        </button>
        <h3 className="text-[15px] font-bold text-[#333]">{monthLabel}</h3>
        <button
          type="button"
          onClick={goNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-[#666] hover:bg-[#f0f2f5]"
          aria-label="次の月"
        >
          ›
        </button>
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
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dow = new Date(viewYear, viewMonth, day).getDay();
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
