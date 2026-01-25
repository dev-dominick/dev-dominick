import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

/**
 * GET /api/conversations/[id]
 * Fetch a single conversation with all messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: { id: true, email: true, role: true },
            },
            attachments: true,
          },
        },
      },
    });

    if (!conversation) {
      return apiError("Conversation not found", 404);
    }

    // Check authorization - admin-main can access all, others only their own
    if (!isAdminMain && conversation.userId !== user.id) {
      return apiError("Forbidden", 403);
    }

    // Mark messages as read (for messages not sent by current user)
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return apiSuccess({ conversation });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return apiError("Failed to fetch conversation", 500);
  }
}

/**
 * PATCH /api/conversations/[id]
 * Update conversation status (close, archive, reopen)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const body = await request.json();
    const { status } = body;

    if (!status || !["open", "closed", "archived"].includes(status)) {
      return apiError("Invalid status", 400);
    }

    // Verify access
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

    const updated = await prisma.conversation.update({
      where: { id },
      data: { status },
    });

    return apiSuccess({ conversation: updated });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return apiError("Failed to update conversation", 500);
  }
}
