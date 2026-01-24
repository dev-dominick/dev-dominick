import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY

export const stripe = new Stripe(stripeKey || '', {
  // Use a stable, GA Stripe API version; avoid unreleased codenames that break requests
  apiVersion: '2023-10-16',
})
