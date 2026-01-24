import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api-response'

export async function GET() {
  try {
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
