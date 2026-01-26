import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { generalRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-utils";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Agent API Route
 * Proxies requests to the backend FastAPI agent endpoint
 * Supports chat and code generation with local Ollama models
 */

export async function POST(request: NextRequest) {
  try {
    // Auth required
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Rate limiting by IP
    const ip = getClientIp(request);
    const rl = generalRateLimiter.check(`agent:post:${ip}`);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
    const body = await request.json();
    const { prompt, model = "mistral", system = "", temperature = 0.7 } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }

    // Forward to backend agent endpoint
    const backendUrl = `${BACKEND_URL}/api/agent`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model,
        system,
        temperature,
      }),
    });

    if (!response.ok) {
      console.error(
        "Backend agent request failed:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      { error: "Failed to process agent request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Auth required for model listing as well
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Rate limiting by IP
    const ip = getClientIp(request);
    const rl = generalRateLimiter.check(`agent:get:${ip}`);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
    // Get available models from backend
    const backendUrl = `${BACKEND_URL}/api/agent/models`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Agent models API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent models" },
      { status: 500 }
    );
  }
}
