import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginRateLimiter } from "@/lib/rate-limit";

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // Safety check: Prevent dev user login in production
        if (
          process.env.NODE_ENV === "production" &&
          credentials.email === "dev@example.local"
        ) {
          throw new Error("Invalid credentials");
        }

        if (credentials.password.length < 10) {
          throw new Error("Invalid credentials");
        }

        // Rate limiting by email
        const rateLimitResult = loginRateLimiter.check(credentials.email);
        if (!rateLimitResult.allowed) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            password: true,
            role: true,
            loginAttempts: true,
            lockedUntil: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error(
            "Account is temporarily locked. Please try again later."
          );
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          // Increment failed login attempts
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: user.loginAttempts + 1,
              // Lock account after 5 failed attempts for 30 minutes
              lockedUntil:
                user.loginAttempts >= 4
                  ? new Date(Date.now() + 30 * 60 * 1000)
                  : null,
            },
          });

          throw new Error("Invalid credentials");
        }

        // Reset failed attempts and update last login on success
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
          },
        });

        // Reset rate limit on successful login
        loginRateLimiter.reset(credentials.email);

        return {
          id: user.id,
          email: user.email,
          role: (user.role || "user") as "user" | "admin" | "admin-main",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days - reduced for security
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Let NextAuth handle cookie configuration automatically
  // Custom config was causing issues with secure cookie prefix in production
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith('/')) {
        // Prevent redirect loops to login/signup
        if (url.startsWith('/login') || url.startsWith('/signup')) {
          return `${baseUrl}/app`;
        }
        return `${baseUrl}${url}`;
      }
      // Allow same-origin absolute URLs
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Default fallback
      return `${baseUrl}/app`;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role || "user") as "user" | "admin" | "admin-main";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin" | "admin-main";
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Log successful sign-in (structlog integration pending)
    },
    async signOut({ token }) {
      // Log sign-out (structlog integration pending)
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
