"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { StrategiesIcon } from "./icons";

export function Nav() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const loading = status === "loading";
  const user = session?.user as any;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-bg/80 border-b border-stroke">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gold text-surface">
            <StrategiesIcon size={18} />
          </span>
          <span className="font-bold text-lg tracking-wide">避雷针</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/patterns"
            className="px-4 py-2 text-sm text-ink-70 hover:text-ink rounded-lg hover:bg-surface transition-colors no-underline"
          >
            策略库
          </Link>
          <Link
            href="/analyze"
            className="px-4 py-2 text-sm text-ink-70 hover:text-ink rounded-lg hover:bg-surface transition-colors no-underline"
          >
            AI 分析
          </Link>
          <Link
            href="/practice"
            className="px-4 py-2 text-sm text-ink-70 hover:text-ink rounded-lg hover:bg-surface transition-colors no-underline"
          >
            练习场
          </Link>

          {user?.plan === "pro" && (
            <Link
              href="/subscription"
              className="ml-1 px-3 py-1.5 text-[12px] font-medium rounded-full bg-gold-light text-gold-dark border border-gold/40 hover:bg-gold hover:text-surface transition-colors no-underline"
            >
              VIP
            </Link>
          )}

          {user && user.plan !== "pro" && (
            <Link
              href="/subscription"
              className="ml-1 px-3 py-1.5 text-[12px] text-gold hover:text-gold-dark rounded-full hover:bg-gold-light transition-colors no-underline"
            >
              升级
            </Link>
          )}

          <div className="ml-2 relative">
            {!session ? (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gold text-surface hover:bg-gold-dark transition-colors no-underline"
              >
                登录
              </Link>
            ) : (
              <>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-stroke hover:border-gold transition-colors flex items-center gap-2"
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-gold text-surface text-xs flex items-center justify-center font-medium">
                      {user?.email?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                  <span className="hidden md:inline text-ink-70">
                    {user?.email?.split("@")[0] || "用户"}
                  </span>
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-surface border border-stroke rounded-xl shadow-lg p-2 z-50">
                      <Link
                        href="/subscription"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-sm rounded-lg hover:bg-gold-light no-underline text-ink"
                      >
                        订阅管理
                        {user?.plan === "pro" && (
                          <span className="ml-2 text-[10px] bg-gold text-surface px-1.5 py-0.5 rounded-full">VIP</span>
                        )}
                      </Link>
                      <div className="h-px bg-stroke my-1" />
                      <button
                        onClick={async () => {
                          await signOut({ redirect: false });
                          setMenuOpen(false);
                          window.location.reload();
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-500/10"
                      >
                        退出登录
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
