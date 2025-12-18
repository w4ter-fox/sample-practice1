"use client";

import { useEffect, useState } from "react";

/* =====================
   定数
===================== */
const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;
const MIN_LOG_MINUTES = 5;

type Mode = "work" | "break";

/* =====================
   型
===================== */
type Log = {
  id: string;
  date: string;
  minutes: number;
  tag: string;
};

type Tag = {
  id: string;
  name: string;
};

const UNASSIGNED_TAG: Tag = {
  id: "unassigned",
  name: "未設定",
};

/* =====================
   ログ保存
===================== */
const saveLog = (minutes: number, tag: string) => {
  const logs: Log[] = JSON.parse(
    localStorage.getItem("logs") || "[]"
  );

  logs.push({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    minutes,
    tag,
  });

  localStorage.setItem("logs", JSON.stringify(logs));
};

export default function TimerPage() {
  /* =====================
     state
  ===================== */
  const [mode, setMode] = useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);

  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("unassigned");


  // ★ work開始時刻（ここが肝）
  const [workStartedAt, setWorkStartedAt] =
    useState<number | null>(null);

  /* =====================
     helper
  ===================== */
  const nextMode = (current: Mode) =>
    current === "work" ? "break" : "work";

  const modeToSeconds = (m: Mode) =>
    m === "work" ? WORK_MINUTES * 60 : BREAK_MINUTES * 60;

  /* =====================
     ① タグ読み込み（初回）
  ===================== */
  useEffect(() => {
  const stored: Tag[] = JSON.parse(
    localStorage.getItem("tags") || "[]"
  );

  // ★ 未設定タグを必ず先頭に入れる
  const withUnassigned = [
    UNASSIGNED_TAG,
    ...stored.filter(t => t.id !== "unassigned"),
  ];

  setTags(withUnassigned);
  setSelectedTag("unassigned");}, []);


  /* =====================
     ★ 実作業時間を保存
  ===================== */
  const saveWorkLogIfNeeded = () => {
    if (!workStartedAt || !selectedTag) return;

    const workedMs = Date.now() - workStartedAt;
    const workedMinutes = Math.floor(workedMs / 1000 / 60);

    if (workedMinutes >= MIN_LOG_MINUTES) {
      saveLog(workedMinutes, selectedTag);
    }

    setWorkStartedAt(null);
  };

  /* =====================
     ② タイマー本体
  ===================== */
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // work終了 → ログ保存
          if (mode === "work") {
            saveWorkLogIfNeeded();
          }

          const nm = nextMode(mode);
          setMode(nm);
          return modeToSeconds(nm);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, mode]);

  /* =====================
     操作
  ===================== */
  const start = () => {
    if (mode === "work" && !workStartedAt) {
      setWorkStartedAt(Date.now());
    }
    setIsRunning(true);
  };

  const stop = () => {
    saveWorkLogIfNeeded();
    setIsRunning(false);
  };

  const reset = () => {
    saveWorkLogIfNeeded();
    setIsRunning(false);
    setSecondsLeft(modeToSeconds(mode));
  };

  const switchMode = (newMode: Mode) => {
    if (mode === "work") {saveLog(minutes, selectedTag ?? "unassigned");}

    setIsRunning(false);
    setMode(newMode);
    setSecondsLeft(modeToSeconds(newMode));
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  /* =====================
     JSX
  ===================== */
  return (
    <main className="min-h-screen bg-gray-300 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6">

        <h1 className="text-2xl font-bold text-center">
          ⏱ Study Timer
        </h1>

        {/* タグ */}
        <section>
          <p className="text-sm font-semibold text-gray-600 mb-2">
            タグ
          </p>

          {tags.length === 0 ? (
            <p className="text-sm text-gray-400">
              タグがありません
            </p>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.id)}
                  className={`px-3 py-1 text-sm rounded-full border
                    ${
                      selectedTag === tag.id
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* モード */}
        <div className="flex justify-center gap-2">
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              mode === "work"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            作業
          </span>
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              mode === "break"
                ? "bg-green-600 text-white"
                : "bg-gray-200"
            }`}
          >
            休憩
          </span>
        </div>

        {/* 時間 */}
        <div className="text-5xl font-mono text-center">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>

        {/* 操作 */}
        <div className="flex gap-3">
          <button
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            onClick={start}
            disabled={isRunning}
          >
            Start
          </button>
          <button
            className="flex-1 py-2 rounded-lg bg-gray-300"
            onClick={stop}
          >
            Stop
          </button>
          <button
            className="flex-1 py-2 rounded-lg bg-red-500 text-white"
            onClick={reset}
          >
            Reset
          </button>
        </div>
      </div>
    </main>
  );
}
