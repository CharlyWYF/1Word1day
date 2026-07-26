"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import WordList from "@/components/WordList";
import WordDisplay from "@/components/WordDisplay";
import GradientBackground from "@/components/GradientBackground";

interface WordData {
  id: number;
  word: string;
  phonetic: string | null;
  meaning: string;
  imageUrl: string | null;
  displayDate: string;
}

function HomeContent() {
  const [words, setWords] = useState<WordData[]>([]);
  const [activeWord, setActiveWord] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const findTodayWord = useCallback((allWords: WordData[]) => {
    const today = new Date().toISOString().split("T")[0];
    const todayWord = allWords.find((w) => w.displayDate === today);
    if (todayWord) return todayWord;

    const sorted = [...allWords].sort((a, b) =>
      b.displayDate.localeCompare(a.displayDate)
    );
    return sorted[0] || null;
  }, []);

  useEffect(() => {
    fetch("/api/words")
      .then((res) => {
        if (!res.ok) throw new Error("获取词汇失败");
        return res.json();
      })
      .then((data: WordData[]) => {
        if (!Array.isArray(data)) throw new Error("数据格式错误");
        setWords(data);

        const idParam = searchParams.get("id");
        if (idParam) {
          const found = data.find((w) => w.id === parseInt(idParam));
          if (found) {
            setActiveWord(found);
            setLoading(false);
            return;
          }
        }

        setActiveWord(findTodayWord(data));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load words:", err);
        setLoading(false);
      });
  }, [searchParams, findTodayWord]);

  const handleSelectWord = (id: number) => {
    const word = words.find((w) => w.id === id);
    if (word) {
      setActiveWord(word);
      router.push(`/?id=${id}`, { scroll: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GradientBackground />
        <div className="animate-pulse text-gray-400 text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <GradientBackground />

      <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-white/20 p-4">
        <div className="mb-4 px-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
            每日一词
          </h2>
          <p className="text-[10px] text-gray-400 mt-1">
            {words.length} 个词汇
          </p>
        </div>
        <WordList
          words={words}
          activeId={activeWord?.id ?? null}
          onSelect={handleSelectWord}
        />
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/20">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
            每日一词
          </h2>
          <span className="text-xs text-gray-400">{words.length} 词</span>
        </div>

        <WordDisplay word={activeWord} />
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <GradientBackground />
          <div className="animate-pulse text-gray-400 text-lg">加载中...</div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
