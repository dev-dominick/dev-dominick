import { stripe } from '@/lib/stripe'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextRequest, NextResponse } from 'next/server'

// Shop checkout - creates Stripe Checkout Session for product purchases
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, amount, description, projectName } = body

    // Handle shop checkout (cart with items)
    if (items && Array.isArray(items) && items.length > 0) {
      // Build line items for Stripe Checkout
      const lineItems = items.map((item: any) => ({
        price: item.stripePriceId,
        quantity: item.quantity,
      }))

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: lineItems,
        success_url: `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/checkout/cancel`,
        automatic_tax: { enabled: false },
        billing_address_collection: 'auto',
        payment_method_types: ['card'],
        metadata: {
          items: JSON.stringify(items.map((i: any) => ({ id: i.id, name: i.name, quantity: i.quantity }))),
        },
      })

      return NextResponse.json({ sessionId: session.id, url: session.url })
    }

    // Handle custom payment intent (project payment)
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    const userSession = await getServerSession(authOptions)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      description: description || `Payment for: ${projectName}`,
      metadata: {
        projectName: projectName || 'Unknown Project',
        userId: userSession?.user?.id || 'anonymous',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error: any) {
    console.error('Error in checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process payment' },
      { status: 500 }
    )
  }
}
