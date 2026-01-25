import NextAuth, { DefaultSession } from "next-auth";

/**
 * Role hierarchy:
 * - user: Standard authenticated user
 * - admin: Can access /app/* admin routes
 * - admin-main: Super admin, can message all users
 */
type UserRole = "user" | "admin" | "admin-main";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
