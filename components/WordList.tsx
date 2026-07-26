import GlassCard from "./GlassCard";

interface WordItem {
  id: number;
  word: string;
  displayDate: string;
}

interface WordListProps {
  words: WordItem[];
  activeId: number | null;
  onSelect: (id: number) => void;
}

export default function WordList({
  words,
  activeId,
  onSelect,
}: WordListProps) {
  if (!words.length) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">
        暂无词汇
      </div>
    );
  }

  return (
    <div className="sidebar-scroll overflow-y-auto max-h-full">
      {words.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`w-full text-left px-4 py-3 transition-all rounded-xl mb-1 ${
            activeId === item.id
              ? "bg-white/30 border border-white/40"
              : "hover:bg-white/10 border border-transparent"
          }`}
        >
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            {item.displayDate}
          </p>
          <p
            className={`text-sm font-medium truncate ${
              activeId === item.id
                ? "text-gray-800"
                : "text-gray-600"
            }`}
          >
            {item.word}
          </p>
        </button>
      ))}
    </div>
  );
}
