import { Pool, PoolClient } from "pg";

// Supabase direct (5432) → pooled (6543) 自动转换
// Vercel serverless 并发会把 direct 60 连接上限打满，必须用 pooled
function normalizeUrl(url: string): string {
  if (!url) return url;
  // Supabase direct 特征: .supabase.co:5432
  const isSupabaseDirect =
    url.includes(".supabase.co:5432") && !url.includes(":6543");
  if (!isSupabaseDirect) return url;
  // 同一个 host 直接换 port 到 6543（Supabase direct host 同时监听 5432 直连 + 6543 pooled）
  return url.replace(/\.supabase\.co:5432/, ".supabase.co:6543");
}

const connectionString = normalizeUrl(
  process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/lightning_rod"
);

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
});

// ---- 兼容层：把 pg 的 query 包装成 sqlite 风格（prepare().run() / .get() / .all()）----
interface WrappedStmt {
  run: (...params: any[]) => { changes: number; lastInsertRowid?: any };
  get: (...params: any[]) => any;
  all: (...params: any[]) => any[];
}

function wrapQuery(sql: string, client: PoolClient | Pool = pool): any {
  return {
    async run(...params: any[]) {
      const res = await client.query(sql, params);
      return { changes: res.rowCount ?? 0, lastInsertRowid: undefined };
    },
    async get(...params: any[]) {
      const res = await client.query(sql, params);
      return res.rows[0] ?? null;
    },
    async all(...params: any[]) {
      const res = await client.query(sql, params);
      return res.rows;
    },
  };
}

export const db = {
  prepare(sql: string): any {
    return wrapQuery(sql);
  },
  async query(sql: string, params?: any[]) {
    return pool.query(sql, params);
  },
  async getClient(): Promise<PoolClient> {
    return pool.connect();
  },
};

export function getDb() {
  return db;
}

// ---- Schema ----
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  image TEXT,
  password_hash TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'none',
  subscription_current_period_end BIGINT,
  first_analysis_date TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires BIGINT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires BIGINT NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS daily_usage (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  analyze_count INTEGER DEFAULT 0,
  practice_count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, date)
);
`;

let schemaInitialized = false;

export async function initSchema() {
  if (schemaInitialized) return;
  schemaInitialized = true;
  await pool.query(SCHEMA_SQL);
}

export async function closePool() {
  await pool.end();
}

export interface UserRow {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  password_hash: string | null;
  plan: "free" | "pro";
  stripe_customer_id: string | null;
  subscription_status: string;
  subscription_current_period_end: number | null;
  first_analysis_date: string | null;
  created_at: number;
  updated_at: number;
}
