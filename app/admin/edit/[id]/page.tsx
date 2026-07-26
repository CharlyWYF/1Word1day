"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import WordForm from "@/components/admin/WordForm";

interface WordData {
  id: number;
  word: string;
  phonetic: string | null;
  meaning: string;
  imageUrl: string | null;
  displayDate: string;
}

export default function EditWordPage() {
  const { id } = useParams<{ id: string }>();
  const [word, setWord] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/words/${id}`)
      .then((res) => res.json())
      .then((data: WordData) => {
        setWord(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">词汇不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/20 p-4">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 transition-all"
        >
          ← 返回管理后台
        </Link>
        <h1 className="text-lg font-semibold text-gray-800 mt-1">
          编辑：{word.word}
        </h1>
      </header>
      <main className="max-w-2xl mx-auto p-6">
        <div className="glass rounded-2xl p-8">
          <WordForm initialData={word} />
        </div>
      </main>
    </div>
  );
}
