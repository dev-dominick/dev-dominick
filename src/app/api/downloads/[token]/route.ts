import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  
  // Find order with this download token in downloadLinks array
  const order = await prisma.order.findFirst({
    where: {
      downloadLinks: { has: token },
      status: "completed",
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Invalid download token" },
      { status: 404 }
    );
  }

  // For now, return success - in production, this would redirect to actual file
  return NextResponse.json({
    success: true,
    message: "Download authorized",
    orderId: order.id,
  });
}
