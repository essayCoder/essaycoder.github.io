import { NextResponse } from "next/server";
import { checkAndConsumeQuota } from "@/lib/auth-middleware";
import { callDeepSeek, extractJson } from "@/lib/deepseek";
import { getPracticeSystemPrompt, PRACTICE_MODEL } from "@/lib/prompts";

export const maxDuration = 30;

export async function POST(req: Request) {
  const auth = await checkAndConsumeQuota(req as any, "practice");
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const {
      messages,
      strategyIds,
      strength = 2,
    }: {
      messages: { role: string; content: string }[];
      strategyIds?: string[];
      strength?: number;
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "对话内容不能为空" }, { status: 400 });
    }

    const systemPrompt = getPracticeSystemPrompt(strategyIds, strength);
    const allMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: String(m.content),
      })),
    ];

    const raw = await callDeepSeek({
      model: PRACTICE_MODEL,
      messages: allMessages,
    });

    const result = extractJson(raw);

    return NextResponse.json({
      reply: result.reply ?? "",
      strategy_used: result.strategy_used ?? "",
      tip: result.tip ?? "",
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
      user_status: result.user_status ?? "neutral",
      done: !!result.done,
      quota: {
        remaining: auth.quota?.practiceRemaining ?? 0,
        limit: auth.quota?.practiceLimit ?? 0,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "未知错误";
    console.error("[practice]", err);
    return NextResponse.json(
      { error: msg },
      { status: msg.includes("未配置") ? 500 : 502 }
    );
  }
}
