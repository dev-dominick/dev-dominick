import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail, appointmentConfirmationEmail } from "@/lib/email";
import { generalRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-utils";
import { apiSuccess, apiError, apiRateLimitError } from "@/lib/api-response";

const OWNER_USER_ID = process.env.ADMIN_USER_ID || "default-owner";

function parseStartEnd(date: string, time: string, durationMinutes = 60) {
  const start = new Date(`${date}T${time}`);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return { start, end };
}

async function slotIsAvailable(startTime: Date, endTime: Date) {
  // Ensure within availability window for that day
  const dayOfWeek = startTime.getUTCDay();
  const availability = await prisma.availability.findMany({
    where: { dayOfWeek, isActive: true },
  });

  const startHM = startTime.toISOString().substring(11, 16);
  const endHM = endTime.toISOString().substring(11, 16);
  const withinAvailability = availability.some((slot) => {
    return startHM >= slot.startTime && endHM <= slot.endTime;
  });

  if (!withinAvailability) return false;

  // Conflict check against existing appointments
  const conflict = await prisma.appointment.findFirst({
    where: {
      startTime: { lt: endTime },
      endTime: { gt: startTime },
      status: { in: ["scheduled", "confirmed", "pending"] },
    },
    select: { id: true },
  });

  return !conflict;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    if (sessionId) {
      const appointment = await prisma.appointment.findFirst({
        where: { id: sessionId },
      });
      return apiSuccess({ appointment });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        startTime: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
        status: status ? status : undefined,
      },
      orderBy: { startTime: "asc" },
    });

    return apiSuccess({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return apiError("Failed to fetch appointments", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = generalRateLimiter.check(`appointments:create:${ip}`);
    if (!rl.allowed) {
      return apiRateLimitError(
        "Too many requests. Please try again later.",
        rl.remaining,
        rl.resetAt
      );
    }

    const body = await request.json();
    const {
      date,
      time,
      startTime: isoStart,
      durationMinutes = 30,
      name,
      email,
      notes,
      consultationType = "free",
      consultationSource = "landing",
    } = body;

    if (!date || !time || !name || !email) {
      return apiError("Missing required fields", 400);
    }

    const { start: startTime, end: endTime } = isoStart
      ? (() => {
          const start = new Date(isoStart);
          const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
          return { start, end };
        })()
      : parseStartEnd(date, time, durationMinutes);

    const available = await slotIsAvailable(startTime, endTime);
    if (!available) {
      return apiError("Time slot is no longer available", 409);
    }

    const sessionToken = randomUUID();

    // All consultations require admin approval before client can join
    const appointment = await prisma.appointment.create({
      data: {
        clientName: name,
        clientEmail: email,
        startTime,
        endTime,
        duration: durationMinutes,
        notes: notes || null,
        status: "pending_approval",
        sessionToken,
        userId: OWNER_USER_ID,
        billableHours: durationMinutes / 60,
        consultationType,
        consultationSource,
        requiresApproval: true,
        isApproved: false,
      },
    });

    if (!appointment) {
      return apiError("Failed to create appointment", 500);
    }

    // Send confirmation email to client
    const emailHtml = appointmentConfirmationEmail({
      clientName: name,
      startTime,
      duration: durationMinutes,
      notes: notes || undefined,
      isAwaitingApproval: true,
      consultationType,
    });

    const emailResult = await sendEmail({
      to: email,
      subject:
        consultationType === "free"
          ? "Free consultation booked – awaiting confirmation 📅"
          : "$50 Consultation added to your booking 📅",
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.warn("Failed to send confirmation email:", emailResult.error);
    }

    // TODO: Send admin notification email about new consultation to approve

    return apiSuccess(
      {
        success: true,
        appointment: {
          id: appointment.id,
          clientName: appointment.clientName,
          clientEmail: appointment.clientEmail,
          startTime: appointment.startTime,
          consultationType: appointment.consultationType,
        },
      },
      201
    );
  } catch (error) {
    console.error("Error creating appointment:", error);
    return apiError("Failed to create appointment", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = generalRateLimiter.check(`appointments:update:${ip}`);
    if (!rl.allowed) {
      return apiRateLimitError(
        "Too many requests. Please try again later.",
        rl.remaining,
        rl.resetAt
      );
    }

    const body = await request.json();
    const { id, status, billableHours, workNotes, notes } = body;

    if (!id) {
      return apiError("Missing appointment id", 400);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: status || undefined,
        billableHours: billableHours ?? undefined,
        workNotes: workNotes ?? undefined,
        notes: notes ?? undefined,
      },
    });

    return apiSuccess({ appointment: updated, success: true });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return apiError("Failed to update appointment", 500);
  }
}
