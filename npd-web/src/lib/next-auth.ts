import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { getDb, initSchema } from "./db";
import bcrypt from "bcryptjs";

initSchema();

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-change-in-production",

  providers: [
    CredentialsProvider({
      name: "邮箱",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials.password) return null;
        const email = credentials.email.toLowerCase().trim();
        const db = getDb();

        let user: any = await db.prepare("SELECT * FROM users WHERE email = ?").get(email);

        if (user && user.password_hash) {
          if (!bcrypt.compareSync(credentials.password, user.password_hash)) return null;
          return stripPassword(user);
        }

        if (user && !user.password_hash) {
          return null; // 账号已存在但用 OAuth 创建的
        }

        if (credentials.password.length < 6) return null;
        const id = randomUUID();
        const now = Date.now();
        await db.prepare(
          `INSERT INTO users (id, email, password_hash, plan, subscription_status, created_at, updated_at)
           VALUES (?, ?, ?, 'free', 'none', ?, ?)`
        ).run(id, email, bcrypt.hashSync(credentials.password, 10), now, now);
        return { id, email, name: null, image: null };
      },
    }),

    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: { params: { access_type: "offline", prompt: "consent" } },
          }),
        ]
      : []),

    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? [
          AppleProvider({
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  adapter: {
    async createUser(user: any) {
      const db = getDb();
      const id = randomUUID();
      const now = Date.now();
      await db.prepare(
        `INSERT INTO users (id, email, name, image, plan, subscription_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'free', 'none', ?, ?)`
      ).run(id, user.email, user.name ?? null, user.image ?? null, now, now);
      return await db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    },
    async getUser(id) {
      return await getDb().prepare("SELECT * FROM users WHERE id = ?").get(id);
    },
    async getUserByEmail(email) {
      return await getDb()
        .prepare("SELECT * FROM users WHERE email = ?")
        .get(email.toLowerCase());
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const db = getDb();
      const account: any = await db
        .prepare("SELECT * FROM accounts WHERE provider = ? AND provider_account_id = ?")
        .get(provider, providerAccountId);
      if (!account) return null;
      return await db.prepare("SELECT * FROM users WHERE id = ?").get(account.user_id);
    },
    async updateUser({ id, ...data }) {
      const db = getDb();
      const fields: string[] = [];
      const values: any[] = [];
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined) {
          fields.push(`${k} = ?`);
          values.push(v);
        }
      }
      if (fields.length === 0) return await db.prepare("SELECT * FROM users WHERE id = ?").get(id);
      values.push(Date.now(), id);
      await db.prepare(
        `UPDATE users SET ${fields.join(", ")}, updated_at = ? WHERE id = ?`
      ).run(...values);
      return await db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    },
    async linkAccount(account: any) {
      await getDb()
        .prepare(
          `INSERT INTO accounts (user_id, provider, provider_account_id, access_token, refresh_token, expires_at, token_type, scope, session_state)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          account.userId,
          account.provider,
          account.providerAccountId,
          account.access_token ?? null,
          account.refresh_token ?? null,
          account.expires_at ?? null,
          account.token_type ?? null,
          account.scope ?? null,
          account.session_state ?? null
        );
    },
    async createSession(session) {
      await getDb()
        .prepare(
          `INSERT INTO sessions (session_token, user_id, expires, created_at)
           VALUES (?, ?, ?, ?)`
        )
        .run(session.sessionToken, session.userId, session.expires.getTime(), Date.now());
      return session;
    },
    async getSessionAndUser(sessionToken) {
      const db = getDb();
      const session: any = await db
        .prepare("SELECT * FROM sessions WHERE session_token = ?")
        .get(sessionToken);
      if (!session) return null;
      const user = await db.prepare("SELECT * FROM users WHERE id = ?").get(session.user_id);
      if (!user) return null;
      return {
        session: {
          sessionToken: session.session_token,
          userId: session.user_id,
          expires: new Date(session.expires),
        },
        user,
      };
    },
    async updateSession({ sessionToken, expires }) {
      const db = getDb();
      if (expires) {
        await db.prepare("UPDATE sessions SET expires = ? WHERE session_token = ?").run(
          expires.getTime(),
          sessionToken
        );
      }
      const session: any = await db.prepare("SELECT * FROM sessions WHERE session_token = ?").get(sessionToken);
      return {
        sessionToken: session.session_token,
        userId: session.user_id,
        expires: new Date(session.expires),
      };
    },
    async deleteSession(sessionToken) {
      await getDb().prepare("DELETE FROM sessions WHERE session_token = ?").run(sessionToken);
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id;
        const dbUser: any = await getDb().prepare(
          "SELECT plan, subscription_status, subscription_current_period_end FROM users WHERE id = ?"
        ).get((user as any).id);
        if (dbUser) {
          token.plan = dbUser.plan;
          token.subscription_status = dbUser.subscription_status;
        }
      }
      return token;
    },
    async session({ session, token }) {
      const uid = (token as any).uid;
      if (uid && session.user) {
        const dbUser: any = await getDb().prepare(
          "SELECT plan, subscription_status, subscription_current_period_end, first_analysis_date FROM users WHERE id = ?"
        ).get(uid);
        if (dbUser) {
          const now = Date.now();
          const inTrial =
            !!dbUser.first_analysis_date &&
            new Date(dbUser.first_analysis_date).getTime() + 3 * 86400000 > now;
          const isPro =
            dbUser.plan === "pro" &&
            (dbUser.subscription_status === "active" ||
              (dbUser.subscription_current_period_end ?? 0) > now);
          (session as any).user = {
            id: uid,
            email: session.user?.email,
            name: session.user?.name,
            image: session.user?.image,
            plan: dbUser.plan,
            subscription_status: dbUser.subscription_status,
            isPro,
            inTrial,
          };
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

function stripPassword(u: any) {
  const { password_hash, ...rest } = u;
  return rest;
}

function randomUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function auth(req: any, res: any) {
  return NextAuth(req, res, authOptions);
}
