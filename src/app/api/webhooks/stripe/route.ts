import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail, orderConfirmationEmail } from "@/lib/email";

// Fail-fast in production when secrets are missing; allow local testing to surface explicit errors
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✓ Payment succeeded:", {
          sessionId: session.id,
          customerId: session.customer,
          amount: session.amount_total,
          metadata: session.metadata,
        });

        // Retrieve full session data with line items
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ["line_items"],
        });

        const lineItems = (fullSession.line_items?.data || []) as Stripe.LineItem[];

        // Ensure prisma is available for writes
        if (!prisma) {
          console.error("Prisma client unavailable for order creation")
          return NextResponse.json({ received: true })
        }

        // Idempotent save: if order exists for this session, skip create
        const existing = await prisma.order.findUnique({
          where: { stripeSessionId: session.id },
        })

        let order = existing
        if (!existing) {
          order = await prisma.order.create({
            data: {
              stripeSessionId: session.id,
              stripeCustomerId: (session.customer as string) || null,
              total: session.amount_total || 0,
              currency: session.currency || "usd",
              status: "completed",
              customerEmail: session.customer_email || "",
              customerName: session.customer_details?.name || undefined,
              completedAt: new Date(),
              items: {
                create: lineItems.map((item) => ({
                  productId: (item.price?.product as string) || "",
                  quantity: item.quantity || 1,
                  priceAtTime: item.price?.unit_amount || 0,
                })),
              },
            },
          })
        }

        if (order) {
          // Send order confirmation email
          const orderItems = lineItems.map((item) => ({
            name: item.description || "Product",
            quantity: item.quantity || 1,
            price: item.price?.unit_amount || 0,
          }));

          const emailHtml = orderConfirmationEmail({
            customerName: session.customer_details?.name || "Valued Customer",
            orderId: order.id,
            items: orderItems,
            total: session.amount_total || 0,
            downloadLinks: order.downloadLinks || [],
          });

          await sendEmail({
            to: session.customer_email || "",
            subject: "Order Confirmation - Thank You! 🎉",
            html: emailHtml,
          });

          console.log("✓ Order saved and confirmation email sent:", order.id);
        }
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✓ Async payment succeeded:", session.id);
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✗ Async payment failed:", session.id);
        // TODO: Send failure notification email
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log("✓ Refund processed:", {
          chargeId: charge.id,
          amount: charge.amount_refunded,
        });
        // Schema does not track payment intent on Order; log only.
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
