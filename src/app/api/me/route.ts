import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/me
 * Returns the authenticated user's profile, subscription, and entitlements
 * Backend source of truth: /entitlements endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

    // If no backend is configured, return an offline profile to avoid noisy errors in dev
    if (!backendUrl) {
      return NextResponse.json({
        user: { id: session.user.id, name: session.user.name || "", email: session.user.email || "" },
        entitlements: [],
        subscriptions: [],
        isProUser: false,
        message: "Using offline profile (no backend configured)",
      });
    }

    const response = await fetch(`${backendUrl}/entitlements`, {
      method: "GET",
      headers: {
        "X-User-Id": session.user.id,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      // Backend not wired yet: respond with empty entitlements instead of 500
      return NextResponse.json({ entitlements: [], subscriptions: [] });
    }

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/me error:", error);

    // If backend is unavailable, return empty profile instead of 500
    // This allows frontend to continue working in offline/dev mode
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("fetch failed")
    ) {
      console.warn("Backend unavailable, returning empty profile");
      return NextResponse.json({
        user: { id: session.user.id, name: session.user.name || "Developer", email: session.user.email || "" },
        entitlements: [],
        subscriptions: [],
        isProUser: false,
        message: "Using offline profile (backend unavailable)",
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch entitlements" },
      { status: 500 },
    );
  }
}
