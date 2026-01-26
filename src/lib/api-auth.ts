import { NextRequest } from "next/server";
import { getTokenWithDevBypass } from "./dev-auth";

type Token = {
  sub?: string;
  email?: string;
  role?: string;
  name?: string;
};

export async function requireAuth(request: NextRequest): Promise<Token | null> {
  const token = (await getTokenWithDevBypass(request)) as Token | null;
  if (!token || !token.sub) return null;
  return token;
}

export async function requireAdmin(request: NextRequest): Promise<Token | null> {
  const token = await requireAuth(request);
  if (!token) return null;
  const role = token.role || "user";
  if (role !== "admin" && role !== "admin-main" && role !== "ops" && role !== "accountant" && role !== "lawyer") {
    return null;
  }
  return token;
}
