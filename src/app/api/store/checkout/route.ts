import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { randomUUID } from "crypto";

interface CheckoutItem {
  productId: string;
  quantity?: number;
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
    where: { id: { in: productIds } },
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
  const currency = "usd";

  // Generate a unique session ID for this checkout
  const stripeSessionId = `pending_${randomUUID()}`;

  const order = await prisma.order.create({
    data: {
      stripeSessionId,
      status: "pending",
      total: subtotal,
      currency,
      customerEmail,
      customerName,
      items: {
        create: orderItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          priceAtTime: item.product.price,
        })),
      },
    },
  });

  const successUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
  }/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
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
        unit_amount: item.product.price, // Already in cents
        product_data: {
          name: item.product.name,
          description: item.product.description || undefined,
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

  // Update order with actual Stripe session ID
  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({
    url: session.url,
    orderId: order.id,
    sessionId: session.id,
  });
}
