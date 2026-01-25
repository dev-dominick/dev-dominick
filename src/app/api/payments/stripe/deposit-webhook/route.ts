import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.STRIPE_DEPOSIT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * POST /api/payments/stripe/deposit-webhook
 * Handle Stripe webhook events for deposits
 * 
 * Separate from order webhooks to isolate deposit logic
 */
export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!sig || !webhookSecret) {
    console.error("Missing signature or webhook secret for deposit webhook");
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error("Deposit webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only process deposit-type sessions
        if (session.metadata?.type !== "deposit") {
          console.log(`Skipping non-deposit session: ${session.id}`);
          return NextResponse.json({ received: true, skipped: true });
        }

        console.log("✓ Deposit payment succeeded:", {
          sessionId: session.id,
          userId: session.metadata?.userId,
          amount: session.amount_total,
        });

        const userId = session.metadata?.userId;
        const amountCents = parseInt(session.metadata?.amountCents || "0", 10);

        if (!userId) {
          console.error("Missing userId in deposit session metadata");
          return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
        }

        // Idempotent: Check if already processed
        const existingDeposit = await prisma.stripeDeposit.findUnique({
          where: { stripeSessionId: session.id },
        });

        if (existingDeposit?.status === "completed") {
          console.log(`Deposit ${session.id} already processed, skipping`);
          return NextResponse.json({ received: true, duplicate: true });
        }

        // Get payment intent ID if available
        const paymentIntentId = typeof session.payment_intent === "string" 
          ? session.payment_intent 
          : session.payment_intent?.id;

        // Create Deposit record for Kraken settlement bookkeeping
        const deposit = await prisma.deposit.create({
          data: {
            userId,
            amountUsd: amountCents,
            source: "stripe",
            status: "pending_kraken",
          },
        });

        // Update StripeDeposit to completed and link to Deposit
        if (existingDeposit) {
          await prisma.stripeDeposit.update({
            where: { id: existingDeposit.id },
            data: {
              status: "completed",
              stripePaymentIntentId: paymentIntentId,
              depositId: deposit.id,
              completedAt: new Date(),
            },
          });
        } else {
          // Create if it doesn't exist (fallback)
          await prisma.stripeDeposit.create({
            data: {
              userId,
              amountUsd: amountCents,
              stripeSessionId: session.id,
              stripePaymentIntentId: paymentIntentId,
              status: "completed",
              depositId: deposit.id,
              completedAt: new Date(),
            },
          });
        }

        console.log(`✓ Deposit recorded: $${(amountCents / 100).toFixed(2)} for user ${userId}`);
        console.log(`✓ Kraken settlement record created: ${deposit.id} (status: pending_kraken)`);

        // Update PaymentReceipt to RECEIVED
        await prisma.paymentReceipt.updateMany({
          where: {
            externalRef: session.id,
            method: "STRIPE",
            status: "PENDING",
          },
          data: {
            status: "RECEIVED",
            receivedAt: new Date(),
          },
        });

        // TODO: Send deposit confirmation email
        // TODO: Trigger Kraken funding workflow (manual or automated)

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.type !== "deposit") {
          return NextResponse.json({ received: true, skipped: true });
        }

        // Mark deposit as failed/expired
        await prisma.stripeDeposit.updateMany({
          where: { 
            stripeSessionId: session.id,
            status: "pending",
          },
          data: { 
            status: "failed",
            updatedAt: new Date(),
          },
        });

        console.log(`✗ Deposit session expired: ${session.id}`);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log("✓ Deposit refund processed:", {
          chargeId: charge.id,
          amount: charge.amount_refunded,
        });

        // Find and update related deposit
        const paymentIntentId = typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;

        if (paymentIntentId) {
          const stripeDeposit = await prisma.stripeDeposit.findUnique({
            where: { stripePaymentIntentId: paymentIntentId },
          });

          if (stripeDeposit) {
            await prisma.stripeDeposit.update({
              where: { id: stripeDeposit.id },
              data: { status: "refunded" },
            });

            // Also update the linked Deposit record
            if (stripeDeposit.depositId) {
              await prisma.deposit.update({
                where: { id: stripeDeposit.depositId },
                data: { 
                  status: "failed",
                  settlementNotes: "Refunded via Stripe",
                },
              });
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled deposit webhook event: ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing deposit webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
