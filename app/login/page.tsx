import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "管理员登录 | 每日一词",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl shadow-black/30 p-8">
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          管理员登录
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
