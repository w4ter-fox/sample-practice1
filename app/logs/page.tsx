"use client";

import { useEffect, useState } from "react";
import {
  getDailyTotals,
  getTotalStudyDays,
  getTotalMinutes,
  getCurrentStreak,
  getLongestStreak,
  getMinutesByTag,
} from "@/app/lib/logStats";

type Log = {
  date: string;
  minutes: number;
  tag: string;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("logs") || "[]"
    );
    setLogs(stored);
  }, []);

  const dailyTotals = getDailyTotals(logs);
  const currentStreak = getCurrentStreak(dailyTotals);
  const longestStreak = getLongestStreak(dailyTotals);
  const totalDays = getTotalStudyDays(dailyTotals);
  const totalMinutes = getTotalMinutes(logs);
  const byTag = getMinutesByTag(logs);

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">📊 学習ログ</h1>

      {/* サマリー */}
      <section className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-xl shadow">
          🔥 現在のストリーク：{currentStreak}日
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          🏆 最長ストリーク：{longestStreak}日
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          📅 学習日数：{totalDays}日
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          ⏱ 総学習時間：{Math.floor(totalMinutes / 60)}h{" "}
          {totalMinutes % 60}m
        </div>
      </section>

      {/* タグ別 */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-2">🏷 タグ別</h2>
        <ul className="space-y-1 text-sm">
          {Object.entries(byTag).map(([tag, min]) => (
            <li key={tag}>
              {tag}：{min}分
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
