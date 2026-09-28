"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { SubscribeSheet } from "@/components/SubscribeSheet";
import { getStrategyById } from "@/lib/strategies";
import { AlertIcon, SparklesIcon, ArrowIcon, CheckIcon, LightbulbIcon } from "@/components/icons";

interface StrategyHit {
  strategy_id: string;
  confidence: string;
  quote: string;
  explain: string;
  suggestions: string[];
}

interface AnalyzeResult {
  normal_friction: boolean;
  crisis: boolean;
  score: number;
  conclusion: string;
  hits: StrategyHit[];
  self_review: boolean;
  self_review_note: string;
  quota?: { remaining: number; limit: number };
}

export default function AnalyzePage() {
  const { data: session } = useSession();
  const user = session?.user as any || null;
  const [text, setText] = useState("");
  const [describeMode, setDescribeMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authSheetOpen, setAuthSheetOpen] = useState(false);
  const [quotaSheetOpen, setQuotaSheetOpen] = useState(false);

  async function handleAnalyze() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, describeMode }),
        credentials: "include",
      });
      const data = await res.json();

      if (res.status === 401) {
        setAuthSheetOpen(true);
        return;
      }
      if (res.status === 402 && data.code === "QUOTA_EXCEEDED") {
        setQuotaSheetOpen(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || "分析失败");

      setResult(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setText("");
    setError(null);
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold bg-gold-light text-gold-dark text-xs font-medium mb-4">
            <SparklesIcon size={14} /> AI 分析引擎
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            把你的对话粘贴进来
          </h1>
          <p className="text-ink-70">
            识别其中的操控策略，给你一份结构化的看清结果。
          </p>
          {user && (
            <div className="mt-3 text-xs text-ink-50">
              今日剩余：
              <span className="font-medium text-ink-70">
                {user.analyzeRemaining < 0
                  ? "∞ (VIP)"
                  : `${user.analyzeRemaining}/${user.analyzeLimit}`}
              </span>
            </div>
          )}
        </div>

        {!result ? (
          <div className="max-w-2xl mx-auto">
            <div className="card mb-6">
              <label className="block text-sm font-medium text-ink mb-2">
                对话文本或事件描述
              </label>
              <textarea
                className="input min-h-[200px] font-mono text-sm leading-relaxed"
                placeholder={`把聊天记录、对方说的话、或者你遇到的那段事粘贴进来。\n\n例如：\n「他说我太敏感了，他从来没说过那句话，是我自己记错了。」`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={loading}
              />
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 text-sm text-ink-70 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={describeMode}
                    onChange={(e) => setDescribeMode(e.target.checked)}
                    className="rounded border-stroke text-gold focus:ring-gold"
                  />
                  是我的转述，不是原话
                </label>
                <span className="text-xs text-ink-50">
                  最少 5 个字 · 分析后即焚，不存储原文
                </span>
              </div>
            </div>

            <button
              className="btn-gold w-full justify-center text-base py-4"
              onClick={handleAnalyze}
              disabled={loading || text.trim().length < 5}
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-surface/40 border-t-surface rounded-full animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <SparklesIcon size={18} />
                  开始 AI 分析
                  <ArrowIcon />
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
                {error}
              </div>
            )}

            <p className="text-xs text-ink-50 text-center mt-6 leading-relaxed">
              本工具识别沟通模式，不诊断人格障碍。{" "}
              感受不需要诊断来验证——如果这段关系让你持续痛苦，这本身就是足够的信息。
            </p>
          </div>
        ) : (
          <ResultView result={result} original={text} onReset={handleReset} />
        )}
      </div>

      {/* 登录引导 Sheet */}
      {authSheetOpen && (
        <AuthGateSheet
          onClose={() => setAuthSheetOpen(false)}
          message="请先登录后使用 AI 分析。"
        />
      )}

      {/* 付费墙 */}
      <SubscribeSheet
        open={quotaSheetOpen}
        onClose={() => setQuotaSheetOpen(false)}
        overrideMessage="今日 AI 分析次数已用完。升级 VIP 解锁无限使用。"
      />
    </>
  );
}

function AuthGateSheet({ onClose, message }: { onClose: () => void; message: string }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-surface rounded-t-3xl md:rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto w-14 h-14 rounded-full bg-gold-light text-gold-dark flex items-center justify-center mb-4">
          <SparklesIcon size={22} />
        </div>
        <h3 className="font-bold text-lg mb-2">需要登录</h3>
        <p className="text-sm text-ink-70 mb-6">{message}</p>
        <Link
          href="/login?redirect=/analyze"
          onClick={onClose}
          className="btn-gold w-full justify-center"
        >
          去登录
        </Link>
        <button onClick={onClose} className="mt-3 text-xs text-ink-50 hover:text-ink no-underline">
          稍后再说
        </button>
      </div>
    </div>
  );
}

