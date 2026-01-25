import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const ids = searchParams.get("ids");
  const sort = searchParams.get("sort") ?? "popular";

  const idList = ids?.split(",").filter(Boolean) ?? [];

  const where: Prisma.ProductWhereInput = {};
  if (idList.length) {
    where.id = { in: idList };
  }
  if (category && category !== "all") {
    where.category = category;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { salesCount: "desc" };
  switch (sort) {
    case "price-low":
      orderBy = { price: "asc" };
      break;
    case "price-high":
      orderBy = { price: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    default:
      orderBy = { salesCount: "desc" };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
  });

  return NextResponse.json({ products });
}
