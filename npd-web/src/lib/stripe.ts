import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

// 不装 @types/stripe — Stripe SDK 自带类型（参考经验教训）
export const stripe = key ? new Stripe(key, { apiVersion: "2024-04-10" }) : null;

export const STRIPE_PRICES = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_MONTHLY || "price_monthly_cny_38",
    name: "NPD避雷针 VIP · 月卡",
    amount: 38,
    interval: "month" as const,
  },
  yearly: {
    priceId: process.env.STRIPE_PRICE_YEARLY || "price_yearly_cny_198",
    name: "NPD避雷针 VIP · 年卡",
    amount: 198,
    interval: "year" as const,
  },
};

export const PLAN_NAMES: Record<string, string> = {
  monthly: "vip_monthly",
  yearly: "vip_yearly",
};
