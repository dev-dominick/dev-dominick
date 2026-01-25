import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY

export const stripe = new Stripe(stripeKey || '', {
  // Let Stripe SDK use its default API version
  // @ts-expect-error - Stripe types require exact version match
  apiVersion: '2023-10-16',
})
