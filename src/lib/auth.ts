import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

// NextAuth v4 with Prisma. We use JWT sessions (no PrismaAdapter dependency).
// Account/Session/VerificationToken tables in Prisma are kept for forward compat
// with adding OAuth providers later.

export const authOptions: NextAuthOptions = {
  // Required when deployed behind a proxy / on platforms like Vercel
  // where the request host is set by the platform. Without this, NextAuth
  // refuses to issue redirect URLs for unknown hosts. The option is
  // supported at runtime in next-auth v4.20+; the type was added later,
  // so we cast through `as NextAuthOptions` to keep the strict type intact.
  ...({ trustHost: true } as any),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 days
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const profile = await prisma.profile.findUnique({
          where: { email: String(creds.email).toLowerCase().trim() },
        });
        if (!profile || !profile.passwordHash) return null;
        if (profile.deletedAt) return null;
        const ok = await bcrypt.compare(String(creds.password), profile.passwordHash);
        if (!ok) return null;
        await prisma.profile.update({
          where: { id: profile.id },
          data: { lastActiveAt: new Date() },
        });
        return {
          id: profile.id,
          email: profile.email,
          name: profile.fullName,
          role: profile.role,
          status: profile.status,
          handle: profile.handle,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.status = (user as any).status;
        token.handle = (user as any).handle;
      }
      // Refresh status on every page nav (light query, no harm)
      if (token.id && trigger !== "signIn") {
        const fresh = await prisma.profile.findUnique({
          where: { id: token.id as string },
          select: { status: true, role: true, handle: true, fullName: true },
        });
        if (fresh) {
          token.status = fresh.status;
          token.role = fresh.role;
          token.handle = fresh.handle;
          token.name = fresh.fullName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      (session.user as any).status = token.status;
      (session.user as any).handle = token.handle;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const ADMIN_ROLES = ["admin", "super_admin"];
export function isAdmin(role?: string | null) {
  return !!role && ADMIN_ROLES.includes(role);
}
