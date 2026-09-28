import { NextResponse } from "next/server";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { getUserById, updateUser } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-middleware";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req as any);
    if ("error" in auth) return auth.error;

    const { priceKey } = await req.json();
    const price = priceKey === "yearly" ? STRIPE_PRICES.yearly : STRIPE_PRICES.monthly;

    if (!stripe) {
      // Stripe key 未配置时返回明确错误（参考经验教训：不做 demoMode）
      return NextResponse.json(
        { error: "Stripe 未配置。请设置 STRIPE_SECRET_KEY 环境变量。" },
        { status: 500 }
      );
    }

    const user = await getUserById(auth.userId);
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    // 确保有 Stripe Customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { lightning_rod_user_id: user.id },
      });
      customerId = customer.id;
      await updateUser(user.id, { stripe_customer_id: customerId });
    }

    // 创建 Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: price.priceId, quantity: 1 }],
      success_url: `${SITE_URL}/subscription?success=true`,
      cancel_url: `${SITE_URL}/subscription?canceled=true`,
      metadata: {
        lightning_rod_user_id: user.id,
        plan: priceKey,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "创建支付失败" },
      { status: 500 }
    );
  }
}
