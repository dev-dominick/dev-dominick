import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate =
      searchParams.get("startDate") || new Date().toISOString().split("T")[0];
    const days = parseInt(searchParams.get("days") || "7");

    const slots = [];
    const start = new Date(startDate);

    // preload availability by day
    const availability = await prisma.availability.findMany({
      where: { isActive: true },
    });

    const appointmentWindowEnd = new Date(start);
    appointmentWindowEnd.setDate(appointmentWindowEnd.getDate() + days);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        startTime: { gte: start },
        endTime: { lte: appointmentWindowEnd },
        status: { in: ["scheduled", "confirmed", "pending"] },
      },
      select: { startTime: true, endTime: true },
    });

    for (let day = 0; day < days; day++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + day);

      const dateStr = currentDate.toISOString().split("T")[0];
      const dow = currentDate.getUTCDay();

      const dayAvailability = availability.filter((a) => a.dayOfWeek === dow);

      for (const window of dayAvailability) {
        const [startHour, startMinute] = window.startTime.split(":").map(Number);
        const [endHour, endMinute] = window.endTime.split(":").map(Number);

        const windowStart = new Date(currentDate);
        windowStart.setUTCHours(startHour, startMinute, 0, 0);
        const windowEnd = new Date(currentDate);
        windowEnd.setUTCHours(endHour, endMinute, 0, 0);

        for (
          let slotStart = new Date(windowStart);
          slotStart < windowEnd;
          slotStart = new Date(slotStart.getTime() + 60 * 60 * 1000)
        ) {
          const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
          if (slotEnd > windowEnd) break;

          const conflict = existingAppointments.some(
            (apt) => apt.startTime < slotEnd && apt.endTime > slotStart
          );

          slots.push({
            id: `${dateStr}-${slotStart.toISOString().substring(11, 16)}`,
            date: dateStr,
            time: slotStart.toISOString().substring(11, 16),
            available: !conflict,
            duration: 60,
          });
        }
      }
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch time slots" },
      { status: 500 }
    );
  }
}
