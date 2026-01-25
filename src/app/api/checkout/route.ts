import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { priceId, productName, amount } = await request.json();

    // Validate input
    if (!priceId || !productName) {
      return NextResponse.json(
        { error: "Missing priceId or productName" },
        { status: 400 }
      );
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
      }/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
      }/pricing`,
      customer_email: undefined, // Customer email will be entered during checkout
      metadata: {
        productName,
        amount,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
