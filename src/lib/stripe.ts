import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY

// Validate Stripe key in production
if (!stripeKey && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_SECRET_KEY is required in production')
}

export const stripe = new Stripe(stripeKey || 'sk_test_placeholder', {
  // Let Stripe SDK use its default API version
  // @ts-expect-error - Stripe types require exact version match
  apiVersion: '2023-10-16',
})
