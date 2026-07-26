"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";

interface WordFormProps {
  initialData?: {
    id: number;
    word: string;
    phonetic: string | null;
    meaning: string;
    imageUrl: string | null;
    displayDate: string;
  };
}

export default function WordForm({ initialData }: WordFormProps) {
  const [word, setWord] = useState(initialData?.word || "");
  const [phonetic, setPhonetic] = useState(initialData?.phonetic || "");
  const [meaning, setMeaning] = useState(initialData?.meaning || "");
  const [displayDate, setDisplayDate] = useState(
    initialData?.displayDate || new Date().toISOString().split("T")[0]
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!word.trim() || !meaning.trim()) {
      setError("单词和释义为必填项");
      return;
    }

    setSubmitting(true);

    try {
      const url = initialData
        ? `/api/words/${initialData.id}`
        : "/api/words";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: word.trim(),
          phonetic: phonetic.trim(),
          meaning: meaning.trim(),
          imageUrl,
          displayDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "保存失败");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            单词 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-gray-500"
            placeholder="Serendipity"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            音标
          </label>
          <input
            type="text"
            value={phonetic}
            onChange={(e) => setPhonetic(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-gray-500"
            placeholder="/ˌserənˈdɪpəti/"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          中文释义 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder:text-gray-500"
          placeholder="意外发现美好事物的运气"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          展示日期 <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          value={displayDate}
          onChange={(e) => setDisplayDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 text-white"
          required
        />
      </div>

      <ImageUploader
        currentImageUrl={imageUrl}
        onUpload={setImageUrl}
        onRemove={() => setImageUrl(null)}
      />

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-xl glass-button font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? "保存中..."
            : initialData
            ? "更新词汇"
            : "添加词汇"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-all"
        >
          取消
        </button>
      </div>
    </form>
  );
}
