"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { SubscribeSheet } from "@/components/SubscribeSheet";
import { STRATEGIES } from "@/lib/strategies";
import { SendIcon, LightbulbIcon, CheckIcon, ArrowIcon, ChatIcon, SparklesIcon } from "@/components/icons";

interface PracticeMsg {
  role: "user" | "assistant";
  content: string;
  strategy_used?: string;
  tip?: string;
  suggestions?: string[];
  user_status?: string;
}

export default function PracticePage() {
  const { data: session } = useSession();
  const user = session?.user as any || null;
  const [messages, setMessages] = useState<PracticeMsg[]>([
    {
      role: "assistant",
      content:
        "好，我们来演练一下。想象这是一段你觉得不对劲的关系中的一次对话。我来扮演对话的对方，你练习守住自己的边界。准备好了吗？",
    },
  ]);
  const [input, setInput] = useState("");
  const [strength, setStrength] = useState(2);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [showStrategyPicker, setShowStrategyPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [authSheetOpen, setAuthSheetOpen] = useState(false);
  const [quotaSheetOpen, setQuotaSheetOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: history,
          strategyIds: selectedStrategies.length > 0 ? selectedStrategies : undefined,
          strength,
        }),
      });

      if (res.status === 401) {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content: "（需要先登录才能使用练习场）",
          },
        ]);
        setAuthSheetOpen(true);
        return;
      }
      if (res.status === 402) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            role: "assistant",
            content: "（" + data.error + "）",
          },
        ]);
        setQuotaSheetOpen(true);
        return;
      }
      if (!res.ok) throw new Error("练习场连接失败");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          strategy_used: data.strategy_used,
          tip: data.tip,
          suggestions: data.suggestions,
          user_status: data.user_status,
        },
      ]);

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            `（出错了：${err instanceof Error ? err.message : "未知错误"}，请重试）`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function resetChat() {
    setMessages([
      {
        role: "assistant",
        content:
          "好，我们重新开始。我来扮演对话的对方，你练习守住自己的边界。从你想说的第一句话开始吧。",
      },
    ]);
  }

  function toggleStrategy(id: string) {
    setSelectedStrategies((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const lastSuggestions =
    showSuggestions && messages.length > 0
      ? [...messages]
          .reverse()
          .find((m) => m.role === "assistant" && m.suggestions && m.suggestions.length > 0)
          ?.suggestions
      : null;

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ChatIcon size={22} />
              应对练习场
            </h1>
            <p className="text-sm text-ink-50 mt-1">
              AI 扮演操控方，你练习守住边界。目标不是"赢"，是练出不被带走的肌肉记忆。
            </p>
            {user && (
              <div className="text-xs text-ink-50 mt-1">
                今日剩余：
                <span className="font-medium text-ink-70">
                  {user.practiceRemaining < 0
                    ? "∞ (VIP)"
                    : `${user.practiceRemaining}/${user.practiceLimit}`}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetChat}
              className="btn-outline text-sm py-2 px-4"
            >
              重新开始
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="card mb-4 py-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <div className="text-xs text-ink-50 mb-2">强度</div>
              <div className="flex gap-2">
                {[
                  { v: 1, label: "温和" },
                  { v: 2, label: "坚定" },
                  { v: 3, label: "高压" },
                ].map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setStrength(o.v)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      strength === o.v
                        ? "bg-gold text-surface border-gold"
                        : "border-stroke text-ink-70 hover:border-gold"
                    }`}
                  >
                    Lv{o.v} {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="text-xs text-ink-50 mb-2">特定策略</div>
              <button
                onClick={() => setShowStrategyPicker(!showStrategyPicker)}
                className="px-3 py-1.5 rounded-lg text-sm border border-stroke hover:border-gold transition-colors min-w-[120px] text-left"
              >
                {selectedStrategies.length === 0
                  ? "全部策略"
                  : `${selectedStrategies.length} 个选中`}
              </button>
              {showStrategyPicker && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-surface border border-stroke rounded-xl p-3 shadow-lg w-72 max-h-80 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="text-ink-50">不选则所有策略都可能出现</span>
                    {selectedStrategies.length > 0 && (
                      <button
                        onClick={() => setSelectedStrategies([])}
                        className="text-gold hover:text-gold-dark no-underline"
                      >
                        清空
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {STRATEGIES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => toggleStrategy(s.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs border transition-colors ${
                          selectedStrategies.includes(s.id)
                            ? "bg-gold text-surface border-gold"
                            : "border-stroke text-ink-70 hover:border-gold"
                        }`}
                      >
                        {selectedStrategies.includes(s.id) && <CheckIcon size={12} />}
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="card !p-0 overflow-hidden flex flex-col" style={{ height: "560px" }}>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-stroke/50 rounded-2xl rounded-bl-sm px-4 py-3 text-sm">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-ink-50 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-ink-50 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-1.5 h-1.5 bg-ink-50 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          {lastSuggestions && lastSuggestions.length > 0 && (
            <div className="border-t border-stroke p-3 bg-gold-light/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs text-gold-dark font-medium">
                  <LightbulbIcon size={14} />
                  试试这样说：
                </div>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-xs text-ink-50 hover:text-ink no-underline"
                >
                  隐藏
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {lastSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="flex-shrink-0 max-w-[280px] text-left text-xs px-3 py-2 rounded-lg bg-surface border border-gold/30 hover:border-gold hover:bg-gold-light/40 transition-colors text-ink-70"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-stroke p-3 flex items-end gap-2">
            <textarea
              className="input !py-2.5 resize-none min-h-[42px] max-h-[120px]"
              placeholder="写下你的回应... (Enter 发送，Shift+Enter 换行)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={loading}
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="btn-gold !px-4 !py-3 flex-shrink-0"
            >
              <SendIcon />
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/patterns" className="text-sm text-gold hover:text-gold-dark no-underline inline-flex items-center gap-1">
            不确定某些策略长什么样？先看看策略库
            <ArrowIcon size={14} />
          </Link>
        </div>
      </div>

      {authSheetOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
          onClick={() => setAuthSheetOpen(false)}
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
            <p className="text-sm text-ink-70 mb-6">请先登录后使用练习场。</p>
            <Link
              href="/login?redirect=/practice"
              onClick={() => setAuthSheetOpen(false)}
              className="btn-gold w-full justify-center"
            >
              去登录
            </Link>
            <button onClick={() => setAuthSheetOpen(false)} className="mt-3 text-xs text-ink-50 hover:text-ink no-underline">
              稍后再说
            </button>
          </div>
        </div>
      )}

      <SubscribeSheet
        open={quotaSheetOpen}
        onClose={() => setQuotaSheetOpen(false)}
        overrideMessage="今日练习场次数已用完。升级 VIP 解锁无限练习。"
      />
    </>
  );
}

function MessageBubble({ msg }: { msg: PracticeMsg }) {
  const isUser = msg.role === "user";
  const strat = msg.strategy_used
    ? STRATEGIES.find((s) => s.id === msg.strategy_used)
    : null;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] ${
          isUser
            ? "bg-gold text-surface rounded-2xl rounded-br-sm"
            : "bg-surface border border-stroke rounded-2xl rounded-bl-sm"
        } px-4 py-3 text-sm leading-relaxed`}
      >
        {strat && !isUser && (
          <div className="mb-1.5">
            <span className="tag !py-0.5 !px-2 !text-[11px] !bg-gold !text-surface">
              使用了：{strat.name}
            </span>
          </div>
        )}
        <div className="whitespace-pre-wrap">{msg.content}</div>
        {msg.user_status && !isUser && (
          <div className="mt-2 pt-2 border-t border-stroke text-xs text-ink-50">
            {msg.user_status === "held" && (
              <span className="text-emerald-600 inline-flex items-center gap-1">
                <CheckIcon size={12} />
                你守住了边界
              </span>
            )}
            {msg.user_status === "pulled" && (
              <span className="text-amber-600">你被带进去了</span>
            )}
            {msg.tip && <span className="ml-2 text-ink-50">· {msg.tip}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
