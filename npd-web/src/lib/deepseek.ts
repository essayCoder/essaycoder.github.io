const API_URL = "https://api.deepseek.com/v1/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export async function callDeepSeek({
  model,
  messages,
  stream = false,
  maxRetries = 3,
}: {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  maxRetries?: number;
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 未配置。请在 .env.local 中设置。");
  }

  let lastError: unknown = null;
  const delays = [0, 500, 1500];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, delays[attempt - 1] ?? 3000));
      }

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, stream, temperature: 0.7 }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`DeepSeek API ${res.status}: ${text}`);
      }

      if (stream) return res;
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? "";
    } catch (err) {
      lastError = err;
      // 仅对可重试错误重试
      const msg = String(err);
      const isRetryable =
        msg.includes("timeout") ||
        msg.includes("429") ||
        msg.includes("500") ||
        msg.includes("502") ||
        msg.includes("503") ||
        msg.includes("504") ||
        msg.includes("fetch");
      if (!isRetryable) throw err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("DeepSeek 调用失败");
}

export function extractJson(text: string): any {
  // 直接尝试
  try {
    return JSON.parse(text);
  } catch {}

  // 提取第一个 { ... } 块
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {}
  }

  // 代码块中提取
  const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) {
    try {
      return JSON.parse(codeMatch[1].trim());
    } catch {}
  }

  throw new Error("无法解析 AI 响应为 JSON");
}
