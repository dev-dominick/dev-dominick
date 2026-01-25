import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { generalRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-utils";

/**
 * GET /api/conversations/[id]/messages
 * Fetch messages for a conversation (with pagination)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

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

    // Verify conversation access
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!conversation) {
      return apiError("Conversation not found", 404);
    }

    if (!isAdminMain && conversation.userId !== user.id) {
      return apiError("Forbidden", 403);
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      include: {
        sender: {
          select: { id: true, email: true, role: true },
        },
        attachments: true,
      },
    });

    return apiSuccess({ 
      messages,
      nextCursor: messages.length === limit ? messages[messages.length - 1].id : null,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return apiError("Failed to fetch messages", 500);
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Send a new message in a conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = getClientIp(request);
    const rl = generalRateLimiter.check(`messages:send:${ip}`);
    if (!rl.allowed) {
      return apiError("Too many messages. Please slow down.", 429);
    }

    const session = await getServerSession();

    if (!session?.user?.email) {
      return apiError("Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, email: true },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    const isAdminMain = user.role === "admin-main";

    // Verify conversation access
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!conversation) {
      return apiError("Conversation not found", 404);
    }

    if (!isAdminMain && conversation.userId !== user.id) {
      return apiError("Forbidden", 403);
    }

    // Prevent sending to closed conversations (unless admin-main)
    if (conversation.status === "closed" && !isAdminMain) {
      return apiError("This conversation is closed", 400);
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return apiError("Message content is required", 400);
    }

    if (content.length > 5000) {
      return apiError("Message is too long (max 5000 characters)", 400);
    }

    // Create message and update conversation timestamp
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: id,
          senderId: user.id,
          senderType: user.role || "user",
          content: content.trim(),
        },
        include: {
          sender: {
            select: { id: true, email: true, role: true },
          },
        },
      }),
      prisma.conversation.update({
        where: { id },
        data: { 
          updatedAt: new Date(),
          // Reopen if was closed and user is admin-main
          ...(conversation.status === "closed" && isAdminMain && { status: "open" }),
        },
      }),
    ]);

    return apiSuccess({ message }, 201);
  } catch (error) {
    console.error("Error sending message:", error);
    return apiError("Failed to send message", 500);
  }
}
