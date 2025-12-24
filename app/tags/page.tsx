"use client";

import { useEffect, useState } from "react";

type Tag = {
  id: string;
  name: string;
  color: string;
};

const COLORS = [
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
];

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [error, setError] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  // 初回読み込み
  useEffect(() => {
    const stored: Tag[] = JSON.parse(
      localStorage.getItem("tags") || "[]"
    );
    setTags(stored);
  }, []);

  const addTag = () => {
    const name = newTag.trim();
    if (!name) return;

    const exists = tags.some(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      setError("すでに存在しているタグです");
      return;
    }

    const tag: Tag = {
      id: crypto.randomUUID(),
      name,
      color: selectedColor,
    };

    const updated = [...tags, tag];
    setTags(updated);
    localStorage.setItem("tags", JSON.stringify(updated));

    setNewTag("");
    setError("");
  };

  const deleteTag = (id: string) => {
    const updated = tags.filter((t) => t.id !== id);
    setTags(updated);
    localStorage.setItem("tags", JSON.stringify(updated));
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        🏷 タグ管理
      </h1>

      {/* 追加フォーム */}
      <div className="space-y-4 mb-8">
        <input
          className="border px-4 py-3 rounded-xl w-full text-base"
          placeholder="新しいタグ"
          value={newTag}
          onChange={(e) => {
            setNewTag(e.target.value);
            setError("");
          }}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isComposing) {
              e.preventDefault();
              addTag();
            }
          }}
        />

        {/* カラー選択（タップ最適化） */}
        <div className="flex gap-3 flex-wrap">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-9 h-9 rounded-full border-2 ${
                selectedColor === color
                  ? "border-black"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          onClick={addTag}
          className="w-full py-3 bg-black text-white rounded-xl text-base font-semibold"
        >
          追加
        </button>
      </div>

      {/* タグ一覧 */}
      <ul className="space-y-3">
        {tags.map((tag) => (
          <li
            key={tag.id}
            className="flex justify-between items-center border rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              <span className="text-base">
                {tag.name}
              </span>
            </div>

            <button
              onClick={() => deleteTag(tag.id)}
              className="text-red-500 text-sm px-2 py-1"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
