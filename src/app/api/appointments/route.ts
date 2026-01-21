import { NextRequest, NextResponse } from "next/server";

// This will connect to your Prisma database
// import { prisma } from '@/lib/prisma';

interface Appointment {
  id: string;
  datetime: Date;
  clientName: string;
  service: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // TODO: Replace with actual Prisma query
    // const appointments = await prisma.appointment.findMany({
    //     where: {
    //         datetime: {
    //             gte: startDate ? new Date(startDate) : undefined,
    //             lte: endDate ? new Date(endDate) : undefined
    //         }
    //     }
    // });

    // Mock data for now
    const appointments: Appointment[] = [];

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, time, name, email } = body;

    // TODO: Replace with actual Prisma transaction
    // const appointment = await prisma.appointment.create({
    //     data: {
    //         customerEmail: email,
    //         customerName: name,
    //         datetime: new Date(`${date}T${time}`),
    //         duration: 60, // default 1 hour
    //         status: 'confirmed',
    //         notes: notes || '',
    //         // Connect to client via clientId from env or session
    //     }
    // });

    // Mock response for now
    const appointment = {
      id: "mock-" + Date.now(),
      customerEmail: email,
      customerName: name,
      datetime: `${date}T${time}`,
      status: "confirmed",
    };

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
