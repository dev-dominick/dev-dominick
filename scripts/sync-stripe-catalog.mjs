#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Stripe from 'stripe'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const catalogPath = path.resolve(__dirname, '../src/lib/catalog.json')

const stripeSecret = process.env.STRIPE_SECRET_KEY
if (!stripeSecret) {
  console.error('ERROR: STRIPE_SECRET_KEY is required to sync the catalog.')
  process.exit(1)
}

const stripe = new Stripe(stripeSecret, { apiVersion: '2024-12-31.acacia' })

function loadCatalog() {
  const raw = fs.readFileSync(catalogPath, 'utf8')
  return JSON.parse(raw)
}

async function findProductByCatalogId(catalogId) {
  const list = await stripe.products.list({ limit: 100 })
  return list.data.find((product) => product.metadata?.catalog_id === catalogId)
}

async function upsertProduct(entry) {
  const existing = await findProductByCatalogId(entry.id)

  if (existing) {
    await stripe.products.update(existing.id, {
      name: entry.name,
      description: entry.description,
      metadata: {
        ...existing.metadata,
        catalog_id: entry.id,
        env_price_key: entry.envPriceKey,
      },
    })
    return existing.id
  }

  const created = await stripe.products.create({
    name: entry.name,
    description: entry.description,
    metadata: {
      catalog_id: entry.id,
      env_price_key: entry.envPriceKey,
    },
  })

  return created.id
}

async function upsertPrice(productId, entry) {
  const lookupKey = entry.envPriceKey.toLowerCase()
  const targetAmount = Math.round(entry.price * 100)
  const prices = await stripe.prices.list({ product: productId, limit: 100 })

  const existing = prices.data.find(
    (price) => price.active && price.currency === 'usd' && price.unit_amount === targetAmount
  )

  if (existing) {
    return existing.id
  }

  // Deactivate other active prices so only one is live per product
  const activePrices = prices.data.filter((price) => price.active)
  if (activePrices.length) {
    await Promise.all(activePrices.map((price) => stripe.prices.update(price.id, { active: false })))
  }

  const created = await stripe.prices.create({
    product: productId,
    unit_amount: targetAmount,
    currency: 'usd',
    nickname: entry.name,
    lookup_key: lookupKey,
    metadata: {
      catalog_id: entry.id,
      env_price_key: entry.envPriceKey,
    },
  })

  return created.id
}

async function main() {
  const catalog = loadCatalog()
  const results = []

  for (const entry of catalog) {
    const productId = await upsertProduct(entry)
    const priceId = await upsertPrice(productId, entry)
    results.push({ envKey: entry.envPriceKey, priceId, productId })
  }

  console.log('\nStripe catalog sync complete.')
  console.log('Add these to your .env.local:')
  results.forEach((result) => {
    console.log(`${result.envKey}=${result.priceId}`)
  })
}

main().catch((error) => {
  console.error('ERROR: Failed to sync catalog:', error)
  process.exit(1)
})
