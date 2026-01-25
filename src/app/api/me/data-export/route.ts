import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

/**
 * GET /api/me/data-export
 * GDPR: Export all user data in JSON format
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError("Unauthorized", 401);
    }

    const userId = session.user.id;

    // Fetch all user data
    const [user, appointments, orders, contactMessages, conversations] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
          emailVerified: true,
          // Exclude sensitive fields: password, tokens
        },
      }),
      prisma.appointment.findMany({
        where: { userId },
        select: {
          id: true,
          clientName: true,
          clientEmail: true,
          clientPhone: true,
          startTime: true,
          endTime: true,
          duration: true,
          notes: true,
          status: true,
          consultationType: true,
          createdAt: true,
        },
      }),
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            select: {
              quantity: true,
              priceAtTime: true,
              product: {
                select: {
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      }),
      prisma.contactMessage.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.conversation.findMany({
        where: { userId },
        include: {
          messages: {
            select: {
              content: true,
              senderType: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    if (!user) {
      return apiError("User not found", 404);
    }

    // Format export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      gdprNotice: "This is your personal data export as required by GDPR Article 20 (Right to Data Portability).",
      account: user,
      appointments,
      orders: orders.map((order) => ({
        id: order.id,
        total: order.total,
        currency: order.currency,
        status: order.status,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        items: order.items,
        createdAt: order.createdAt,
        completedAt: order.completedAt,
      })),
      contactMessages,
      conversations: conversations.map((conv) => ({
        id: conv.id,
        subject: conv.subject,
        status: conv.status,
        createdAt: conv.createdAt,
        messages: conv.messages,
      })),
    };

    // Return as JSON with download headers
    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="data-export-${userId.slice(0, 8)}-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    return apiError("Failed to export data", 500);
  }
}
