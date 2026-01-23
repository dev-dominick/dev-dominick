import { NextRequest, NextResponse } from "next/server";
import { issueSessionResponse } from "@/lib/auth-session";

// TODO: Replace with database
// import { prisma } from '@/lib/prisma';

// In-memory token store (matches appointments route)
// In production, validate against database appointment.sessionToken
const validTokens = new Map<string, { sessionId: string; email: string; name: string }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, sessionId } = body;

    if (!token || !sessionId) {
      return NextResponse.json(
        { error: "Token and sessionId required" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual Prisma query
    // const appointment = await prisma.appointment.findFirst({
    //   where: {
    //     sessionId,
    //     sessionToken: token,
    //     status: 'upcoming',
    //   },
    // });
    //
    // if (!appointment) {
    //   return NextResponse.json(
    //     { error: "Invalid or expired session link" },
    //     { status: 401 }
    //   );
    // }

    // Mock validation - check if token exists for this sessionId
    // In production, fetch from database
    const storedToken = validTokens.get(token);
    
    if (!storedToken || storedToken.sessionId !== sessionId) {
      // For demo purposes, accept any token in development
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Dev mode: Accepting guest token without validation');
        
        // Create temporary guest session
        return issueSessionResponse(
          {
            success: true,
            message: "Guest session created",
          },
          {
            id: `guest-${Date.now()}`,
            name: "Guest User",
            email: `guest-${sessionId}@temp.local`,
            role: "guest",
          },
          200
        );
      }

      return NextResponse.json(
        { error: "Invalid or expired session link" },
        { status: 401 }
      );
    }

    // Create guest session with limited permissions
    return issueSessionResponse(
      {
        success: true,
        message: "Guest session created",
      },
      {
        id: `guest-${sessionId}`,
        name: storedToken.name,
        email: storedToken.email,
        role: "guest",
      },
      200
    );
  } catch (error) {
    console.error("Session token error:", error);
    return NextResponse.json(
      { error: "Failed to validate session token" },
      { status: 500 }
    );
  }
}

// Helper endpoint to register valid tokens (called by appointment creation)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, sessionId, email, name } = body;

    validTokens.set(token, { sessionId, email, name });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to register token" },
      { status: 500 }
    );
  }
}
