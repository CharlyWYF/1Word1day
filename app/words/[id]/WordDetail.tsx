"use client";

import { useEffect } from "react";
import GradientBackground from "@/components/GradientBackground";
import GlassCard from "@/components/GlassCard";
import TTSButton from "@/components/TTSButton";
import Image from "next/image";

interface WordData {
  id: number;
  word: string;
  phonetic: string | null;
  meaning: string;
  imageUrl: string | null;
  displayDate: string;
}

export default function WordDetail({ word }: { word: WordData }) {
  // Load voices on mount for TTS
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <GradientBackground />

      <header className="p-4 border-b border-white/20">
        <a
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 transition-all"
        >
          ← 返回首页
        </a>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <GlassCard strong className="w-full max-w-2xl p-8 md:p-12">
          <p className="text-sm text-gray-500 mb-6">{word.displayDate}</p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-800 tracking-tight leading-none mb-4 break-words">
            {word.word}
          </h1>

          {word.phonetic && (
            <p className="text-lg md:text-xl text-gray-500 italic mb-4 font-serif">
              {word.phonetic}
            </p>
          )}

          <p className="text-xl md:text-2xl text-gray-600 mb-6">
            {word.meaning}
          </p>

          <TTSButton word={word.word} />

          {word.imageUrl && (
            <div className="mt-8 glass p-2">
              <Image
                src={word.imageUrl}
                alt={word.word}
                width={800}
                height={500}
                className="w-full h-auto max-h-96 object-contain rounded-lg"
              />
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
}
