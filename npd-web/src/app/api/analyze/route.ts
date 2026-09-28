import { NextResponse } from "next/server";
import { checkAndConsumeQuota } from "@/lib/auth-middleware";
import { callDeepSeek, extractJson } from "@/lib/deepseek";
import { getSystemPrompt, ANALYZE_MODEL } from "@/lib/prompts";

export const maxDuration = 60;

export async function POST(req: Request) {
  // 配额检查（402 QUOTA_EXCEEDED 时付费墙弹出）
  const auth = await checkAndConsumeQuota(req as any, "analyze");
  if ("error" in auth) return auth.error;

  try {
    const body = await req.json();
    const { text, describeMode = false } = body;

    if (!text || typeof text !== "string" || text.trim().length < 5) {
      return NextResponse.json(
        { error: "请粘贴一段对话或事件描述（至少 5 个字）" },
        { status: 400 }
      );
    }

    const systemPrompt = getSystemPrompt({ describeMode });
    const raw = await callDeepSeek({
      model: ANALYZE_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text.trim() },
      ],
    });

    const result = extractJson(raw);

    // 返回配额信息给前端，控制 UI 展示
    return NextResponse.json({
      normal_friction: result.normal_friction ?? false,
      crisis: result.crisis ?? false,
      score: typeof result.score === "number" ? result.score : 0,
      conclusion: result.conclusion ?? "",
      hits: Array.isArray(result.hits) ? result.hits : [],
      self_review: result.self_review ?? false,
      self_review_note: result.self_review_note ?? "",
      quota: {
        remaining: auth.quota?.analyzeRemaining ?? 0,
        limit: auth.quota?.analyzeLimit ?? 0,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "未知错误";
    console.error("[analyze]", err);
    return NextResponse.json(
      { error: msg },
      { status: msg.includes("未配置") ? 500 : 502 }
    );
  }
}
