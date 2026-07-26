"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface WordItem {
  id: number;
  word: string;
  meaning: string;
  displayDate: string;
}

export default function AdminPage() {
  const [words, setWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWords = () => {
    fetch("/api/words")
      .then((res) => res.json())
      .then((data: WordItem[]) => {
        setWords(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchWords();
  }, []);

  const handleDelete = async (id: number, word: string) => {
    if (!confirm(`确定要删除 "${word}" 吗？`)) return;

    try {
      const res = await fetch(`/api/words/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWords((prev) => prev.filter((w) => w.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Admin header */}
      <header className="border-b border-white/10 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">管理后台</h1>
          <p className="text-xs text-gray-400">
            共 {words.length} 个词汇
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/new"
            className="px-4 py-2 rounded-xl glass-button text-sm font-medium text-white"
          >
            + 添加词汇
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-white/10 transition-all"
            target="_blank"
          >
            查看主页
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-300 transition-all"
          >
            退出
          </button>
        </div>
      </header>

      {/* Word list */}
      <main className="max-w-4xl mx-auto p-6">
        {words.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-4xl mb-4">📖</p>
            <p className="text-gray-400 mb-4">还没有添加任何词汇</p>
            <Link
              href="/admin/new"
              className="inline-block px-6 py-3 rounded-xl glass-button font-medium text-white"
            >
              添加第一个词汇
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {words.map((item) => (
              <div
                key={item.id}
                className="glass rounded-xl px-5 py-4 flex items-center justify-between group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-24 shrink-0">
                      {item.displayDate}
                    </span>
                    <span className="font-semibold text-white truncate">
                      {item.word}
                    </span>
                    <span className="text-sm text-gray-400 truncate hidden sm:block">
                      {item.meaning}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/admin/edit/${item.id}`}
                    className="px-3 py-1 text-xs rounded-xl glass-button"
                  >
                    编辑
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id, item.word)}
                    className="px-3 py-1 text-xs rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition-all"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
