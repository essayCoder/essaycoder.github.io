import Link from "next/link";
import { notFound } from "next/navigation";
import { getStrategyBySlug, getStrategyById, STRATEGIES } from "@/lib/strategies";
import { ArrowIcon, AlertIcon } from "@/components/icons";
import { Metadata } from "next";

export function generateStaticParams() {
  return STRATEGIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getStrategyBySlug(slug);
  if (!s) return {};
  return {
    title: `${s.name} · ${s.blurb}`,
    description: s.definition,
    openGraph: {
      title: `${s.name} · 避雷针`,
      description: s.definition,
      type: "article",
    },
  };
}

export default async function StrategyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const strategy = getStrategyBySlug(slug);
  if (!strategy) notFound();

  const related = strategy.related
    .map(getStrategyById)
    .filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <Link
        href="/patterns"
        className="text-sm text-ink-50 hover:text-ink no-underline inline-flex items-center gap-1 mb-8"
      >
        ← 返回策略库
      </Link>

      {/* Header */}
      <div className="mb-12">
        <span className="tag mb-4">{strategy.blurb}</span>
        <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
          {strategy.name}
        </h1>
        <p className="text-lg text-ink-70 leading-relaxed">{strategy.definition}</p>
      </div>

      {/* Examples */}
      <Section title="真实对话中长这样">
        <div className="space-y-3">
          {strategy.examples.map((ex, i) => (
            <div key={i} className="quote-block">
              {ex}
            </div>
          ))}
        </div>
      </Section>

      {/* Mechanism */}
      <Section title="它是怎么起作用的">
        <p className="text-ink-70 leading-relaxed">{strategy.mechanism}</p>
      </Section>

      {/* Counter Examples */}
      <Section title="正常摩擦 vs 操控的边界">
        <p className="text-ink-50 text-sm mb-4">
          并非所有冲突都是操控。健康关系里也会有不愉快的时刻。关键区别是：
          <span className="text-ink font-medium">正常摩擦指向行为，不否定你这个人</span>。
        </p>
        <div className="space-y-4">
          {strategy.counterExamples.map((cx, i) => (
            <div key={i} className="card py-5 px-6">
              <div className="text-ink-70 italic mb-2">"{cx.text}"</div>
              <div className="text-sm text-ink-50 flex items-start gap-2">
                <AlertIcon className="mt-0.5 flex-shrink-0" />
                <span>{cx.diff}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Responses */}
      <Section title="你可以怎么做">
        <ul className="space-y-3">
          {strategy.responses.map((r, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold text-surface text-xs font-semibold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-ink-70 leading-relaxed">{r}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Related */}
      {related.length > 0 && (
        <Section title="你可能也想了解">
          <div className="flex flex-wrap gap-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/patterns/${r.slug}`}
                className="tag no-underline hover:bg-gold hover:text-surface transition-colors"
              >
                {r.name}
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <div className="mt-16 p-8 rounded-2xl bg-gold-light/40 border border-gold/30 text-center">
        <p className="text-ink mb-5 font-medium">
          看到了这些特征，想确认你的那段对话里有没有出现？
        </p>
        <Link href="/analyze" className="btn-gold">
          粘贴对话开始分析
          <ArrowIcon />
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="title-divider text-xl mb-6">{title}</h2>
      {children}
    </section>
  );
}
