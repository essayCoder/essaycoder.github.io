import Link from "next/link";
import { STRATEGIES } from "@/lib/strategies";
import {
  SparklesIcon,
  BookIcon,
  ChatIcon,
  ShieldIcon,
  ArrowIcon,
} from "@/components/icons";

export default function HomePage() {
  const previewStrategies = STRATEGIES.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold bg-gold-light text-gold-dark text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-gold pulse-gold" />
          AI 驱动 · 本地优先 · 识别沟通模式，不诊断人格障碍
        </div>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight max-w-3xl mx-auto mb-6">
          当你开始怀疑
          <br />
          <span className="text-gold">自己的感受</span>，
          <br />
          避雷针帮你看清模式
        </h1>

        <p className="text-lg text-ink-70 max-w-2xl mx-auto mb-10 leading-relaxed">
          把那段让你翻来覆去想不明白的对话粘贴进来。
          AI 在几秒钟内帮你识别其中的操控策略，
          并告诉你——你的感受不需要一个"诊断"来验证。
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/analyze" className="btn-gold text-base px-8 py-3.5">
            开始 AI 分析
            <ArrowIcon />
          </Link>
          <Link href="/patterns" className="btn-outline text-base px-8 py-3.5">
            先了解操控策略
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="title-divider text-2xl mb-10">三个核心能力</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<SparklesIcon size={22} />}
            title="AI 沟通模式识别"
            desc="粘贴对话文本或事件描述，AI 自动识别煤气灯效应、贬低、三角测量等 12 类操控策略，附原文引用和行动建议。"
            href="/analyze"
          />
          <FeatureCard
            icon={<BookIcon size={22} />}
            title="12 类操控策略库"
            desc="每类策略有定义、真实例句、与正常摩擦的边界对比、以及应对要点。帮你建立自己的判断框架。"
            href="/patterns"
          />
          <FeatureCard
            icon={<ChatIcon size={22} />}
            title="应对练习场"
            desc="AI 扮演操控方，你练习 Grey Rock / 边界声明等回应方式。实时点评，帮你在真实接触前积累肌肉记忆。"
            href="/practice"
          />
        </div>
      </section>

      {/* Strategy Preview */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <h2 className="title-divider text-2xl">常见的操控策略</h2>
          <Link
            href="/patterns"
            className="text-sm text-gold hover:text-gold-dark no-underline flex items-center gap-1"
          >
            查看全部 12 类 <ArrowIcon size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {previewStrategies.map((s) => (
            <Link
              key={s.id}
              href={`/patterns/${s.slug}`}
              className="card no-underline text-ink hover:border-gold transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="tag">{s.name}</span>
                <ArrowIcon
                  size={14}
                  className="text-ink-30 group-hover:text-gold transition-colors"
                />
              </div>
              <p className="text-ink-70 text-sm leading-relaxed truncate-3">
                {s.blurb}。{s.definition}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Safety */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="card bg-gold-light/30 border-gold/30 text-center">
          <div className="inline-flex items-center gap-2 text-gold-dark font-semibold mb-4">
            <ShieldIcon size={20} />
            我们的定位
          </div>
          <p className="text-ink-70 leading-relaxed text-lg">
            避雷针是<span className="text-ink font-semibold">沟通模式识别与教育工具</span>，
            不诊断任何人或人格障碍。
            <br />
            如果你正处于危险中，请拨打当地紧急电话或联系专业心理咨询。
          </p>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link href={href} className="card no-underline text-ink group">
      <div className="w-11 h-11 rounded-xl bg-gold-light text-gold-dark flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-ink-70 text-sm leading-relaxed">{desc}</p>
    </Link>
  );
}
