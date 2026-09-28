"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";

export function SubscribeSheet({
  open,
  onClose,
  overrideMessage,
}: {
  open: boolean;
  onClose: () => void;
  overrideMessage?: string;
}) {
  const { data: session } = useSession();
  const user = session?.user as any || null;
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleCheckout(priceKey: "monthly" | "yearly") {
    setLoading(priceKey);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "创建支付失败");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "网络错误");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-surface rounded-t-3xl md:rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-3 right-4 w-8 h-8 rounded-full bg-surface text-ink-50 flex items-center justify-center hover:bg-stroke transition-colors border border-stroke"
          >
            ×
          </button>
          <div className="mx-auto w-16 h-16 rounded-full bg-gold-light flex items-center justify-center mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h2 className="text-xl font-bold mb-2">升级 VIP</h2>
          <p className="text-sm text-ink-70 leading-relaxed">
            {overrideMessage ||
              "解锁无限 AI 分析、无限练习场、证据库 PDF 导出，在 3 天试用期之后持续使用。"}
          </p>
        </div>

        {/* Pricing */}
        <div className="px-6 pb-4 space-y-3">
          <button
            onClick={() => handleCheckout("yearly")}
            disabled={!!loading}
            className="w-full p-4 rounded-xl border-2 border-gold bg-gold-light/50 text-left relative hover:shadow-md transition-all disabled:opacity-50"
          >
            <div className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-gold text-surface text-[11px] font-medium">
              Best Value
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">年卡 · ¥198</div>
                <div className="text-xs text-ink-50">每月仅 ¥16.5</div>
              </div>
              {loading === "yearly" ? (
                <span className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-gold">→</span>
              )}
            </div>
          </button>

          <button
            onClick={() => handleCheckout("monthly")}
            disabled={!!loading}
            className="w-full p-4 rounded-xl border border-stroke text-left hover:border-gold transition-colors disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">月卡 · ¥38</div>
                <div className="text-xs text-ink-50">按月付费，随时取消</div>
              </div>
              {loading === "monthly" ? (
                <span className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-ink-30">→</span>
              )}
            </div>
          </button>

          {error && (
            <div className="text-xs text-red-500 text-center pt-2">{error}</div>
          )}

          {!user && (
            <div className="text-center text-xs text-ink-50 pt-2">
              已登录 VIP 可跨端通用 ·{" "}
              <Link href="/login" onClick={onClose} className="text-gold hover:text-gold-dark no-underline">
                登录后购买
              </Link>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="px-6 pt-2 pb-6">
          <div className="text-xs text-ink-50 mb-3 font-medium tracking-wide">VIP 权益</div>
          <ul className="space-y-2.5 text-sm">
            {[
              "无限 AI 沟通模式分析",
              "无限应对练习场（Lv1-3 全解锁）",
              "锚点日记批量导出（Markdown / PDF / Word）",
              "证据库 PDF 报告导出",
              "每日 5 分钟恢复路径微练习",
              "优先 AI 模型（DeepSeek-chat 不限流）",
            ].map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-ink-70">
                <span className="w-4 h-4 rounded-full bg-gold text-surface flex items-center justify-center text-[10px] flex-shrink-0">
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <button
            onClick={onClose}
            className="text-xs text-ink-50 hover:text-ink no-underline"
          >
            稍后再说
          </button>
        </div>
      </div>
    </div>
  );
}
