"use client";

import { useState } from "react";
import { db } from "@/app/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { motion, AnimatePresence } from "framer-motion";

export default function TagsPage() {
  const tags = useLiveQuery(() => db.tags.toArray()) || [];
  const [name, setName] = useState("");
  const [color, setColor] = useState("#2D5A78");

  const addTag = async () => {
    if (!name) return;
    await db.tags.add({
      id: crypto.randomUUID(),
      name,
      color,
    });
    setName("");
  };

  const deleteTag = async (id: string) => {
    if (confirm("このタグを削除しますか？")) {
      await db.tags.delete(id);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 pb-32 flex flex-col items-center">
      {/* ヘッダー */}
      <header className="w-full max-w-sm pt-8 mb-10">
        <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mb-1">Configuration</p>
        <h1 className="text-3xl font-light text-slate-800 tracking-tight">カテゴリ管理</h1>
      </header>

      {/* 新規作成セクション */}
      <section className="w-full max-w-sm mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(45,90,120,0.05)]">
          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4 ml-1">New Category</p>
          
          <div className="space-y-6">
            {/* 名前入力 */}
            <input
              type="text"
              placeholder="タグの名前を入力..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#2D5A78]/20 transition-all outline-none text-slate-700 placeholder:text-slate-300"
            />

            {/* カラー選択 */}
            <div className="flex items-center gap-4 px-1">
              <div 
                className="w-12 h-12 rounded-2xl shadow-inner border-2 border-white"
                style={{ backgroundColor: color }}
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-full cursor-pointer bg-transparent border-none"
              />
            </div>

            {/* 追加ボタン */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={addTag}
              className="w-full bg-[#2D5A78] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/10 tracking-widest uppercase"
            >
              Add Category
            </motion.button>
          </div>
        </div>
      </section>

      {/* タグ一覧 */}
      <section className="w-full max-w-sm">
        <h2 className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4 ml-2">Current Tags</h2>
        <div className="grid gap-3">
          <AnimatePresence>
            {tags.map((tag) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white px-6 py-4 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm group"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm font-bold text-slate-600 tracking-tight">{tag.name}</span>
                </div>
                
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteTag(tag.id)}
                  className="p-2 text-slate-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>

          {tags.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
              <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">No Tags Found</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}