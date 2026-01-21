"use client";

import { useMemo, useState } from "react";
import { db } from "@/app/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { motion, AnimatePresence } from "framer-motion";

export default function LogsPage() {
  const logs = useLiveQuery(() => db.logs.orderBy('date').reverse().toArray()) || [];
  const tags = useLiveQuery(() => db.tags.toArray()) || [];
  const [selectedDate, setSelectedDate] = useState("");

  const totalStudyMinutes = useMemo(() => logs.reduce((sum, l) => sum + l.minutes, 0), [logs]);

  const datesWithLogs = useMemo(() => {
    return logs.reduce<Record<string, number>>((acc, log) => {
      const d = log.date.slice(0, 10);
      acc[d] = (acc[d] || 0) + log.minutes;
      return acc;
    }, {});
  }, [logs]);

  const tagTotals = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach((log) => {
      map[log.tagId] = (map[log.tagId] || 0) + log.minutes;
    });
    return map;
  }, [logs]);

  const streak = useMemo(() => {
    const dates = Object.keys(datesWithLogs).sort((a, b) => b.localeCompare(a));
    if (dates.length === 0) return 0;
    let count = 0;
    let current = new Date();
    const todayStr = current.toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (!datesWithLogs[todayStr] && !datesWithLogs[yesterdayStr]) return 0;
    for (const d of dates) {
      if (new Date(d).toDateString() === current.toDateString()) {
        count++;
        current.setDate(current.getDate() - 1);
      } else { break; }
    }
    return count;
  }, [datesWithLogs]);

  const deleteLog = async (id: string) => {
    if (confirm("この記録を削除しますか？")) await db.logs.delete(id);
  };

  const exportAsMarkdown = () => {
    if (logs.length === 0) return;
    let md = `# 学習記録レポート\n\n- 総学習時間: ${totalStudyMinutes}分\n- ストリーク: ${streak}日\n\n`;
    Object.keys(datesWithLogs).sort((a, b) => b.localeCompare(a)).forEach(date => {
      md += `### ${date} (${datesWithLogs[date]}分)\n`;
      logs.filter(l => l.date.slice(0, 10) === date).forEach(l => {
        const tagName = tags.find(t => t.id === l.tagId)?.name || "未設定";
        md += `- ${l.minutes}分 [${tagName}]\n`;
      });
    });
    navigator.clipboard.writeText(md).then(() => alert("コピーしました"));
  };

  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  const filteredLogs = selectedDate ? logs.filter(l => l.date.slice(0, 10) === selectedDate) : [];

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 pb-32 flex flex-col items-center">
      {/* ヘッダー */}
      <header className="w-full max-w-sm pt-8 mb-8 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mb-1">Analytics</p>
          <h1 className="text-3xl font-light text-slate-800 tracking-tight">学習の軌跡</h1>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={exportAsMarkdown}
          className="bg-white border border-slate-200 p-3 rounded-2xl text-[#2D5A78] shadow-sm"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 16a2 2 0 012-2h4a2 2 0 012 2v5H8v-5zM4 5a2 2 0 012-2h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"/></svg>
        </motion.button>
      </header>

      {/* サマリーカード */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-1">Streak</p>
          <p className="text-2xl font-light text-slate-800">{streak}<span className="text-xs ml-1 text-slate-400">days</span></p>
        </div>
        <div className="bg-[#2D5A78] p-6 rounded-[2rem] shadow-lg shadow-blue-900/10 text-white">
          <p className="text-[9px] font-black text-white/50 tracking-widest uppercase mb-1">Total</p>
          <p className="text-2xl font-light">{totalStudyMinutes}<span className="text-xs ml-1 text-white/50">min</span></p>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <section className="w-full max-w-sm mb-8">
        <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const key = d.toISOString().slice(0, 10);
              const minutes = datesWithLogs[key];
              const isSelected = selectedDate === key;
              return (
                <button 
                  key={key}
                  onClick={() => setSelectedDate(isSelected ? "" : key)}
                  className={`aspect-square rounded-xl text-[10px] font-bold transition-all flex flex-col items-center justify-center border
                    ${isSelected ? "bg-[#2D5A78] border-[#2D5A78] text-white" : "bg-slate-50 border-transparent text-slate-400 hover:border-slate-200"}
                  `}
                >
                  {d.getDate()}
                  {minutes && <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? "bg-white" : "bg-[#2D5A78]"}`} />}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 詳細ログリスト */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full max-w-sm mb-8"
          >
            <h2 className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-3 ml-2">{selectedDate} Details</h2>
            <div className="space-y-3">
              {filteredLogs.map(log => {
                const tag = tags.find(t => t.id === log.tagId);
                return (
                  <div key={log.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: tag?.color || "#E2E8F0" }} />
                      <div>
                        <p className="text-xl font-light text-slate-800">{log.minutes}<span className="text-xs ml-1">min</span></p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{tag?.name || "Unassigned"}</p>
                      </div>
                    </div>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteLog(log.id)}
                      className="p-2 text-slate-200 hover:text-red-400 transition-colors"
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* タグ別サマリー */}
      <section className="w-full max-w-sm">
        <h2 className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4 ml-2">Category Totals</h2>
        <div className="grid gap-3">
          {tags.map(tag => (
            <div key={tag.id} className="bg-white px-6 py-4 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                <span className="text-xs font-bold text-slate-600 tracking-tight">{tag.name}</span>
              </div>
              <span className="text-sm font-light text-slate-800">{tagTotals[tag.id] || 0} min</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}