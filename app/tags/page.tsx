"use client";

import { useEffect, useState } from "react";

type Tag = {
  id: string;
  name: string;
};

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");

  // 初回読み込み
  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("tags") || "[]"
    );
    setTags(stored);
  }, []);

  const addTag = () => {
    if (!newTag.trim()) return;

    const tag: Tag = {
      id: crypto.randomUUID(),
      name: newTag,
    };

    const updated = [...tags, tag];
    setTags(updated);
    localStorage.setItem("tags", JSON.stringify(updated));
    setNewTag("");
  };

  const deleteTag = (id: string) => {
    const updated = tags.filter((t) => t.id !== id);
    setTags(updated);
    localStorage.setItem("tags", JSON.stringify(updated));
  };

  return (
    <main className="min-h-screen p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        🏷 タグ管理
      </h1>

      <div className="flex gap-2 mb-6">
        <input
          className="border px-3 py-2 rounded w-full"
          placeholder="新しいタグ"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
        />
        <button
          onClick={addTag}
          className="px-4 py-2 bg-black text-white rounded"
        >
          追加
        </button>
      </div>

      <ul className="space-y-2">
        {tags.map((tag) => (
          <li
            key={tag.id}
            className="flex justify-between items-center border rounded px-4 py-2"
          >
            <span>{tag.name}</span>
            <button
              onClick={() => deleteTag(tag.id)}
              className="text-red-500 text-sm"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
