"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/app/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "framer-motion";

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

export default function TimerPage() {
  const tags = useLiveQuery(() => db.tags.toArray()) || [];
  const [mode, setMode] = useState<"work" | "break">("work");
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState("unassigned");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const totalSeconds = mode === "work" ? WORK_MINUTES * 60 : BREAK_MINUTES * 60;
  const progress = (totalSeconds - secondsLeft) / totalSeconds;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 状態復元（既存維持） ---
  useEffect(() => {
    const savedEndTime = localStorage.getItem("timerEndTime");
    const savedSeconds = localStorage.getItem("timerSecondsLeft");
    const savedMode = localStorage.getItem("timerMode") as "work" | "break";
    if (savedMode) setMode(savedMode);
    if (savedEndTime) {
      const remaining = Math.round((parseInt(savedEndTime) - Date.now()) / 1000);
      if (remaining > 0) { setSecondsLeft(remaining); setIsRunning(true); }
    } else if (savedSeconds) {
      setSecondsLeft(parseInt(savedSeconds));
    }
  }, []);

  // --- タイマーループ ---
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    localStorage.removeItem("timerEndTime");
    if (mode === "work") {
      await db.logs.add({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        minutes: WORK_MINUTES,
        tagId: selectedTagId,
      });
    }
    if (soundEnabled) {
      new Audio("/sounds/alarm.mp3").play().catch(() => {});
    }
    const next = mode === "work" ? "break" : "work";
    setMode(next);
    setSecondsLeft(next === "work" ? WORK_MINUTES * 60 : BREAK_MINUTES * 60);
  };

  const toggleRun = () => {
    if (isRunning) {
      setIsRunning(false);
      localStorage.removeItem("timerEndTime");
      localStorage.setItem("timerSecondsLeft", secondsLeft.toString());
    } else {
      localStorage.setItem("timerEndTime", (Date.now() + secondsLeft * 1000).toString());
      setIsRunning(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-6 pb-32">
      {/* ヘッダー：タグ設定ボタンを削除し、アラーム音のみを右側に配置 */}
      <div className="w-full max-w-sm flex justify-end items-center mb-14 px-2">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all duration-300 tracking-widest ${
            soundEnabled 
            ? "bg-[#2D5A78] text-white shadow-md shadow-blue-900/10" 
            : "bg-[#2D5A78]/30 text-[#2D5A78]"
          }`}
        >
          ALARM: {soundEnabled ? "ON" : "OFF"}
        </motion.button>
      </div>

      {/* メインタイマーユニット */}
      <div className="relative w-80 h-80 mb-14">
        {/* 外側の細いネイビーのアウトライン */}
        <div className="absolute inset-0 rounded-full border border-[#2D5A78]/20 z-0" />
        
        {/* メインサークル */}
        <div className="absolute inset-2 bg-white rounded-full shadow-[0_30px_60px_-12px_rgba(45,90,120,0.12)] border border-[#2D5A78]/30 overflow-hidden z-10">
          
          {/* 水位上昇アニメーション */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-[#2D5A78]/5"
            initial={{ height: "0%" }}
            animate={{ height: `${progress * 100}%` }}
            transition={{ type: "spring", damping: 30, stiffness: 50 }}
          />

          {/* コンテンツ層 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <span className="text-[10px] font-black tracking-[0.4em] text-slate-300 uppercase mb-4">
              {mode === "work" ? "Focus" : "Rest"}
            </span>
            
            <span className="text-7xl font-light text-slate-800 tracking-tighter tabular-nums">
              {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
            </span>

            <div className="flex gap-4 mt-10">
              <motion.button 
                whileTap={{ scale: 0.92 }}
                onClick={toggleRun}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  isRunning 
                  ? "bg-slate-50 text-slate-300" 
                  : "bg-[#2D5A78]/20 text-[#2D5A78] hover:bg-[#2D5A78]/30"
                }`}
              >
                {isRunning ? (
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                )}
              </motion.button>
              
              <motion.button 
                whileTap={{ scale: 0.92 }}
                onClick={() => { setIsRunning(false); setSecondsLeft(totalSeconds); }}
                className="w-14 h-14 rounded-2xl bg-slate-50/30 text-slate-200 flex items-center justify-center border border-slate-100"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* モードセレクター */}
      <div className="w-full max-w-[240px] bg-white p-1 rounded-[2rem] shadow-sm border border-slate-100 flex mb-12">
        <button 
          onClick={() => { if(!isRunning) { setMode("work"); setSecondsLeft(WORK_MINUTES*60); }}}
          className={`flex-1 py-3 text-sm font-black rounded-[1.6rem] transition-all ${
            mode === "work" ? "bg-[#2D5A78] text-white shadow-lg shadow-blue-900/10" : "text-slate-300"
          }`}
        >
          WORK
        </button>
        <button 
          onClick={() => { if(!isRunning) { setMode("break"); setSecondsLeft(BREAK_MINUTES*60); }}}
          className={`flex-1 py-3 text-sm font-black rounded-[1.6rem] transition-all ${
            mode === "break" ? "bg-[#2D5A78] text-white shadow-lg shadow-blue-900/10" : "text-slate-300"
          }`}
        >
          BREAK
        </button>
      </div>

      {/* カテゴリ選択チップス：ここに集約 */}
      <div className="w-full max-w-sm px-2">
        <p className="text-[9px] font-black text-slate-400 mb-3 ml-2 tracking-widest uppercase">Select Category</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
          <button
            onClick={() => setSelectedTagId("unassigned")}
            className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-bold border transition-all ${
              selectedTagId === "unassigned" ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-400"
            }`}
          >
            None
          </button>
          {tags.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTagId(t.id)}
              className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-bold border transition-all`}
              style={{ 
                borderColor: selectedTagId === t.id ? t.color : '#F1F5F9',
                backgroundColor: selectedTagId === t.id ? t.color : 'white',
                color: selectedTagId === t.id ? 'white' : '#94A3B8'
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}