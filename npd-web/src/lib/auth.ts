import bcrypt from "bcryptjs";
import { getDb, initSchema } from "./db";

initSchema();

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

// ---- 用户查询 ----
export async function getUserById(id: string): Promise<any | null> {
  return await getDb().prepare("SELECT * FROM users WHERE id = ?").get(id);
}

export async function updateUser(userId: string, updates: Record<string, any>): Promise<void> {
  const db = getDb();
  const fields: string[] = [];
  const values: any[] = [];
  for (const [k, v] of Object.entries(updates)) {
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (fields.length === 0) return;
  values.push(Date.now(), userId);
  await db.prepare(
    `UPDATE users SET ${fields.join(", ")}, updated_at = ? WHERE id = ?`
  ).run(...values);
}

// ---- 配额 ----
export async function getUserQuota(userId: string) {
  const user = await getUserById(userId);
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  let usage: any = await getDb()
    .prepare("SELECT * FROM daily_usage WHERE user_id = ? AND date = ?")
    .get(userId, today);
  if (!usage) usage = { analyze_count: 0, practice_count: 0 };

  const now = Date.now();
  const trialEnd = user.first_analysis_date
    ? new Date(user.first_analysis_date).getTime() + 3 * 86400000
    : null;
  const inTrial = !!trialEnd && now < trialEnd;

  const isPro =
    user.plan === "pro" &&
    (user.subscription_status === "active" ||
      (user.subscription_current_period_end ?? 0) > now);

  const limits = isPro || inTrial
    ? { analyze: -1, practice: -1 }
    : { analyze: 1, practice: 1 };

  const analyzeRemaining = limits.analyze === -1 ? -1 : Math.max(0, limits.analyze - usage.analyze_count);
  const practiceRemaining = limits.practice === -1 ? -1 : Math.max(0, limits.practice - usage.practice_count);

  return {
    user,
    isPro,
    inTrial,
    analyzeUsed: usage.analyze_count,
    practiceUsed: usage.practice_count,
    analyzeLimit: limits.analyze,
    practiceLimit: limits.practice,
    analyzeRemaining,
    practiceRemaining,
  };
}

export async function consumeQuota(userId: string, type: "analyze" | "practice"): Promise<boolean> {
  const q = await getUserQuota(userId);
  if (!q) return false;
  if (q[`${type}Remaining`] === -1) return true;
  if (q[`${type}Remaining`] <= 0) return false;

  const today = new Date().toISOString().slice(0, 10);
  const db = getDb();

  if (type === "analyze" && !q.user.first_analysis_date) {
    await updateUser(userId, { first_analysis_date: today });
  }

  // Postgres upsert
  await db.prepare(
    `INSERT INTO daily_usage (user_id, date, ${type}_count) VALUES (?, ?, 1)
     ON CONFLICT (user_id, date) DO UPDATE SET ${type}_count = daily_usage.${type}_count + 1`
  ).run(userId, today);

  return true;
}
