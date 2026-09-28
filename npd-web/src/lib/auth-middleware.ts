import { getServerSession } from "next-auth";
import { authOptions } from "./next-auth";
import { getUserQuota, consumeQuota } from "./auth";

export async function getAuthUser(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return null;
  return { userId, sessionUser: (session?.user ?? null) as any };
}

export async function requireAuth(req: Request) {
  const auth = await getAuthUser(req);
  if (!auth) {
    const { NextResponse } = await import("next/server");
    return { error: NextResponse.json({ error: "请先登录" }, { status: 401 }) };
  }
  return auth;
}

export async function checkAndConsumeQuota(
  req: Request,
  type: "analyze" | "practice"
) {
  const auth = await requireAuth(req);
  if ("error" in auth) return auth;

  const quota = await getUserQuota(auth.userId);
  if (!quota) {
    const { NextResponse } = await import("next/server");
    return { error: NextResponse.json({ error: "配额错误" }, { status: 500 }) };
  }

  if (quota[`${type}Remaining`] !== -1 && quota[`${type}Remaining`] <= 0) {
    const { NextResponse } = await import("next/server");
    return {
      error: NextResponse.json(
        {
          error:
            type === "analyze"
              ? "今日 AI 分析次数已用完。升级 VIP 解锁无限使用。"
              : "今日练习场次数已用完。升级 VIP 解锁无限练习。",
          code: "QUOTA_EXCEEDED",
        },
        { status: 402 }
      ),
    };
  }

  await consumeQuota(auth.userId, type);
  return { ...auth, quota };
}
