"use client";

import { useEffect, useMemo, useState } from "react";

/* =====================
   型
===================== */
type Log = {
  id: string;
  date: string;
  minutes: number;
  tags?: string[];
};

type Tag = {
  id: string;
  name: string;
  color: string;
};

/* =====================
   ログ取得
===================== */
const getLogs = (): Log[] =>
  JSON.parse(localStorage.getItem("logs") || "[]");

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  /* =====================
     初回読み込み
  ===================== */
  useEffect(() => {
    setLogs(getLogs());

    const storedTags: Tag[] = JSON.parse(
      localStorage.getItem("tags") || "[]"
    );
    setTags(storedTags);
  }, []);

  /* =====================
     総学習時間（消さない）
  ===================== */
  const totalStudyMinutes = useMemo(
    () => logs.reduce((sum, l) => sum + l.minutes, 0),
    [logs]
  );

  /* =====================
     選択日の合計
  ===================== */
  const dailyMinutes = useMemo(() => {
    if (!selectedDate) return 0;
    return logs
      .filter(
        (l) =>
          new Date(l.date).toISOString().slice(0, 10) ===
          selectedDate
      )
      .reduce((sum, l) => sum + l.minutes, 0);
  }, [logs, selectedDate]);

  /* =====================
     ストリーク
  ===================== */
  const streak = useMemo(() => {
    const dates = Array.from(
      new Set(
        logs.map((l) =>
          new Date(l.date).toDateString()
        )
      )
    ).sort(
      (a, b) =>
        new Date(b).getTime() -
        new Date(a).getTime()
    );

    let count = 0;
    let current = new Date();

    for (const d of dates) {
      if (
        new Date(d).toDateString() ===
        current.toDateString()
      ) {
        count++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }

    return count;
  }, [logs]);

  /* =====================
     選択日のログ
  ===================== */
  const logsOfDay = selectedDate
    ? logs.filter(
        (l) =>
          new Date(l.date).toISOString().slice(0, 10) ===
          selectedDate
      )
    : [];

  /* =====================
     カレンダー用（日別合計）
  ===================== */
  const datesWithLogs = useMemo(() => {
    return logs.reduce<Record<string, number>>(
      (acc, log) => {
        const d = new Date(log.date)
          .toISOString()
          .slice(0, 10);
        acc[d] = (acc[d] || 0) + log.minutes;
        return acc;
      },
      {}
    );
  }, [logs]);

  /* =====================
     タグ別合計（復活）
  ===================== */
  const tagTotals = useMemo(() => {
    const map: Record<string, number> = {};

    logs.forEach((log) => {
      log.tags?.forEach((tagId) => {
        map[tagId] = (map[tagId] || 0) + log.minutes;
      });
    });

    return map;
  }, [logs]);

  /* =====================
     直近30日
  ===================== */
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  });

  /* =====================
     JSX
  ===================== */
  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        📊 学習ログ
      </h1>

      {/* ===== 統計（全部残す） ===== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            🔥 ストリーク
          </p>
          <p className="text-xl font-bold">
            {streak} 日
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            ⏱ 総学習時間
          </p>
          <p className="text-xl font-bold">
            {totalStudyMinutes} 分
          </p>
        </div>
      </section>

      {/* ===== 日付選択（PC補助） ===== */}
      <div className="hidden sm:block mb-4">
        <input
          type="date"
          className="border rounded px-3 py-2"
          value={selectedDate}
          onChange={(e) =>
            setSelectedDate(e.target.value)
          }
        />
      </div>

      {/* ===== カレンダー ===== */}
      <section className="grid grid-cols-7 gap-2 mb-6">
        {days.map((d) => {
          const key = d.toISOString().slice(0, 10);
          const minutes = datesWithLogs[key];

          return (
            <button
              key={key}
              onClick={() => setSelectedDate(key)}
              className={`aspect-square rounded border flex flex-col items-center justify-center text-sm
                ${
                  selectedDate === key
                    ? "bg-black text-white"
                    : "hover:bg-gray-50"
                }`}
            >
              <span>{d.getDate()}</span>
              {minutes && (
                <span className="text-[10px]">
                  {minutes}分
                </span>
              )}
            </button>
          );
        })}
      </section>

      {/* ===== 選択日の合計 ===== */}
      {selectedDate && (
        <p className="mb-4 font-semibold">
          この日の合計：{dailyMinutes} 分
        </p>
      )}

      {/* ===== ログ一覧 ===== */}
      <section className="space-y-3">
        {logsOfDay.length === 0 && selectedDate && (
          <p className="text-gray-500">
            この日のログはありません
          </p>
        )}

        {logsOfDay.map((log) => (
          <div
            key={log.id}
            className="border rounded-xl p-4"
          >
            <p className="text-lg font-bold">
              {log.minutes} 分
            </p>
          </div>
        ))}
      </section>

      {/* ===== タグ別学習時間（完全復活） ===== */}
      <section className="mt-8">
        <h2 className="font-bold mb-3">
          🏷 タグ別学習時間
        </h2>

        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex justify-between items-center border rounded px-3 py-2"
            >
              <span
                className="px-2 py-1 rounded text-white text-sm"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>

              <span className="font-semibold">
                {tagTotals[tag.id] || 0} 分
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
