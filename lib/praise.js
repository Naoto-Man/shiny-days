export const PRAISE_MESSAGES = [
  'おかえり！今日も一歩ずつ、いい感じです。',
  'ログインありがとう！今日も自分のペースでいきましょう。',
  'いい調子！予定を確認する習慣、続けていこう。',
  'お疲れさま。今日も一つずつ、着実に進もう。',
];

export function getRandomPraise() {
  return PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
}
