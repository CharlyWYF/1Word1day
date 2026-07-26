"use client";

import { useState } from "react";

interface TTSButtonProps {
  word: string;
  lang?: string;
}

export default function TTSButton({ word, lang = "en-US" }: TTSButtonProps) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = () => {
    if (!window.speechSynthesis) {
      setError("您的浏览器不支持语音播放");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    setPlaying(true);
    setError(null);

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.pitch = 1;

    // Try to find a voice for the target language
    const voices = window.speechSynthesis.getVoices();
    const langVoice = voices.find(
      (v) => v.lang.startsWith("en") && v.lang.includes("US")
    );
    if (langVoice) utterance.voice = langVoice;

    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => {
      setPlaying(false);
      setError("播放失败");
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={speak}
        disabled={playing}
        className="w-12 h-12 flex items-center justify-center glass-button rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`朗读 ${word}`}
        title="点击播放发音"
      >
        {playing ? (
          <span className="text-lg animate-pulse">🔊</span>
        ) : (
          <span className="text-lg">🔊</span>
        )}
      </button>
      {error && <span className="text-sm text-red-400">{error}</span>}
    </div>
  );
}
