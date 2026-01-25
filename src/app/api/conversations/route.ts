import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { generalRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-utils";

/**
 * GET /api/conversations
 * Fetch conversations for the current user
 * admin-main sees all conversations, others see only their own
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return apiError("Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    const isAdminMain = user.role === "admin-main";

    // admin-main sees all conversations, others see only their own
    const conversations = await prisma.conversation.findMany({
      where: isAdminMain ? {} : { userId: user.id },
      include: {
        user: {
          select: { id: true, email: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            content: true,
            senderType: true,
            createdAt: true,
            readAt: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                readAt: null,
                // Only count unread messages NOT from the current user
                senderId: { not: user.id },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform for client
    const result = conversations.map((conv) => ({
      id: conv.id,
      subject: conv.subject,
      status: conv.status,
      userId: conv.userId,
      userEmail: conv.user?.email || conv.guestEmail,
      guestName: conv.guestName,
      lastMessage: conv.messages[0] || null,
      unreadCount: conv._count.messages,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }));

    return apiSuccess({ conversations: result });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return apiError("Failed to fetch conversations", 500);
  }
}

/**
 * POST /api/conversations
 * Create a new conversation (start a thread)
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = generalRateLimiter.check(`conversations:create:${ip}`);
    if (!rl.allowed) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const session = await getServerSession();
    const body = await request.json();
    const { subject, message, guestEmail, guestName } = body;

    if (!subject || !message) {
      return apiError("Subject and message are required", 400);
    }

    let userId: string | null = null;
    let senderType: string = "guest";

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true },
      });

      if (user) {
        userId = user.id;
        senderType = user.role || "user";
      }
    }

    // Create conversation with initial message
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        guestEmail: userId ? null : guestEmail,
        guestName: userId ? null : guestName,
        subject,
        status: "open",
        messages: {
          create: {
            senderId: userId,
            senderType,
            content: message,
          },
        },
      },
      include: {
        messages: true,
        user: {
          select: { id: true, email: true },
        },
      },
    });

    return apiSuccess({ conversation }, 201);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return apiError("Failed to create conversation", 500);
  }
}
