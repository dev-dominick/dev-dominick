import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// This will connect to your Prisma database
// import { prisma } from '@/lib/prisma';

interface Appointment {
  id: string;
  sessionId: string;
  scheduledTime: string;
  clientName: string;
  clientEmail: string;
  notes?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: string;
  sessionToken: string;
}

// In-memory store (replace with database)
const appointments: Appointment[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // TODO: Replace with actual Prisma query
    // const appointments = await prisma.appointment.findMany({
    //     where: {
    //         sessionId: sessionId || undefined,
    //         scheduledTime: {
    //             gte: startDate ? new Date(startDate) : undefined,
    //             lte: endDate ? new Date(endDate) : undefined
    //         }
    //     }
    // });

    let filteredAppointments = appointments;

    if (sessionId) {
      const appointment = appointments.find(a => a.sessionId === sessionId);
      return NextResponse.json({ appointment });
    }

    if (startDate) {
      filteredAppointments = filteredAppointments.filter(
        a => new Date(a.scheduledTime) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredAppointments = filteredAppointments.filter(
        a => new Date(a.scheduledTime) <= new Date(endDate)
      );
    }

    return NextResponse.json({ appointments: filteredAppointments });
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
    const { date, time, name, email, notes } = body;

    // Generate unique IDs
    const sessionId = randomUUID();
    const sessionToken = randomUUID();
    const appointmentId = randomUUID();

    const scheduledTime = new Date(`${date}T${time}`);

    // TODO: Replace with actual Prisma transaction
    // const appointment = await prisma.appointment.create({
    //     data: {
    //         sessionId,
    //         sessionToken,
    //         clientEmail: email,
    //         clientName: name,
    //         scheduledTime,
    //         duration: 60, // default 1 hour
    //         status: 'upcoming',
    //         notes: notes || '',
    //     }
    // });

    const appointment: Appointment = {
      id: appointmentId,
      sessionId,
      sessionToken,
      clientName: name,
      clientEmail: email,
      scheduledTime: scheduledTime.toISOString(),
      notes: notes || '',
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };

    // Store in memory (replace with DB)
    appointments.push(appointment);

    // TODO: Send email with magic link
    // const magicLink = `${process.env.NEXTAUTH_URL}/app/sessions/${sessionId}?token=${sessionToken}`;
    // await sendEmail({
    //   to: email,
    //   subject: 'Your Session is Confirmed',
    //   html: `
    //     <h1>Session Confirmed</h1>
    //     <p>Hi ${name},</p>
    //     <p>Your session is scheduled for ${scheduledTime.toLocaleString()}</p>
    //     <p><a href="${magicLink}">Join Session</a></p>
    //   `
    // });

    console.log(`📧 Magic link for ${email}: /app/sessions/${sessionId}?token=${sessionToken}`);

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        sessionId: appointment.sessionId,
        scheduledTime: appointment.scheduledTime,
        clientName: appointment.clientName,
        clientEmail: appointment.clientEmail,
      },
      // Return magic link for testing (remove in production)
      magicLink: `/app/sessions/${sessionId}?token=${sessionToken}`,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
