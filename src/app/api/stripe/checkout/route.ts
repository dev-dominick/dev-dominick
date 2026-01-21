import { stripe } from '@/lib/stripe'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const { amount, description, projectName } = await req.json()

  if (!amount || amount <= 0) {
    return Response.json(
      { error: 'Invalid amount' },
      { status: 400 }
    )
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      description: description || `Payment for: ${projectName}`,
      metadata: {
        projectName: projectName || 'Unknown Project',
        userId: session?.user?.id || 'anonymous',
      },
    })

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return Response.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
