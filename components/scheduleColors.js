export const SCHEDULE_COLORS = [
  '#4f6ef7', // 青
  '#38b2ac', // ティール
  '#805ad5', // 紫
  '#ed8936', // オレンジ
  '#e53e3e', // 赤
  '#d53f8c', // ピンク
  '#38a169', // 緑
  '#2b6cb0', // 紺
  '#b7791f', // ゴールド
  '#718096', // グレー
];

export const DEADLINE_COLORS = ['#e53e3e', '#dd6b20', '#d69e2e', '#c05621', '#9b2c2c'];

function colorIndexFromId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % SCHEDULE_COLORS.length;
}

export function getSessionColor(session) {
  if (session?.color) return session.color;
  if (session?.id) return SCHEDULE_COLORS[colorIndexFromId(session.id)];
  return SCHEDULE_COLORS[0];
}
