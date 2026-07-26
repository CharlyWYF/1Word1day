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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
      if (isMobile) setSidebarOpen(false);
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
    <div className="min-h-screen lg:flex">
      <GradientBackground />

      {/* Sidebar — desktop: alongside content, collapsible; mobile: fullscreen overlay */}
      <aside
        className={`
          shrink-0 bg-black/50 backdrop-blur-md border-r border-white/10 p-4
          transition-all duration-300 ease-in-out overflow-hidden
          fixed inset-y-0 left-0 z-30
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:backdrop-blur-none
          lg:translate-x-0
        `}
        style={{ width: sidebarOpen ? "18rem" : "0" }}
      >
        <div className="mb-4 px-4 flex items-center justify-between">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
              每日一词
            </h2>
            <p className="text-[10px] text-gray-400 mt-1">
              {words.length} 个词汇
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors lg:hidden"
            aria-label="关闭"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <WordList
          words={words}
          activeId={activeWord?.id ?? null}
          onSelect={handleSelectWord}
        />
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-20 bg-black/20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 min-h-screen flex flex-col min-w-0">
        <div className="flex items-center gap-2 p-4 border-b border-white/10">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="flex items-center gap-1.5 glass-button rounded-xl px-3 py-2 text-xs text-gray-400 hover:text-gray-200 transition-all"
            aria-label={sidebarOpen ? "隐藏词汇表" : "显示词汇表"}
          >
            {sidebarOpen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
            <span className="hidden sm:inline">{sidebarOpen ? "关闭" : "词汇表"}</span>
          </button>
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
