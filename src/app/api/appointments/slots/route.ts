import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate =
      searchParams.get("startDate") || new Date().toISOString().split("T")[0];
    const days = parseInt(searchParams.get("days") || "7");

    // TODO: Replace with actual Prisma query
    // 1. Get availability settings from database
    // const availability = await prisma.availability.findMany({
    //     where: { clientId: 'your-client-id', active: true }
    // });

    // 2. Get existing appointments to block times
    // const appointments = await prisma.appointment.findMany({
    //     where: {
    //         datetime: {
    //             gte: new Date(startDate),
    //             lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    //         }
    //     }
    // });

    // Mock availability logic - Business hours 9 AM - 5 PM, 1-hour slots
    const slots = [];
    const start = new Date(startDate);

    for (let day = 0; day < days; day++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + day);

      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        continue;
      }

      const dateStr = currentDate.toISOString().split("T")[0];

      // Generate hourly slots from 9 AM to 5 PM
      for (let hour = 9; hour < 17; hour++) {
        const timeStr = `${hour.toString().padStart(2, "0")}:00`;

        slots.push({
          id: `${dateStr}-${timeStr}`,
          date: dateStr,
          time: timeStr,
          available: true, // In real app, check against existing appointments
          duration: 60,
        });
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
