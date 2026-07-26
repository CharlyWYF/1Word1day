import Link from "next/link";
import WordForm from "@/components/admin/WordForm";

export default function NewWordPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 p-4">
        <Link
          href="/admin"
          className="text-sm text-gray-400 hover:text-gray-200 transition-all"
        >
          ← 返回管理后台
        </Link>
        <h1 className="text-lg font-semibold text-white mt-1">
          添加新词汇
        </h1>
      </header>
      <main className="max-w-2xl mx-auto p-6">
        <div className="glass rounded-2xl p-8">
          <WordForm />
        </div>
      </main>
    </div>
  );
}
