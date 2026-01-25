import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getClientIp } from "@/lib/request-utils";
import { generalRateLimiter } from "@/lib/rate-limit";
import { validateAmount } from "@/lib/validators";

const MIN_DEPOSIT_USD = 10; // $10 minimum
const MAX_DEPOSIT_USD = 10000; // $10,000 maximum

/**
 * POST /api/payments/stripe/session
 * Create a Stripe Checkout session for USD deposits
 * 
 * Requires authentication
 * Body: { amountUsd: number } - amount in dollars (not cents)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const rl = generalRateLimiter.check(`stripe-deposit:${ip}`);
    if (!rl.allowed) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    // Require authentication
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.sub) {
      return apiError("Authentication required", 401);
    }

    const userId = token.sub;

    // Parse and validate request body
    const body = await request.json();
    const { amountUsd } = body;

    if (!amountUsd) {
      return apiError("Amount is required", 400);
    }

    // Validate amount
    let validatedAmount: number;
    try {
      validatedAmount = validateAmount(amountUsd, "Amount");
    } catch (error) {
      return apiError(error instanceof Error ? error.message : "Invalid amount", 400);
    }

    // Check range
    if (validatedAmount < MIN_DEPOSIT_USD) {
      return apiError(`Minimum deposit is $${MIN_DEPOSIT_USD}`, 400);
    }
    if (validatedAmount > MAX_DEPOSIT_USD) {
      return apiError(`Maximum deposit is $${MAX_DEPOSIT_USD}`, 400);
    }

    // Convert to cents for Stripe
    const amountCents = Math.round(validatedAmount * 100);

    // Get user email for Stripe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "USD Deposit",
              description: `Deposit $${validatedAmount.toFixed(2)} to your account`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        userId,
        type: "deposit",
        amountCents: amountCents.toString(),
      },
      success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/app?deposit=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/app?deposit=cancelled`,
    });

    // Create pending StripeDeposit record
    const stripeDeposit = await prisma.stripeDeposit.create({
      data: {
        userId,
        amountUsd: amountCents,
        stripeSessionId: session.id,
        status: "pending",
      },
    });

    // Also create a PaymentReceipt for unified tracking
    await prisma.paymentReceipt.create({
      data: {
        userId,
        method: "STRIPE",
        amountCents,
        currency: "USD",
        status: "PENDING",
        externalRef: session.id,
        description: `Stripe deposit - $${validatedAmount.toFixed(2)}`,
      },
    });

    console.log(`[DEPOSIT] Created session ${session.id} for user ${userId}, amount: $${validatedAmount}`);

    return apiSuccess({
      sessionId: session.id,
      url: session.url,
      depositId: stripeDeposit.id,
    });
  } catch (error) {
    console.error("Stripe session creation error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return apiError(error.message, error.statusCode || 500);
    }

    return apiError("Failed to create deposit session", 500);
  }
}
