import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ProductWhereInput {
  isActive?: boolean;
  id?: { in: string[] };
  productType?: string;
  category?: string;
  OR?: Array<{
    name?: { contains: string; mode: string };
    description?: { contains: string; mode: string };
  }>;
}

interface ProductOrderByInput {
  salesCount?: string;
  price?: string;
  lastUpdated?: string;
}

function parseJsonArray(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const ids = searchParams.get("ids");
  const sort = searchParams.get("sort") ?? "popular";

  const idList = ids?.split(",").filter(Boolean) ?? [];

  const where: ProductWhereInput = { isActive: true };
  if (idList.length) {
    where.id = { in: idList };
  }
  if (type && type !== "all") {
    where.productType = type;
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

  let orderBy: ProductOrderByInput = { salesCount: "desc" };
  switch (sort) {
    case "price-low":
      orderBy = { price: "asc" };
      break;
    case "price-high":
      orderBy = { price: "desc" };
      break;
    case "newest":
      orderBy = { lastUpdated: "desc" };
      break;
    default:
      orderBy = { salesCount: "desc" };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
  });

  const sanitized = products.map((p) => ({
    ...p,
    features: parseJsonArray(p.features),
    techStack: parseJsonArray(p.techStack),
  }));

  return NextResponse.json({ products: sanitized });
}
