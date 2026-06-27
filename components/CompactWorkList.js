'use client';

import { formatShortDate } from '@/lib/dates';
import { getSessionColor } from '@/components/scheduleColors';

export default function CompactWorkList({
  items,
  onSelect,
  showDate = true,
  selectionMode = false,
  selectedIds,
  onToggleSelect,
}) {
  return (
    <ul className="rounded-lg border border-[#e8ebf2] bg-[#fafbfc]">
      {items.map((w, i) => {
        const itemColor = getSessionColor(w);
        return (
        <li key={w.id} className={i > 0 ? 'border-t border-[#eef1f8]' : ''}>
          {selectionMode ? (
            <label className="flex w-full cursor-pointer items-center gap-2 px-2.5 py-2.5 hover:bg-[#f0f2f5]">
              <input
                type="checkbox"
                checked={selectedIds?.has(w.id) ?? false}
                onChange={() => onToggleSelect?.(w.id)}
                className="h-4 w-4 shrink-0 accent-[#4f6ef7]"
              />
              {showDate && (
                <span className="w-[54px] shrink-0 text-[10px] font-medium text-[#888]">
                  {formatShortDate(w.work_date)}
                </span>
              )}
              <span className={`shrink-0 text-[10px] font-semibold text-[#666] ${showDate ? 'w-[76px]' : 'w-[88px]'}`}>
                {w.start_time?.slice(0, 5)}–{w.end_time?.slice(0, 5)}
              </span>
              <span
                className="min-w-0 flex-1 truncate text-[13px] font-semibold"
                style={{ color: itemColor }}
              >
                {w.title}
              </span>
            </label>
          ) : (
            <button
              type="button"
              onClick={() => onSelect?.(w.id)}
              className="flex w-full items-center gap-2 px-2.5 py-2 text-left hover:bg-[#f0f2f5]"
            >
              {showDate && (
                <span className="w-[54px] shrink-0 text-[10px] font-medium text-[#888]">
                  {formatShortDate(w.work_date)}
                </span>
              )}
              <span className={`shrink-0 text-[10px] font-semibold text-[#666] ${showDate ? 'w-[76px]' : 'w-[88px]'}`}>
                {w.start_time?.slice(0, 5)}–{w.end_time?.slice(0, 5)}
              </span>
              <span
                className="min-w-0 flex-1 truncate text-[13px] font-semibold"
                style={{ color: itemColor }}
              >
                {w.title}
              </span>
            </button>
          )}
        </li>
        );
      })}
    </ul>
  );
}
