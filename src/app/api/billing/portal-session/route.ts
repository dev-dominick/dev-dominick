import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/billing/portal-session
 * Creates a Stripe Billing Portal Session for subscription management
 * Backend source of truth: POST /billing/portal-session
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Call backend POST /billing/portal-session
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/billing/portal-session`, {
      method: "POST",
      headers: {
        "X-User-Id": session.user.id,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        returnUrl: `${
          process.env.NEXTAUTH_URL || "http://localhost:3001"
        }/settings/billing`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("POST /api/billing/portal-session error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
