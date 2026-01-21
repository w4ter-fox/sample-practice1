"use client";

import { useMemo, useState, useEffect } from "react";
import { db } from "@/app/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const logs = useLiveQuery(() => db.logs.toArray()) || [];
  const [dailyGoal, setDailyGoal] = useState(100);
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    const savedGoal = localStorage.getItem("dailyStudyGoal");
    if (savedGoal) setDailyGoal(parseInt(savedGoal, 10));
  }, []);

  const formatTime = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const todayMinutes = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return logs
      .filter(l => l.date.slice(0, 10) === today)
      .reduce((sum, l) => sum + l.minutes, 0);
  }, [logs]);

  const progress = Math.min(todayMinutes / dailyGoal, 1);
  const percentage = Math.round((todayMinutes / dailyGoal) * 100);

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGoal = parseInt(e.target.value, 10);
    setDailyGoal(newGoal);
    localStorage.setItem("dailyStudyGoal", newGoal.toString());
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 pb-32 flex flex-col items-center">
      <header className="w-full max-w-sm pt-12 mb-8">
        <p className="text-[10px] font-black text-slate-300 tracking-[0.4em] uppercase">Pomodoro timer</p>
      </header>

      <motion.div 
        layout
        className={`w-full max-w-sm rounded-[2.5rem] p-8 border transition-all duration-500 relative overflow-hidden ${
          isAdjusting 
          ? "bg-slate-50 border-[#2D5A78]/30 shadow-inner" 
          : "bg-white border-slate-100 shadow-[0_25px_60px_-15px_rgba(45,90,120,0.1)]"
        }`}
      >
        <motion.div 
          animate={{ height: `${progress * 100}%`, opacity: isAdjusting ? 0.05 : 0.15 }}
          className="absolute bottom-0 left-0 right-0 bg-[#2D5A78] z-0"
        />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <motion.div layout>
              <p className="text-[10px] font-black text-[#2D5A78]/40 tracking-widest mb-1 uppercase">Today</p>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-light text-slate-800 tracking-tighter">{formatTime(todayMinutes)}</span>
                <span className="text-2xl font-light text-[#2D5A78]">/ {percentage}%</span>
              </div>
            </motion.div>
            
            <motion.button 
              layout
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAdjusting(!isAdjusting)}
              className={`flex flex-col items-end p-2 -mr-2 rounded-2xl transition-all ${
                isAdjusting ? "bg-[#2D5A78]/10 shadow-inner" : "hover:bg-slate-50"
              }`}
            >
              <p className="text-[9px] font-black text-slate-300 tracking-widest mb-1 uppercase flex items-center gap-1 text-right">
                Goal <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </p>
              <span className={`text-xl font-bold tracking-tight ${isAdjusting ? "text-[#2D5A78]" : "text-slate-400"}`}>
                {formatTime(dailyGoal)}
              </span>
            </motion.button>
          </div>
          
          <div className="relative h-12 flex items-center">
            <AnimatePresence mode="wait">
              {isAdjusting ? (
                <motion.div 
                  key="slider" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full flex flex-col gap-2"
                >
                  <input 
                    type="range" min="30" max="480" step="15" 
                    value={dailyGoal} onChange={handleGoalChange}
                    className="w-full h-2 bg-[#2D5A78]/10 rounded-full appearance-none cursor-pointer accent-[#2D5A78]"
                  />
                  <div className="flex justify-between text-[8px] font-black text-[#2D5A78]/40 tracking-tighter uppercase px-1">
                    <span>Short</span><span>Slide to adjust goal</span><span>Long</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div layoutId="progress-bar" className="h-full bg-[#2D5A78]" style={{ width: `${progress * 100}%` }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-sm grid grid-cols-1 gap-4 mt-8">
        <MenuLink 
          href="/timer" title="Start Session" desc="タイマーを開始する" 
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          primary
        />
        <div className="grid grid-cols-2 gap-4">
          <MenuLink href="/logs" title="History" desc="記録と統計" icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>} />
          <MenuLink href="/tags" title="Tags" desc="カテゴリ設定" icon={<svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>} />
        </div>
      </div>
    </main>
  );
}

function MenuLink({ href, title, desc, icon, primary = false }: any) {
  return (
    <Link href={href}>
      <motion.div whileTap={{ scale: 0.97 }} className={`p-6 rounded-[2rem] border transition-all flex flex-col gap-4 shadow-sm ${primary ? "bg-[#2D5A78] text-white shadow-lg border-transparent" : "bg-white border-slate-100 text-slate-800"}`}>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${primary ? "bg-white/10" : "bg-slate-50"}`}>{icon}</div>
        <div><h2 className="text-sm font-black tracking-widest uppercase">{title}</h2><p className={`text-[11px] ${primary ? "text-white/60" : "text-slate-400"}`}>{desc}</p></div>
      </motion.div>
    </Link>
  );
}