// ---- ResultView 保持不变 ----
function ResultView({
  result,
  original,
  onReset,
}: {
  result: AnalyzeResult;
  original: string;
  onReset: () => void;
}) {
  const intensityLabel =
    result.score < 20
      ? "低浓度"
      : result.score < 50
        ? "中等浓度"
        : result.score < 80
          ? "较高浓度"
          : "高浓度";

  const intensityColor =
    result.score < 20
      ? "bg-emerald-100 text-emerald-700"
      : result.score < 50
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-700";

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2">
        <div className="card sticky top-24">
          <div className="text-sm font-medium text-ink mb-3">
            你提供的内容
          </div>
          <div className="text-sm text-ink-70 leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
            {original}
          </div>
          {result.hits.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stroke">
              <div className="text-xs text-ink-50 mb-2">检测到的策略引用</div>
              <div className="space-y-2">
                {result.hits.map((h, i) => (
                  <div key={i} className="text-xs p-2 rounded-lg bg-gold-light/60 border border-gold/20">
                    <div className="tag mb-1 !py-0.5 !px-2 !text-[11px] !bg-gold !text-surface">
                      {getStrategyById(h.strategy_id)?.name || h.strategy_id}
                    </div>
                    <div className="text-ink-70 italic truncate">{h.quote}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="card">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="text-xs text-ink-50 mb-1">一句话结论</div>
              <p className="text-lg leading-relaxed">{result.conclusion}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${intensityColor}`}>
              {intensityLabel} · {result.score}
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-stroke overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-light via-gold to-gold-dark transition-all duration-700"
              style={{ width: `${result.score}%` }}
            />
          </div>
          {result.normal_friction && (
            <div className="mt-4 flex items-start gap-2 text-sm text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <CheckIcon className="mt-0.5 flex-shrink-0" />
              这看起来更像是正常的关系摩擦，而不是有意图的操控。
            </div>
          )}
          {result.crisis && (
            <div className="mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <AlertIcon className="mt-0.5 flex-shrink-0" />
              如果你现在正处于危险中，请立刻离开并联系当地紧急电话或专业帮助。
            </div>
          )}
          {result.self_review && (
            <div className="mt-4 flex items-start gap-2 text-sm text-gold-dark bg-gold-light/60 border border-gold/20 rounded-lg p-3">
              <LightbulbIcon className="mt-0.5 flex-shrink-0" />
              {result.self_review_note || "反复怀疑自己的感受，是 gaslighting 常见的后遗症。你的感受值得被认真对待。"}
            </div>
          )}
        </div>

        {result.hits.length > 0 ? (
          <div className="space-y-4">
            <h2 className="title-divider text-lg">检测到 {result.hits.length} 类策略</h2>
            {result.hits.map((h, i) => {
              const strat = getStrategyById(h.strategy_id);
              const confMap: Record<string, string> = { high: "高", medium: "中", low: "低" };
              return (
                <div key={i} className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="tag bg-gold text-surface">
                      {strat?.name || h.strategy_id}
                    </span>
                    <span className="text-xs text-ink-50">置信度 {confMap[h.confidence] || h.confidence}</span>
                  </div>
                  <div className="text-ink-70 mb-3">{h.explain}</div>
                  <div className="quote-block">{h.quote}</div>
                  {h.suggestions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-stroke">
                      <div className="text-xs text-ink-50 mb-2">你可以参考的回应</div>
                      <div className="space-y-2">
                        {h.suggestions.map((s, j) => (
                          <div key={j} className="text-sm p-3 rounded-lg bg-gold-light/40 border border-gold/20 text-ink-70">
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {strat && (
                    <Link
                      href={`/patterns/${strat.slug}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm text-gold hover:text-gold-dark no-underline"
                    >
                      了解更多关于「{strat.name}」<ArrowIcon size={14} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          !result.normal_friction && (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-lg font-medium mb-2">没有明确的操控策略</h3>
              <p className="text-ink-70 text-sm leading-relaxed max-w-md mx-auto">
                不是每段关系里都有操控。但如果你的感受一直很糟糕，哪怕没有明显的"策略"，也值得认真对待自己。
              </p>
            </div>
          )
        )}

        <div className="flex items-center gap-3 pt-4">
          <button onClick={onReset} className="btn-outline">再分析一段</button>
          <Link href="/practice" className="btn-gold ml-auto">
            去练习场试试应对<ArrowIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}
