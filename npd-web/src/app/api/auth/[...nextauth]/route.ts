import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/next-auth";

const handler = NextAuth(authOptions);

export function GET(req: NextRequest, ...args: any[]) {
  return handler(req as any, ...args);
}
export function POST(req: NextRequest, ...args: any[]) {
  return handler(req as any, ...args);
}
