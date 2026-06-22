export function formatDateJa(date) {
  const d = new Date(date);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
}

export function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}/${d.getDate()}（${weekdays[d.getDay()]}）`;
}

export function toDateInputValue(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

export function getRangeForPeriod(period, baseDate = new Date()) {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);

  if (period === 'day') {
    return { start, end };
  }
  if (period === 'week') {
    end.setDate(end.getDate() + 6);
    return { start, end };
  }
  // month
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  return { start, end };
}

export function isDateInRange(dateStr, start, end) {
  const d = new Date(dateStr + 'T00:00:00');
  return d >= start && d <= end;
}

export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.slice(0, 5).split(':').map(Number);
  return h * 60 + m;
}
