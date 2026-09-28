"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { ShieldIcon } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirect] = useState(() => {
    if (typeof window === "undefined") return "/";
    return new URLSearchParams(window.location.search).get("redirect") || "/";
  });

  if (status === "authenticated") {
    // 已登录直接跳转
    if (typeof window !== "undefined") router.replace(redirect);
    return null;
  }

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("请输入邮箱和密码");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("密码至少 6 位");
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("邮箱或密码错误（没有账号将自动注册）");
      return;
    }
    router.push(redirect);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-light text-gold-dark mb-4">
          <ShieldIcon size={26} />
        </div>
        <h1 className="text-2xl font-bold">登录</h1>
        <p className="text-sm text-ink-50 mt-2">用以下任意方式开始你的觉察之旅</p>
      </div>

      {/* OAuth 按钮 */}
      <div className="space-y-3 mb-5">
        {process.env.GOOGLE_CLIENT_ID ? (
          <button
            onClick={() => signIn("google", { callbackUrl: redirect })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-stroke bg-surface hover:border-stroke/80 hover:bg-stroke/30 transition-colors text-sm font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            使用 Google 登录
          </button>
        ) : null}

        {process.env.APPLE_CLIENT_ID ? (
          <button
            onClick={() => signIn("apple", { callbackUrl: redirect })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-black text-white hover:bg-black/80 transition-colors text-sm font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.53-2.3 4.5-3.74 4.25z"/>
            </svg>
            使用 Apple 登录
          </button>
        ) : null}
      </div>

      {/* Divider */}
      {(process.env.GOOGLE_CLIENT_ID || process.env.APPLE_CLIENT_ID) && (
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-stroke" />
          <span className="text-xs text-ink-50">或使用邮箱密码</span>
          <div className="flex-1 h-px bg-stroke" />
        </div>
      )}

      {/* 邮箱密码表单 */}
      <form onSubmit={handleCredentials} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">邮箱</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">密码</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 位（首次使用即注册）"
            required
            minLength={6}
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full justify-center"
        >
          {loading ? "登录中..." : "登录 / 注册"}
        </button>
      </form>

      <p className="text-center text-xs text-ink-50 mt-6 leading-relaxed">
        登录即表示同意服务条款和隐私政策。我们不会分享你的对话原文给任何第三方。
      </p>
    </div>
  );
}
