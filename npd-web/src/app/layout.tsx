import "./globals.css";
import { Nav } from "@/components/Nav";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata = {
  title: "避雷针 · AI 关系觉察与练习",
  description:
    "当你开始怀疑自己的感受，避雷针帮你看清模式。AI 驱动的沟通策略识别、应对练习与知识体系——不诊断任何人，只帮你看清自己的感受。",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-stroke py-10 mt-16">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink-50">
              <div>
                © {new Date().getFullYear()} 避雷针 Lightning Rod · 本工具识别沟通模式，不诊断人格障碍。
              </div>
              <div className="flex gap-6">
                <a href="#" className="hover:text-ink no-underline">
                  用户协议
                </a>
                <a href="#" className="hover:text-ink no-underline">
                  隐私政策
                </a>
                <a href="mailto:mingzhaoluw@gmail.com" className="hover:text-ink no-underline">
                  联系我们
                </a>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
