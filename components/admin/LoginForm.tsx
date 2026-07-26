"use client";

import { useState } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "登录失败");
        return;
      }

      // Force full page redirect to ensure cookie is sent
      window.location.href = "/admin";
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          管理员密码
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 placeholder:text-gray-400"
          placeholder="输入密码"
          autoFocus
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !password}
        className="w-full py-3 px-6 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 text-gray-800 font-medium hover:bg-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "登录中..." : "登 录"}
      </button>
    </form>
  );
}
