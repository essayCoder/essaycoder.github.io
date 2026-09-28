import Link from "next/link";
import { STRATEGIES } from "@/lib/strategies";
import { ArrowIcon } from "@/components/icons";

export const metadata = {
  title: "操控策略知识库 · 避雷针",
  description:
    "12 类操控策略详解：煤气灯效应、爱轰炸、贬低、三角测量、DARVO、回吸、飞猴、沉默惩罚、受害者扮演、间歇性强化、孤立、未来伪造。",
};

export default function PatternsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">操控策略知识库</h1>
        <p className="text-ink-70 max-w-2xl leading-relaxed">
          认识这 12 类常见的操控策略，是建立自己判断框架的第一步。
          每一篇都包含定义、真实对话例句、与正常摩擦的边界对比，以及你可以怎么做。
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {STRATEGIES.map((s) => (
          <Link
            key={s.id}
            href={`/patterns/${s.slug}`}
            className="card no-underline text-ink hover:border-gold transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="tag">{s.name}</span>
              <ArrowIcon
                size={14}
                className="text-ink-30 group-hover:text-gold transition-colors"
              />
            </div>
            <p className="text-ink-70 text-sm font-medium mb-3">{s.blurb}</p>
            <p className="text-ink-50 text-sm leading-relaxed truncate-3">
              {s.definition}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-ink-50 text-sm mb-4">
          读完这些，想知道你遇到的对话里有没有出现这些策略？
        </p>
        <Link href="/analyze" className="btn-gold">
          用 AI 分析你的对话
        </Link>
      </div>
    </div>
  );
}
