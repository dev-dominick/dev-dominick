import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  sendEmail,
  appointmentConfirmationEmail,
  appointmentAdminNotificationEmail,
  appointmentApprovedEmail,
  appointmentRejectedEmail,
} from "@/lib/email";
import { generalRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-utils";
import { apiSuccess, apiError, apiRateLimitError } from "@/lib/api-response";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

/**
 * Generate a Jitsi Meet link for the appointment
 * Both parties can click to join - no account needed
 */
function generateMeetingLink(appointmentId: string): string {
  // Create a unique room name using appointment ID
  const roomName = `dev-dominick-${appointmentId}`;
  return `https://meet.jit.si/${roomName}`;
}

function parseStartEnd(date: string, time: string, durationMinutes = 60) {
  // Treat the selected date/time as UTC to match availability storage
  const start = new Date(`${date}T${time}:00.000Z`);
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
      status: { in: ["pending_approval", "confirmed"] },
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
      website, // Honeypot field - should be empty
    } = body;

    // Honeypot spam check - bots fill this hidden field
    if (website) {
      // Silently reject but return success to confuse bots
      return apiSuccess({ success: true, appointment: { id: "blocked" } }, 201);
    }

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

    // Create appointment - NO userId for guest bookings
    // userId is nullable, only set if an authenticated user books
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
        billableHours: durationMinutes / 60,
        consultationType,
        consultationSource,
        // userId intentionally omitted for guest bookings
      },
    });

    if (!appointment) {
      return apiError("Failed to create appointment", 500);
    }

    // Send confirmation email to client (non-blocking, log errors)
    try {
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
        console.warn("Failed to send client confirmation email:", emailResult.error);
      }
    } catch (emailError) {
      console.error("Client email sending failed:", emailError);
      // Don't fail the booking due to email issues
    }

    // Send admin notification email (non-blocking)
    try {
      if (ADMIN_EMAIL) {
        const adminEmailHtml = appointmentAdminNotificationEmail({
          clientName: name,
          clientEmail: email,
          startTime,
          duration: durationMinutes,
          notes: notes || undefined,
          consultationType,
          appointmentId: appointment.id,
        });

        const adminEmailResult = await sendEmail({
          to: ADMIN_EMAIL,
          subject: `🔔 New booking request from ${name}`,
          html: adminEmailHtml,
        });

        if (!adminEmailResult.success) {
          console.warn("Failed to send admin notification email:", adminEmailResult.error);
        }
      } else {
        console.warn("ADMIN_EMAIL not configured - skipping admin notification");
      }
    } catch (adminEmailError) {
      console.error("Admin email sending failed:", adminEmailError);
      // Don't fail the booking due to email issues
    }

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
    const { id, status, billableHours, workNotes, notes, rejectionReason } = body;

    if (!id) {
      return apiError("Missing appointment id", 400);
    }

    // Fetch existing appointment to detect status transitions
    const existing = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existing) {
      return apiError("Appointment not found", 404);
    }

    const oldStatus = existing.status;
    const newStatus = status || oldStatus;

    // Build update data
    const updateData: Record<string, unknown> = {
      status: status || undefined,
      billableHours: billableHours ?? undefined,
      workNotes: workNotes ?? undefined,
      notes: notes ?? undefined,
    };

    // Handle approval - generate meeting link and set timestamp
    if (newStatus === "confirmed" && oldStatus === "pending_approval") {
      const meetingLink = generateMeetingLink(id);
      updateData.approvedAt = new Date();
      updateData.meetingLink = meetingLink;
      updateData.meetingType = "jitsi";
    }

    // Handle rejection - set timestamp
    if (newStatus === "cancelled" && oldStatus === "pending_approval") {
      updateData.rejectedAt = new Date();
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    // Send decision emails only on status transitions from pending_approval
    if (oldStatus === "pending_approval" && newStatus !== oldStatus) {
      try {
        if (newStatus === "confirmed") {
          // Send approval email with meeting link
          const meetingLink = updated.meetingLink || generateMeetingLink(id);
          const approvedEmailHtml = appointmentApprovedEmail({
            clientName: updated.clientName,
            startTime: updated.startTime,
            duration: updated.duration,
            meetingLink,
          });

          const result = await sendEmail({
            to: updated.clientEmail,
            subject: "✅ Your consultation is confirmed!",
            html: approvedEmailHtml,
          });

          if (!result.success) {
            console.warn("Failed to send approval email:", result.error);
          }
        } else if (newStatus === "cancelled") {
          // Send rejection email
          const rejectedEmailHtml = appointmentRejectedEmail({
            clientName: updated.clientName,
            startTime: updated.startTime,
            reason: rejectionReason,
          });

          const result = await sendEmail({
            to: updated.clientEmail,
            subject: "Booking update - Unable to accommodate your request",
            html: rejectedEmailHtml,
          });

          if (!result.success) {
            console.warn("Failed to send rejection email:", result.error);
          }
        }
      } catch (emailError) {
        console.error("Decision email sending failed:", emailError);
        // Don't fail the update due to email issues
      }
    }

    return apiSuccess({ appointment: updated, success: true });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return apiError("Failed to update appointment", 500);
  }
}
