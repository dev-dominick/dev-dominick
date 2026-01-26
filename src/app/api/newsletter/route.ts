import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, newsletterWelcomeEmail } from "@/lib/email";
import { generalRateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-utils";
import { apiSuccess, apiError, apiRateLimitError } from "@/lib/api-response";
import { validators } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = generalRateLimiter.check(`newsletter:subscribe:${ip}`);
    if (!rl.allowed) {
      return apiRateLimitError(
        "Too many requests. Please try again later.",
        rl.remaining,
        rl.resetAt
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return apiError("Email is required", 400);
    }

    // Validate email format
    try {
      validators.email(email, "Email");
    } catch (error) {
      return apiError("Invalid email address", 400);
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.status === "active") {
        return apiError("Already subscribed", 409);
      }
      // Reactivate unsubscribed user
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          status: "active",
          unsubscribedAt: null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new subscriber
      await prisma.newsletterSubscriber.create({
        data: {
          email,
          status: "active",
        },
      });
    }

    // Send welcome email
    const emailHtml = newsletterWelcomeEmail({ email });
    const emailResult = await sendEmail({
      to: email,
      subject: "Welcome to the newsletter! 🎯",
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.warn("Failed to send welcome email:", emailResult.error);
    }

    return apiSuccess(
      {
        success: true,
        message: "Successfully subscribed to newsletter",
      },
      201
    );
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return apiError("Failed to subscribe to newsletter", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require dev admin mode - this endpoint could enable email enumeration
    const isDevAdmin = process.env.NODE_ENV === 'development' && 
      request.cookies.get('dev_admin_mode')?.value === 'true'
    
    if (!isDevAdmin) {
      return apiError('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return apiError("Email is required", 400);
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      return apiError("Subscriber not found", 404);
    }

    return apiSuccess({ subscriber });
  } catch (error) {
    console.error("Error fetching subscriber:", error);
    return apiError("Failed to fetch subscriber", 500);
  }
}
