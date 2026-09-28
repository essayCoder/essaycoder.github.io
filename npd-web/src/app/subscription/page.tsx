"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { SubscribeSheet } from "@/components/SubscribeSheet";

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any || null;
  const isAuthed = status === "authenticated";
  const refresh = () => {};;
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    // Stripe 回调后刷新用户状态
    const urlSuccess = new URLSearchParams(window.location.search).get("success") === "true";
    if (urlSuccess) {
      setSuccess(true);
      refresh();
    }
    if (!isAuthed) router.replace("/login?redirect=/subscription");
  }, [isAuthed, refresh, router]);

  if (!user) return null;

  const trialDaysLeft = user.inTrial
    ? Math.max(0, Math.ceil(
        ((new Date(user.subscription_current_period_end ?? Date.now() + 3 * 86400000).getTime()) - Date.now()) /
          86400000
      ))
    : 0;

  return (
    <>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-3">订阅管理</h1>
        <p className="text-ink-70 mb-8">
          {user.isPro
            ? "感谢你的支持。以下是当前订阅状态和权益。"
            : "免费版每天可以使用 1 次 AI 分析和 1 次练习场。升级 VIP 解锁无限使用。"}
        </p>

        {/* Plan status */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="tag mb-2">
                {user.isPro ? "VIP" : "免费版"}
              </div>
              <div className="text-ink-70">
                {user.isPro
                  ? `订阅状态：${formatStatus(user.subscription_status)}`
                  : user.inTrial
                    ? `试用期剩余 ${trialDaysLeft} 天`
                    : "升级 VIP 解锁全部功能"}
              </div>
            </div>
            {user.isPro ? (
              <Link href="/api/billing-portal" className="btn-outline text-sm">
                管理订阅
              </Link>
            ) : (
              <button className="btn-gold" onClick={() => setSheetOpen(true)}>
                升级 VIP
              </button>
            )}
          </div>

          {user.isPro && user.subscription_current_period_end && (
            <div className="mt-4 pt-4 border-t border-stroke text-xs text-ink-50">
              到期时间：{new Date(user.subscription_current_period_end).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Today's usage */}
        {!user.isPro && (
          <div className="card mb-6">
            <h2 className="title-divider text-base mb-4">今日配额</h2>
            <div className="space-y-3">
              <QuotaRow
                label="AI 分析"
                used={user.analyzeLimit - user.analyzeRemaining}
                limit={user.analyzeLimit}
              />
              <QuotaRow
                label="练习场"
                used={user.practiceLimit - user.practiceRemaining}
                limit={user.practiceLimit}
              />
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="card">
          <h2 className="title-divider text-base mb-4">VIP 权益</h2>
          <ul className="grid md:grid-cols-2 gap-3 text-sm text-ink-70">
            {[
              "无限 AI 沟通模式分析",
              "无限应对练习场（Lv1-3）",
              "证据库 PDF 报告导出",
              "锚点日记批量导出",
              "3 天试用期 + VIP 续费无缝衔接",
              "月卡 ¥38 / 年卡 ¥198",
            ].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <span className="text-gold">✓</span> {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <SubscribeSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

function QuotaRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit < 0 ? 0 : Math.min(100, (used / limit) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-ink">{label}</span>
        <span className="text-ink-50">
          {used}/{limit < 0 ? "∞" : limit}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-stroke overflow-hidden">
        <div
          className="h-full bg-gold transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function formatStatus(s: string) {
  const map: Record<string, string> = {
    active: "活跃中",
    trialing: "试用期",
    canceled: "已取消（服务到期）",
    past_due: "逾期中",
    none: "无订阅",
  };
  return map[s] || s;
}
