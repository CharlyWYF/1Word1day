"use client";

import GlassCard from "./GlassCard";
import TTSButton from "./TTSButton";
import Image from "next/image";

interface WordData {
  id: number;
  word: string;
  phonetic: string | null;
  meaning: string;
  imageUrl: string | null;
  displayDate: string;
}

export default function WordDisplay({ word }: { word: WordData | null }) {
  if (!word) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <GlassCard strong className="p-12 text-center max-w-lg">
          <p className="text-4xl mb-4">📖</p>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            还没有词汇
          </h2>
          <p className="text-gray-500">
            等待管理员添加第一个每日一词吧
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
      <GlassCard strong className="w-full max-w-2xl p-8 md:p-12">
        {/* Date */}
        <p className="text-sm text-gray-500 mb-6">
          {word.displayDate}
        </p>

        {/* Word */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-800 tracking-tight leading-none mb-4 break-words">
          {word.word}
        </h1>

        {/* Phonetic */}
        {word.phonetic && (
          <p className="text-lg md:text-xl text-gray-500 italic mb-4 font-serif">
            {word.phonetic}
          </p>
        )}

        {/* Chinese Meaning */}
        <p className="text-xl md:text-2xl text-gray-600 mb-6">
          {word.meaning}
        </p>

        {/* TTS Button */}
        <TTSButton word={word.word} />

        {/* Image */}
        {word.imageUrl && (
          <div className="mt-8 glass rounded-xl p-2">
            <Image
              src={word.imageUrl}
              alt={word.word}
              width={800}
              height={500}
              className="w-full h-auto max-h-96 object-contain rounded-lg"
              priority
            />
          </div>
        )}
      </GlassCard>
    </div>
  );
}
