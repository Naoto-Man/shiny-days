const PRAISE_BY_PERIOD = {
  morning: [
    'おはよう！今日も一日頑張ろうぜ！',
    'おはよう。朝は眠いだろうによく来てくれたね。良い一日になりますように。',
  ],
  afternoon: [
    'こんにちは！午後も一歩ずつ、着実に進もう。',
    'ログインありがとう。午後の予定、ここでさっと確認しよう。',
  ],
  evening: [
    'おかえり！今日もお疲れさま。無理せずいこう。',
    '夜遅くまで頑張ってるね。今日も一日、よくやったよ。',
  ],
};

export const PERIOD_ORDER = ['morning', 'afternoon', 'evening'];

export const PERIOD_LABELS = {
  morning: '朝（4〜12時）',
  afternoon: '昼（12〜18時）',
  evening: '夜（18〜4時）',
};

export function getTimePeriod(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 4 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

export function getRandomPraise(date = new Date()) {
  const period = getTimePeriod(date);
  const messages = PRAISE_BY_PERIOD[period];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getDefaultMessagesForPeriod(period) {
  return PRAISE_BY_PERIOD[period] ?? [];
}
