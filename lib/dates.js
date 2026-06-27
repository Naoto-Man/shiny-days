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

export function normalizeTimeInput(timeStr) {
  return (timeStr || '23:59').slice(0, 5);
}

export function parseDeadlineDateTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${normalizeTimeInput(timeStr)}:00`);
}

export function formatShortDateTime(dateStr, timeStr) {
  return `${formatShortDate(dateStr)} ${normalizeTimeInput(timeStr)}`;
}

export function getDeadlineRemaining(dateStr, timeStr) {
  const deadline = parseDeadlineDateTime(dateStr, timeStr);
  const ms = deadline - new Date();
  if (ms < 0) return { past: true, ms: 0 };
  const hours = Math.ceil(ms / (1000 * 60 * 60));
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return { past: false, ms, hours, days };
}

export function formatDeadlineRemaining(dateStr, timeStr) {
  const { past, hours, days } = getDeadlineRemaining(dateStr, timeStr);
  if (past) return null;
  if (hours < 1) return 'まもなく';
  if (hours < 24) return `あと${hours}時間`;
  if (days === 1) return 'あと1日';
  if (days <= 7) return `あと${days}日`;
  return null;
}

export function isDeadlineWithinDays(dateStr, timeStr, maxDays = 7) {
  const { past, ms } = getDeadlineRemaining(dateStr, timeStr);
  if (past) return false;
  return ms <= maxDays * 24 * 60 * 60 * 1000;
}

export function compareDeadlines(a, b) {
  const da = parseDeadlineDateTime(a.deadline_date, a.deadline_time);
  const db = parseDeadlineDateTime(b.deadline_date, b.deadline_time);
  return da - db;
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
  start.setDate(1);
  end.setFullYear(start.getFullYear(), start.getMonth() + 1, 0);
  return { start, end };
}

export function shiftViewDate(date, period, delta) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (period === 'day') {
    d.setDate(d.getDate() + delta);
  } else if (period === 'week') {
    d.setDate(d.getDate() + delta * 7);
  } else {
    d.setDate(1);
    d.setMonth(d.getMonth() + delta);
  }
  return d;
}

export function isCurrentPeriod(period, viewDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { start: viewStart, end: viewEnd } = getRangeForPeriod(period, viewDate);
  const { start: todayStart, end: todayEnd } = getRangeForPeriod(period, today);
  return viewStart.getTime() === todayStart.getTime() && viewEnd.getTime() === todayEnd.getTime();
}

export function formatPeriodNavLabel(period, viewDate) {
  const { start, end } = getRangeForPeriod(period, viewDate);
  if (period === 'day') {
    return formatDateJa(viewDate);
  }
  if (period === 'week') {
    const startLabel = `${start.getMonth() + 1}/${start.getDate()}`;
    const endLabel = `${end.getMonth() + 1}/${end.getDate()}`;
    return `${start.getFullYear()}年 ${startLabel} – ${endLabel}`;
  }
  return `${start.getFullYear()}年${start.getMonth() + 1}月`;
}

export function formatPeriodHeading(period, viewDate) {
  if (period === 'day') {
    return isCurrentPeriod(period, viewDate) ? '今日の予定' : `${formatDateJa(viewDate)}の予定`;
  }
  if (period === 'week') {
    return isCurrentPeriod(period, viewDate) ? '今週の予定' : '週の予定';
  }
  return isCurrentPeriod(period, viewDate) ? '今月の予定' : '月の予定';
}

export function formatWorkListHeading(period, viewDate, count) {
  if (period === 'day') {
    const prefix = isCurrentPeriod(period, viewDate) ? '今日' : formatShortDate(toDateInputValue(viewDate));
    return `${prefix}の作業時間`;
  }
  if (period === 'week') {
    const prefix = isCurrentPeriod(period, viewDate) ? '今週' : 'この週';
    return `${prefix}の作業時間（${count}件）`;
  }
  const prefix = isCurrentPeriod(period, viewDate) ? '今月' : `${viewDate.getFullYear()}年${viewDate.getMonth() + 1}月`;
  return `${prefix}の作業時間（${count}件）`;
}

export function getPeriodNavButtonLabels(period) {
  if (period === 'day') return { prev: '前日', next: '翌日' };
  if (period === 'week') return { prev: '前週', next: '翌週' };
  return { prev: '前月', next: '翌月' };
}

export function getReturnToTodayLabel(period) {
  if (period === 'day') return '今日に戻る';
  if (period === 'week') return '今週に戻る';
  return '今月に戻る';
}

export function isDateInRange(dateStr, start, end) {
  const d = new Date(dateStr + 'T00:00:00');
  return d >= start && d <= end;
}

export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.slice(0, 5).split(':').map(Number);
  return h * 60 + m;
}

export function getDatesInRange(start, end) {
  const dates = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);
  while (cur <= endDate) {
    dates.push(toDateInputValue(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function getBusyRatio(sessions) {
  let total = 0;
  for (const s of sessions) {
    const start = timeToMinutes(s.start_time);
    const end = timeToMinutes(s.end_time);
    if (end > start) total += end - start;
  }
  return Math.min(total / 1440, 1);
}
