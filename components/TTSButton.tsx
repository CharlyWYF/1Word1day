"use client";

import { useState, useCallback } from "react";

interface TTSButtonProps {
  word: string;
  lang?: string;
}

// Voice priority list — system-specific, most natural first
const PREFERRED_VOICES = [
  "Google US English",
  "Samantha",
  "Microsoft Zira - English (United States)",
  "Microsoft Jenny - English (United States)",
  "Microsoft Ava - English (United States)",
  "en-US",
];

export default function TTSButton({ word, lang = "en-US" }: TTSButtonProps) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBestVoice = useCallback(
    (): SpeechSynthesisVoice | null => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return null;

      // Try preferred voices first
      for (const preferred of PREFERRED_VOICES) {
        const found = voices.find(
          (v) =>
            v.name === preferred || v.voiceURI === preferred
        );
        if (found) return found;
      }

      // Fallback: any English US voice
      const usVoice = voices.find(
        (v) => v.lang.startsWith("en-US") && v.localService === false
      );
      if (usVoice) return usVoice;

      // Last resort: any English voice
      return voices.find((v) => v.lang.startsWith("en")) || null;
    },
    []
  );

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
    utterance.rate = 0.92; // Slightly slower than normal, but not "drunken"
    utterance.pitch = 1;
    utterance.volume = 1;

    const bestVoice = getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

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
