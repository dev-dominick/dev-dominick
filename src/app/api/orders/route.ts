import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { generalRateLimiter } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-utils'
import { apiSuccess, apiError, apiRateLimitError } from '@/lib/api-response'

async function findNextAvailableSlot(durationMinutes = 60) {
  const availability = await prisma.availability.findMany({ where: { isActive: true } });
  if (!availability.length) return null;

  const start = new Date();
  // Pre-fetch all appointments in the date range to avoid N+1 queries
  const endDate = new Date(start);
  endDate.setDate(start.getDate() + 14);
  
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      startTime: { gte: start },
      endTime: { lte: endDate },
      status: { in: ['scheduled', 'confirmed', 'pending'] },
    },
    select: { startTime: true, endTime: true },
  });

  for (let day = 0; day < 14; day++) {
    const date = new Date(start);
    date.setDate(start.getDate() + day);
    const dow = date.getUTCDay();
    const dayAvailability = availability.filter((a) => a.dayOfWeek === dow);
    if (!dayAvailability.length) continue;

    for (const window of dayAvailability) {
      const [sh, sm] = window.startTime.split(':').map(Number);
      const [eh, em] = window.endTime.split(':').map(Number);
      const windowStart = new Date(date);
      windowStart.setUTCHours(sh, sm, 0, 0);
      const windowEnd = new Date(date);
      windowEnd.setUTCHours(eh, em, 0, 0);

      for (
        let slotStart = new Date(windowStart);
        slotStart < windowEnd;
        slotStart = new Date(slotStart.getTime() + 60 * 60 * 1000)
      ) {
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
        if (slotEnd > windowEnd) break;

        // Check conflict in-memory instead of querying DB
        const conflict = existingAppointments.some(
          (apt) => apt.startTime < slotEnd && apt.endTime > slotStart
        );

        if (!conflict) {
          return { startTime: slotStart, endTime: slotEnd };
        }
      }
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Cap at 100
    const offset = parseInt(searchParams.get('offset') || '0')

    // SECURITY: Require admin auth for querying orders
    // Users should only see their own orders through /api/me/orders
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token || (token.role !== 'admin' && token.role !== 'admin-main')) {
      return apiError('Unauthorized - admin access required', 401)
    }

    const where: Record<string, unknown> = {}
    if (email) {
      where.customerEmail = email
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.order.count({ where })

    return apiSuccess({
      orders,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return apiError('Failed to fetch orders', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = generalRateLimiter.check(`orders:create:${ip}`)
    if (!rl.allowed) {
      return apiRateLimitError(
        'Too many requests. Please try again later.',
        rl.remaining,
        rl.resetAt
      )
    }

    const body = await request.json()
    const { stripeSessionId, email, items = [], total, currency = 'usd', customerName } = body

    const existing = await prisma.order.findUnique({
      where: { stripeSessionId },
    })

    if (existing) {
      return apiSuccess({ order: existing, existing: true })
    }

    const order = await prisma.order.create({
      data: {
        stripeSessionId,
        customerEmail: email,
        customerName,
        total,
        currency,
        status: 'completed',
        completedAt: new Date(),
        items: {
          create: await Promise.all(
            (items as any[]).map(async (item) => {
              const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { id: true, name: true, category: true, price: true },
              });

              return {
                product: product ? { connect: { id: product.id } } : undefined,
                productId: item.productId,
                quantity: item.quantity || 1,
                priceAtTime: item.price ?? product?.price ?? 0,
              };
            })
          ),
        },
      },
    })

    // Auto-create consultation appointment for consult products
    const hasConsultItem = items.some((item: any) => item.category === 'consultation' || item.isConsult === true)

    if (hasConsultItem) {
      const slot = await findNextAvailableSlot(60)
      const startTime = slot?.startTime || new Date(Date.now() + 24 * 60 * 60 * 1000)
      const endTime = slot?.endTime || new Date(startTime.getTime() + 60 * 60 * 1000)

      await prisma.appointment.create({
        data: {
          clientName: customerName || email || 'Consultation Client',
          clientEmail: email,
          startTime,
          endTime,
          duration: 60,
          notes: 'Auto-created from paid consultation order',
          status: 'pending',
          sessionToken: stripeSessionId,
          userId: process.env.ADMIN_USER_ID || 'default-owner',
          billableHours: 1,
        },
      })
    }

    return apiSuccess({ order, success: true })
  } catch (error) {
    console.error('Error creating order:', error)
    return apiError('Failed to create order', 500)
  }
}
