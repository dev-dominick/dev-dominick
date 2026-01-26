import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { generalRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-utils";

/**
 * POST /api/billing/checkout-session
 * Creates a Stripe Checkout Session for PRO subscription
 * Backend source of truth: POST /billing/checkout-session
 */
export async function POST(req: NextRequest) {
  try {
    // SECURITY: Rate limit checkout session creation to prevent abuse
    const ip = getClientIp(req);
    const rl = generalRateLimiter.check(`billing:checkout:${ip}`);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again later." },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, success_url, cancel_url } = await req.json();

    // Contract: PRO-only checkout
    if (plan !== "PRO") {
      return NextResponse.json(
        { error: "Only PRO plan is available for checkout" },
        { status: 400 }
      );
    }

    if (!success_url || !cancel_url) {
      return NextResponse.json(
        { error: "Missing success_url or cancel_url" },
        { status: 400 }
      );
    }

    // TODO: Call backend POST /billing/checkout-session
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/billing/checkout-session`, {
      method: "POST",
      headers: {
        "X-User-Id": session.user.id,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan,
        success_url,
        cancel_url,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("POST /api/billing/checkout-session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
