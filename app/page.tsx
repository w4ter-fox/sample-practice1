"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Log = {
  id: string;
  date: string;
  minutes: number;
};


const items = [
  {
    href: "/timer",
    title: "⏱ タイマー",
    desc: "集中して作業する",
  },
  {
    href: "/logs",
    title: "📊 記録",
    desc: "学習の履歴を確認",
  },
  {
    href: "/tags",
    title: "🏷 タグ",
    desc: "カテゴリを管理",
  },
];

const getTodayMinutes = () => {
  const logs: Log[] = JSON.parse(
    localStorage.getItem("logs") || "[]"
  );

  const today = new Date().toDateString();

  return logs
    .filter(
      (log) =>
        new Date(log.date).toDateString() === today
    )
    .reduce((sum, log) => sum + log.minutes, 0);
};

export default function Home() {
  const [todayMinutes, setTodayMinutes] = useState(0);

  useEffect(() => {
    setTodayMinutes(getTodayMinutes());
  }, []);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-2">
        今日は何をする？
      </h1>

      <p className="mb-8 text-lg">
        🕒 今日の学習時間：
        <span className="font-bold ml-2">
          {todayMinutes} 分
        </span>
      </p>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-2xl border p-6 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-2">
              {item.title}
            </h2>
            <p className="text-gray-600">
              {item.desc}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
