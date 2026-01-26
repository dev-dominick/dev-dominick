import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api-response'

/**
 * Helper to check if request is from admin
 */
// Use shared helper from src/lib/api-auth

export async function GET(request: NextRequest) {
  try {
    // Dev fallback: return static availability when admin toggle is on
    if (process.env.NODE_ENV === 'development' && request.cookies.get('dev_admin_mode')?.value === 'true') {
      const availability = [
        { id: 'dev-av-1', dayOfWeek: 1, startTime: '09:00', endTime: '12:00', isActive: true },
        { id: 'dev-av-2', dayOfWeek: 1, startTime: '13:00', endTime: '17:00', isActive: true },
        { id: 'dev-av-3', dayOfWeek: 2, startTime: '10:00', endTime: '14:00', isActive: true },
        { id: 'dev-av-4', dayOfWeek: 3, startTime: '09:00', endTime: '12:00', isActive: true },
        { id: 'dev-av-5', dayOfWeek: 3, startTime: '14:00', endTime: '18:00', isActive: true },
        { id: 'dev-av-6', dayOfWeek: 4, startTime: '10:00', endTime: '16:00', isActive: true },
        { id: 'dev-av-7', dayOfWeek: 5, startTime: '09:00', endTime: '13:00', isActive: true },
      ]
      return apiSuccess({ availability })
    }

    // SECURITY: In production, require admin auth for availability data
    if (process.env.NODE_ENV === 'production') {
      const admin = await requireAdmin(request)
      if (!admin) {
        return apiError('Unauthorized - admin access required', 401)
      }
    }

    const availability = await prisma.availability.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return apiSuccess({ availability })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return apiError('Failed to fetch availability', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require admin auth for creating availability
    const admin = await requireAdmin(request)
    if (!admin) {
      return apiError('Unauthorized - admin access required', 401)
    }

    const body = await request.json()
    const { dayOfWeek, startTime, endTime, timezone } = body

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return apiError('Missing required fields', 400)
    }

    const availability = await prisma.availability.create({
      data: {
        dayOfWeek,
        startTime,
        endTime,
        timezone: timezone || 'UTC',
        isActive: true,
      },
    })

    return apiSuccess({ availability, success: true })
  } catch (error) {
    console.error('Error creating availability:', error)
    return apiError('Failed to create availability', 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // SECURITY: Require admin auth for deleting availability
    const admin = await requireAdmin(request)
    if (!admin) {
      return apiError('Unauthorized - admin access required', 401)
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return apiError('Missing availability ID', 400)
    }

    await prisma.availability.delete({
      where: { id },
    })

    return apiSuccess({ success: true })
  } catch (error) {
    console.error('Error deleting availability:', error)
    return apiError('Failed to delete availability', 500)
  }
}
