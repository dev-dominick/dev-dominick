import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error(`Webhook signature verification failed.`, error);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = paymentIntent.metadata?.userId;

        // Only record if we have a valid userId to satisfy FK constraints
        if (userId) {
          await prisma.stripePayment.upsert({
            where: { paymentIntentId: paymentIntent.id },
            create: {
              userId,
              sessionId: paymentIntent.id,
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency || "usd",
              status: "succeeded",
              metadata: paymentIntent.metadata,
            },
            update: {
              status: "succeeded",
            },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = paymentIntent.metadata?.userId;

        if (userId) {
          await prisma.stripePayment.upsert({
            where: { paymentIntentId: paymentIntent.id },
            create: {
              userId,
              sessionId: paymentIntent.id,
              paymentIntentId: paymentIntent.id,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency || "usd",
              status: "failed",
              metadata: paymentIntent.metadata,
            },
            update: {
              status: "failed",
            },
          });
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;

        if (charge.payment_intent) {
          await prisma.stripePayment.updateMany({
            where: { paymentIntentId: charge.payment_intent },
            data: { status: "refunded" },
          });
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        const email =
          session.customer_details?.email || session.metadata?.customerEmail;
        const name = session.customer_details?.name;
        const paymentIntentId = session.payment_intent?.toString();

        if (!orderId) {
          break;
        }

        const order = await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "paid",
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
            paidAt: new Date(),
            customerEmail: email ?? undefined,
            customerName: name ?? undefined,
          },
        });

        const existingDownloads = await prisma.download.findMany({
          where: { orderId },
        });

        if (existingDownloads.length === 0) {
          const orderWithItems = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
          });

          const productIds =
            orderWithItems?.items.map((i) => i.productId) ?? [];
          const products = productIds.length
            ? await prisma.product.findMany({
                where: { id: { in: productIds } },
              })
            : [];

          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

          const downloadCreates = (orderWithItems?.items || [])
            .map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;
              return prisma.download.create({
                data: {
                  orderId,
                  productId: product.id,
                  downloadToken: randomUUID(),
                  expiresAt,
                  maxDownloads: 5,
                },
              });
            })
            .filter(Boolean);

          if (downloadCreates.length) {
            await prisma.$transaction(downloadCreates);
          }
        }

        const ownerUserId = process.env.BUSINESS_OWNER_USER_ID;
        if (ownerUserId && session.amount_total) {
          await prisma.businessRevenue.create({
            data: {
              userId: ownerUserId,
              source: "digital_product_sale",
              amount: session.amount_total / 100,
              currency: (session.currency || "usd").toUpperCase(),
              description: `Order ${order.orderNumber}`,
              date: new Date(),
              stripePaymentId: paymentIntentId ?? session.id,
            },
          });
        }

        break;
      }
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }

  return Response.json({ received: true });
}
