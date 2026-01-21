import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();

    // TODO: Install Stripe SDK: npm install stripe @stripe/stripe-js
    // TODO: Add STRIPE_SECRET_KEY to .env.local
    //
    // import Stripe from 'stripe';
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    //
    // const session = await stripe.checkout.sessions.create({
    //     payment_method_types: ['card'],
    //     line_items: items.map((item: any) => ({
    //         price: item.stripePriceId,
    //         quantity: item.quantity
    //     })),
    //     mode: 'payment',
    //     success_url: `${process.env.NEXT_PUBLIC_URL}/cart?success=true`,
    //     cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart?canceled=true`,
    //     metadata: {
    //         orderItems: JSON.stringify(items.map((item: any) => ({
    //             id: item.id,
    //             name: item.name,
    //             quantity: item.quantity,
    //             price: item.price
    //         })))
    //     }
    // });
    //
    // return NextResponse.json({ url: session.url });

    // Mock response for now

    // Simulate successful checkout
    return NextResponse.json({
      url: "/cart?success=true",
      sessionId: "mock_session_" + Date.now(),
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
