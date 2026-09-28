import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ user: null });

  // user 对象上已经有 session callback 注入的 plan/isPro/inTrial
  return NextResponse.json({ user: session.user });
}
