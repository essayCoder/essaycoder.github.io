import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { updateUser } from "@/lib/auth";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!stripe) {
    return NextResponse.json({ error: "Stripe 未配置" }, { status: 500 });
  }

  // Signature verification
  let event: any;
  try {
    if (WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
    } else {
      // 开发模式：无签名验证（但仅在两者都缺失时）
      if (WEBHOOK_SECRET || sig) {
        return NextResponse.json(
          { error: "签名验证配置不完整" },
          { status: 400 }
        );
      }
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error("[webhook] signature error", err);
    return NextResponse.json({ error: "无效签名" }, { status: 400 });
  }

  // 事件类型 → 处理（参考经验教训：显式类型收窄，不用 unknown 强转）
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const obj = event.data.object as {
          metadata: { lightning_rod_user_id?: string };
          subscription: string | null;
        };
        const userId = obj.metadata?.lightning_rod_user_id;
        if (userId && obj.subscription) {
          await syncStripeSubscription(userId, obj.subscription);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as { id: string };
        // 查找关联用户
        const allSubs = await stripe.subscriptions.list({
          expand: ["data.customer"],
          limit: 100,
        });
        const match = allSubs.data.find((s: any) => s.id === sub.id);
        const customerId = match?.customer;
        if (typeof customerId === "string") {
          // 通过 customer 反查用户（我们存了 stripe_customer_id）
          // 简化：遍历所有用户不现实，存 customer.metadata 里的 userId
          const customer = await stripe.customers.retrieve(customerId);
          const userId = (customer as any).metadata?.lightning_rod_user_id;
          if (userId) await syncStripeSubscription(userId, sub.id);
        }
        break;
      }
    }
  } catch (err) {
    console.error("[webhook] handle error", err);
    return NextResponse.json({ error: "处理失败" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function syncStripeSubscription(userId: string, subscriptionId: string) {
  if (!stripe) return;
  const sub: Stripe.Subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await updateUser(userId, {
    plan: sub.status === "active" || sub.status === "trialing" ? "pro" : "free",
    subscription_status: sub.status,
    subscription_current_period_end: sub.current_period_end * 1000,
  });
}
