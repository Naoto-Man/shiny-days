'use client';

import { timeToMinutes } from '@/lib/dates';
import { getSessionColor } from '@/components/scheduleColors';

export default function MiniDayBar({
  sessions,
  onSelect,
  height = 56,
  showLabels = true,
}) {
  if (!sessions.length) {
    return (
      <div
        className="relative overflow-hidden rounded-md bg-[#eef1f8]"
        style={{ height }}
      />
    );
  }

  const blockTop = Math.max(6, Math.round(height * 0.12));
  const blockHeight = height - blockTop * 2;

  return (
    <div className="relative overflow-hidden rounded-md bg-[#eef1f8]" style={{ height }}>
      {sessions.map((s, i) => {
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
            title={`${s.title} ${s.start_time?.slice(0, 5)}–${s.end_time?.slice(0, 5)}`}
            className="absolute flex items-center justify-center overflow-hidden rounded-md px-0.5 text-[9px] font-bold text-white"
            style={{
              top: blockTop,
              height: blockHeight,
              minWidth: showLabels ? 18 : undefined,
              left: `${left}%`,
              width: `${width}%`,
              background: color,
              writingMode: showLabels ? 'vertical-rl' : undefined,
              textOrientation: showLabels ? 'upright' : undefined,
            }}
          >
            {showLabels ? label : null}
          </button>
        );
      })}
    </div>
  );
}
