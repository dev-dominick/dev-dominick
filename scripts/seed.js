/*
 * Prisma database seed script
 * - Seeds admin user (domalbano35@gmail.com) with role=admin
 * - Seeds basic weekly availability
 * - Seeds example products
 * Idempotent: uses upsert on unique fields
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedAdminUser() {
  const email = process.env.ADMIN_EMAIL || 'domalbano35@gmail.com'
  const role = 'admin'
  
  // SECURITY: Require ADMIN_PASSWORD env var - no default fallback
  const plain = process.env.ADMIN_PASSWORD
  if (!plain) {
    throw new Error(
      'ADMIN_PASSWORD environment variable is required.\n' +
      'Set it in .env.local: ADMIN_PASSWORD=your-secure-password-here\n' +
      'Use a strong password with at least 12 characters.'
    )
  }
  
  if (plain.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long')
  }
  
  const password = await bcrypt.hash(plain, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: { role },
    create: { email, role, password },
    select: { id: true, email: true, role: true },
  })

  return { user }
}

async function seedAvailability() {
  // Monday (1) to Friday (5), 09:00-17:00 UTC
  const windows = [1, 2, 3, 4, 5].map((dow) => ({ dayOfWeek: dow, startTime: '09:00', endTime: '17:00' }))

  const results = []
  for (const w of windows) {
    const res = await prisma.availability.upsert({
      where: { dayOfWeek_startTime_endTime: { dayOfWeek: w.dayOfWeek, startTime: w.startTime, endTime: w.endTime } },
      update: { isActive: true },
      create: { dayOfWeek: w.dayOfWeek, startTime: w.startTime, endTime: w.endTime, isActive: true },
      select: { id: true, dayOfWeek: true, startTime: true, endTime: true },
    })
    results.push(res)
  }
  return results
}

async function seedProducts() {
  const products = [
    {
      id: undefined,
      name: 'Consultation (60 min)',
      description: 'One-on-one consultation session',
      category: 'consultation',
      price: 10000, // cents
      stripePriceId: 'price_demo_consult',
      stripeProductId: 'prod_demo_consult',
      features: ['1 hour session', 'Video call'],
    },
    {
      id: undefined,
      name: 'Digital Template Pack',
      description: 'A pack of reusable templates',
      category: 'digital',
      price: 2999,
      stripePriceId: 'price_demo_templates',
      stripeProductId: 'prod_demo_templates',
      features: ['Source files', 'Lifetime updates'],
    },
  ]

  const results = []
  for (const p of products) {
    const res = await prisma.product.upsert({
      where: { stripePriceId: p.stripePriceId },
      update: {
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        stripeProductId: p.stripeProductId,
        features: p.features,
      },
      create: p,
      select: { id: true, name: true, price: true, category: true, stripePriceId: true },
    })
    results.push(res)
  }
  return results
}

async function main() {
  console.log('🌱 Seeding database...')
  const { user } = await seedAdminUser()
  const availability = await seedAvailability()
  const products = await seedProducts()

  console.log('✅ Admin user:', user)
  console.log('✅ Availability windows:', availability.map(a => ({ dow: a.dayOfWeek, start: a.startTime, end: a.endTime })))
  console.log('✅ Products:', products.map(p => ({ id: p.id, name: p.name, price: p.price })))

  console.log('✨ Seed complete.')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
