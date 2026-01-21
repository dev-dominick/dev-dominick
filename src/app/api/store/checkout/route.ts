import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { randomUUID } from "crypto";

interface CheckoutItem {
  productId: string;
  quantity?: number;
}

function generateOrderNumber() {
  const now = new Date();
  return `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}-${randomUUID()
    .slice(0, 6)
    .toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  const { items, customerEmail, customerName } = await req.json();

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items provided" }, { status: 400 });
  }

  if (!customerEmail) {
    return NextResponse.json(
      { error: "Customer email is required" },
      { status: 400 }
    );
  }

  const productIds = items
    .map((i: CheckoutItem) => i.productId)
    .filter(Boolean);

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json(
      { error: "One or more products are unavailable" },
      { status: 400 }
    );
  }

  // Build order line items and totals
  const orderItems = items.map((item: CheckoutItem) => {
    const product = products.find((p) => p.id === item.productId)!;
    const qty = Math.max(1, item.quantity ?? 1);
    return {
      product,
      quantity: qty,
      lineTotal: product.price * qty,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const currency = "USD";

  // Upsert customer
  const customer = await prisma.customer.upsert({
    where: { email: customerEmail },
    update: {
      name: customerName ?? undefined,
      lastPurchaseAt: new Date(),
    },
    create: {
      email: customerEmail,
      name: customerName ?? null,
      totalSpent: subtotal,
      orderCount: 0,
    },
  });

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      status: "pending",
      subtotal,
      tax: 0,
      total: subtotal,
      currency,
      customerEmail,
      customerName,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0] ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
      items: {
        create: orderItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productType: item.product.productType,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
  });

  const successUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
  }/order/${order.id}?success=true`;
  const cancelUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
  }/cart?canceled=true`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail,
    line_items: orderItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency,
        unit_amount: Math.round(item.product.price * 100),
        product_data: {
          name: item.product.name,
          description: item.product.description,
        },
      },
    })),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderId: order.id,
      customerEmail,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  return NextResponse.json({
    url: session.url,
    orderId: order.id,
    sessionId: session.id,
  });
}
