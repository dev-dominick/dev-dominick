import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const download = await prisma.download.findUnique({
    where: { downloadToken: token },
    include: { product: true },
  });

  if (!download || !download.product) {
    return NextResponse.json(
      { error: "Invalid download token" },
      { status: 404 }
    );
  }

  const now = new Date();
  if (download.expiresAt < now) {
    return NextResponse.json(
      { error: "Download link expired" },
      { status: 410 }
    );
  }

  if (download.downloadCount >= download.maxDownloads) {
    return NextResponse.json(
      { error: "Download limit reached" },
      { status: 429 }
    );
  }

  // Track download
  await prisma.download.update({
    where: { id: download.id },
    data: {
      downloadCount: { increment: 1 },
      firstDownloadAt: download.firstDownloadAt ?? now,
      lastDownloadAt: now,
    },
  });

  // For now, return the stored URL. In production, swap to a presigned S3 URL.
  if (!download.product.downloadUrl) {
    return NextResponse.json(
      { error: "Download not available yet" },
      { status: 404 }
    );
  }

  return NextResponse.json({ url: download.product.downloadUrl });
}
