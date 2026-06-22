'use client';

import { formatShortDate } from '@/lib/dates';

export default function CompactWorkList({ items, onSelect }) {
  return (
    <ul className="rounded-lg border border-[#e8ebf2] bg-[#fafbfc]">
      {items.map((w, i) => (
        <li key={w.id} className={i > 0 ? 'border-t border-[#eef1f8]' : ''}>
          <button
            type="button"
            onClick={() => onSelect(w.id)}
            className="flex w-full items-center gap-2 px-2.5 py-2 text-left hover:bg-[#f0f2f5]"
          >
            <span className="w-[54px] shrink-0 text-[10px] font-medium text-[#888]">
              {formatShortDate(w.work_date)}
            </span>
            <span className="w-[76px] shrink-0 text-[10px] font-semibold text-[#666]">
              {w.start_time?.slice(0, 5)}–{w.end_time?.slice(0, 5)}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#333]">
              {w.title}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
