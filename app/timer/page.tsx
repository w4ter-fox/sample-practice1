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

/* =====================
   アラーム
===================== */
const playAlarm = () => {
  const audio = new Audio("/sounds/alarm.mp3");
  audio.play();
};

export default function TimerPage() {
  /* =====================
     state
  ===================== */
  const [mode, setMode] = useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);

  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState("unassigned");

  const [soundEnabled, setSoundEnabled] = useState(true);
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
     タグ読み込み
  ===================== */
  useEffect(() => {
    const stored: Tag[] = JSON.parse(
      localStorage.getItem("tags") || "[]"
    );

    const withUnassigned = [
      UNASSIGNED_TAG,
      ...stored.filter(t => t.id !== "unassigned"),
    ];

    setTags(withUnassigned);
    setSelectedTag("unassigned");
  }, []);

  /* =====================
     実作業時間を保存
  ===================== */
  const saveWorkLogIfNeeded = () => {
    if (!workStartedAt) return;

    const workedMs = Date.now() - workStartedAt;
    const workedMinutes = Math.floor(workedMs / 1000 / 60);

    if (workedMinutes >= MIN_LOG_MINUTES) {
      saveLog(workedMinutes, selectedTag);
    }

    setWorkStartedAt(null);
  };

  /* =====================
     タイマー本体
  ===================== */
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (mode === "work") {
            saveWorkLogIfNeeded();
          }

          if (soundEnabled) {
            playAlarm();
          }

          const nm = nextMode(mode);
          setMode(nm);
          return modeToSeconds(nm);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, mode, soundEnabled]);

  /* =====================
     操作
  ===================== */
  const toggleRun = () => {
    if (isRunning) {
      saveWorkLogIfNeeded();
      setIsRunning(false);
    } else {
      if (mode === "work" && !workStartedAt) {
        setWorkStartedAt(Date.now());
      }
      setIsRunning(true);
    }
  };

  const reset = () => {
    saveWorkLogIfNeeded();
    setIsRunning(false);
    setSecondsLeft(modeToSeconds(mode));
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  /* =====================
     JSX（UI最適化）
  ===================== */
  return (
    <main className="min-h-screen bg-gray-200 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-4 space-y-5">

        <h1 className="text-xl font-bold text-center">
          ⏱ Study Timer
        </h1>

        {/* サウンド */}
        <div className="flex justify-center">
          <button
            onClick={() => setSoundEnabled(v => !v)}
            className={`px-4 py-2 rounded-full text-sm border ${
              soundEnabled
                ? "bg-black text-white"
                : "bg-gray-100"
            }`}
          >
            🔔 音 {soundEnabled ? "ON" : "OFF"}
          </button>
        </div>

        {/* タグ（横スクロール） */}
        <section>
          <p className="text-xs font-semibold text-gray-500 mb-1">
            タグ
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id)}
                className={`shrink-0 px-3 py-2 text-sm rounded-full border ${
                  selectedTag === tag.id
                    ? "bg-black text-white"
                    : "bg-gray-100"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </section>

        {/* モード */}
        <div className="flex justify-center gap-2">
          <span
            className={`px-4 py-1 text-sm rounded-full ${
              mode === "work"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            作業
          </span>
          <span
            className={`px-4 py-1 text-sm rounded-full ${
              mode === "break"
                ? "bg-green-600 text-white"
                : "bg-gray-200"
            }`}
          >
            休憩
          </span>
        </div>

        {/* 時間（大きく） */}
        <div className="text-6xl font-mono text-center tracking-tight">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>

        {/* 操作ボタン */}
        <div className="flex gap-3">
          <button
            className={`flex-1 h-14 rounded-xl text-lg font-semibold text-white ${
              isRunning ? "bg-gray-600" : "bg-blue-600"
            }`}
            onClick={toggleRun}
          >
            {isRunning ? "Stop" : "Start"}
          </button>

          <button
            className="flex-1 h-14 rounded-xl bg-red-500 text-lg font-semibold text-white"
            onClick={reset}
          >
            Reset
          </button>
        </div>
      </div>
    </main>
  );
}
