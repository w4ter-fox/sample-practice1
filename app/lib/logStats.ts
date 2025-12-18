// app/lib/logStats.ts

type Log = {
  date: string;
  minutes: number;
  tag: string;
};

/* =====================
   日ごとの合計（5分以上のみ）
   { "2025-12-18": 45, ... }
===================== */
export function getDailyTotals(logs: Log[]) {
  const totals: Record<string, number> = {};

  logs.forEach((log) => {
    if (log.minutes < 5) return;

    const day = log.date.slice(0, 10);
    totals[day] = (totals[day] || 0) + log.minutes;
  });

  return totals;
}

/* =====================
   学習日数
===================== */
export function getTotalStudyDays(
  dailyTotals: Record<string, number>
) {
  return Object.keys(dailyTotals).length;
}

/* =====================
   総学習時間（分）
===================== */
export function getTotalMinutes(logs: Log[]) {
  return logs.reduce((sum, log) => sum + log.minutes, 0);
}

/* =====================
   現在のストリーク
===================== */
export function getCurrentStreak(
  dailyTotals: Record<string, number>
) {
  const days = Object.keys(dailyTotals).sort();
  if (days.length === 0) return 0;

  let streak = 0;
  let current = new Date(days[days.length - 1]);

  for (let i = days.length - 1; i >= 0; i--) {
    const d = new Date(days[i]);
    if (
      (current.getTime() - d.getTime()) /
        (1000 * 60 * 60 * 24) <=
      1
    ) {
      streak++;
      current = d;
    } else {
      break;
    }
  }

  return streak;
}

/* =====================
   最長ストリーク
===================== */
export function getLongestStreak(
  dailyTotals: Record<string, number>
) {
  const days = Object.keys(dailyTotals).sort();
  let longest = 0;
  let streak = 0;
  let prev: Date | null = null;

  for (const day of days) {
    const d = new Date(day);
    if (
      prev &&
      (d.getTime() - prev.getTime()) /
        (1000 * 60 * 60 * 24) ===
        1
    ) {
      streak++;
    } else {
      streak = 1;
    }
    longest = Math.max(longest, streak);
    prev = d;
  }

  return longest;
}

/* =====================
   タグ別合計
===================== */
export function getMinutesByTag(logs: Log[]) {
  const result: Record<string, number> = {};

  logs.forEach((log) => {
    const tag = log.tag || "未設定";
    result[tag] = (result[tag] || 0) + log.minutes;
  });

  return result;
}
