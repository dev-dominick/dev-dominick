import { Resend } from 'resend'

// Lazy initialize Resend to avoid build errors when API key is not set
let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('RESEND_API_KEY not configured. Email sending will fail at runtime.')
      // Return a dummy instance to prevent errors during build
      return new Resend('re_placeholder')
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  from = `Dominick <info@${process.env.NEXT_PUBLIC_APP_DOMAIN || 'dev-dominick.com'}>`,
}: EmailOptions) {
  try {
    const resend = getResend()
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    if (response.error) {
      console.error('Resend error:', response.error)
      return { success: false, error: response.error }
    }

    return { success: true, messageId: response.data?.id }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

// Email templates

export function appointmentConfirmationEmail({
  clientName,
  startTime,
  duration,
  notes,
  sessionLink,
  isAwaitingApproval,
  consultationType,
}: {
  clientName: string
  startTime: Date
  duration: number
  notes?: string
  sessionLink?: string
  isAwaitingApproval?: boolean
  consultationType?: string
}) {
  const timeStr = startTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const consultationLabel = consultationType === 'free' ? 'Free Discovery Call' : 'Paid Consultation'
  const baseUrl = process.env.NEXTAUTH_URL || 'https://dev-dominick.com'

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #0a0a0a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      
      <!-- Logo/Brand -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 24px; font-weight: 700; color: #00ff41; letter-spacing: -0.5px;">dev-dominick</span>
      </div>
      
      <!-- Main Card -->
      <div style="background: linear-gradient(180deg, #111111 0%, #0d0d0d 100%); border: 1px solid #222; border-radius: 16px; overflow: hidden;">
        
        <!-- Header -->
        <div style="padding: 30px; text-align: center; border-bottom: 1px solid #222;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">
            ${isAwaitingApproval ? 'Booking Received' : 'You\'re All Set!'} ✨
          </h1>
          <p style="margin: 10px 0 0 0; color: #888; font-size: 14px;">${consultationLabel}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="color: #ccc; font-size: 16px; margin: 0 0 25px 0; line-height: 1.6;">
            Hey ${clientName},<br><br>
            ${isAwaitingApproval 
              ? 'Thanks for booking! I\'ll review your request and get back to you shortly with the meeting details.'
              : 'Your consultation is confirmed. Here\'s everything you need to know:'}
          </p>
          
          <!-- Details Box -->
          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <div style="display: flex; margin-bottom: 15px;">
              <span style="color: #00ff41; font-size: 18px; margin-right: 12px;">📅</span>
              <div>
                <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</p>
                <p style="margin: 4px 0 0 0; color: #fff; font-size: 15px;">${timeStr}</p>
              </div>
            </div>
            <div style="display: flex; margin-bottom: ${notes ? '15px' : '0'};">
              <span style="color: #00ff41; font-size: 18px; margin-right: 12px;">⏱️</span>
              <div>
                <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Duration</p>
                <p style="margin: 4px 0 0 0; color: #fff; font-size: 15px;">${duration} minutes</p>
              </div>
            </div>
            ${notes ? `
            <div style="display: flex;">
              <span style="color: #00ff41; font-size: 18px; margin-right: 12px;">📝</span>
              <div>
                <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Notes</p>
                <p style="margin: 4px 0 0 0; color: #fff; font-size: 15px;">${notes}</p>
              </div>
            </div>
            ` : ''}
          </div>

          ${isAwaitingApproval ? `
          <!-- Status Badge -->
          <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 10px; padding: 16px; margin-bottom: 25px;">
            <p style="margin: 0; color: #fbbf24; font-size: 14px; font-weight: 500;">
              ⏳ Awaiting Confirmation
            </p>
            <p style="margin: 8px 0 0 0; color: #999; font-size: 13px; line-height: 1.5;">
              I'll review your request and send you the meeting link within a few hours during business hours.
            </p>
          </div>
          ` : ''}
          
          ${sessionLink && !isAwaitingApproval ? `
          <!-- Join Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${sessionLink}" style="display: inline-block; background: #00ff41; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Join Call →
            </a>
            <p style="margin: 12px 0 0 0; color: #666; font-size: 12px;">
              or copy: <code style="background: #1a1a1a; padding: 4px 8px; border-radius: 4px; color: #888;">${sessionLink}</code>
            </p>
          </div>
          ` : ''}
          
          <!-- Help Text -->
          <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.6; text-align: center;">
            Need to reschedule? Just reply to this email.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding: 30px 20px;">
        <p style="margin: 0 0 10px 0; color: #444; font-size: 12px;">
          <a href="${baseUrl}" style="color: #00ff41; text-decoration: none;">dev-dominick.com</a>
        </p>
        <p style="margin: 0; color: #333; font-size: 11px;">
          © ${new Date().getFullYear()} Dominick. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
  `
}

export function newsletterWelcomeEmail({
  email,
}: {
  email: string
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://dev-dominick.com'
  
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #0a0a0a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      
      <!-- Logo/Brand -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 24px; font-weight: 700; color: #00ff41; letter-spacing: -0.5px;">dev-dominick</span>
      </div>
      
      <!-- Main Card -->
      <div style="background: linear-gradient(180deg, #111111 0%, #0d0d0d 100%); border: 1px solid #222; border-radius: 16px; overflow: hidden;">
        
        <!-- Header -->
        <div style="padding: 30px; text-align: center; border-bottom: 1px solid #222;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #ffffff;">
            You're In! 🚀
          </h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="color: #ccc; font-size: 16px; margin: 0 0 25px 0; line-height: 1.7;">
            Thanks for subscribing to my newsletter. You'll get updates on new projects, tools, and insights delivered straight to your inbox.
          </p>
          
          <!-- What to expect -->
          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0 0 15px 0; color: #fff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">What to expect</p>
            <div style="color: #999; font-size: 14px; line-height: 2;">
              <div>💻 New templates & tools</div>
              <div>📈 Growth strategies</div>
              <div>🎯 Exclusive early access</div>
              <div>📚 Tech insights & tips</div>
            </div>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/explore" style="display: inline-block; background: #00ff41; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Explore My Work →
            </a>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding: 30px 20px;">
        <p style="margin: 0 0 10px 0; color: #444; font-size: 12px;">
          <a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}" style="color: #666; text-decoration: underline;">Unsubscribe</a>
          <span style="color: #333; margin: 0 8px;">•</span>
          <a href="${baseUrl}" style="color: #00ff41; text-decoration: none;">dev-dominick.com</a>
        </p>
        <p style="margin: 0; color: #333; font-size: 11px;">
          © ${new Date().getFullYear()} Dominick. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
  `
}

export function orderConfirmationEmail({
  customerName,
  orderId,
  items,
  total,
  downloadLinks,
}: {
  customerName: string
  orderId: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  downloadLinks: string[]
}) {
  const totalStr = (total / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
  const baseUrl = process.env.NEXTAUTH_URL || 'https://dev-dominick.com'

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #0a0a0a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      
      <!-- Logo/Brand -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 24px; font-weight: 700; color: #00ff41; letter-spacing: -0.5px;">dev-dominick</span>
      </div>
      
      <!-- Main Card -->
      <div style="background: linear-gradient(180deg, #111111 0%, #0d0d0d 100%); border: 1px solid #222; border-radius: 16px; overflow: hidden;">
        
        <!-- Header -->
        <div style="padding: 30px; text-align: center; border-bottom: 1px solid #222;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">
            Order Confirmed! ✅
          </h1>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 13px;">Order #${orderId.slice(0, 8).toUpperCase()}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="color: #ccc; font-size: 16px; margin: 0 0 25px 0; line-height: 1.6;">
            Hey ${customerName},<br><br>
            Thanks for your purchase! Here's your order summary:
          </p>
          
          <!-- Order Items -->
          <div style="background: #1a1a1a; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
            ${items.map((item, i) => `
            <div style="padding: 15px 20px; ${i < items.length - 1 ? 'border-bottom: 1px solid #2a2a2a;' : ''}">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <p style="margin: 0; color: #fff; font-size: 15px; font-weight: 500;">${item.name}</p>
                  <p style="margin: 4px 0 0 0; color: #666; font-size: 13px;">Qty: ${item.quantity}</p>
                </div>
                <p style="margin: 0; color: #00ff41; font-size: 15px; font-weight: 600;">$${(item.price / 100).toFixed(2)}</p>
              </div>
            </div>
            `).join('')}
            
            <!-- Total -->
            <div style="padding: 15px 20px; background: #0d0d0d; border-top: 1px solid #333;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <p style="margin: 0; color: #888; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Total</p>
                <p style="margin: 0; color: #00ff41; font-size: 20px; font-weight: 700;">${totalStr}</p>
              </div>
            </div>
          </div>
          
          ${downloadLinks.length > 0 ? `
          <!-- Download Section -->
          <div style="background: rgba(0, 255, 65, 0.1); border: 1px solid rgba(0, 255, 65, 0.3); border-radius: 10px; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0 0 15px 0; color: #00ff41; font-size: 14px; font-weight: 600;">📥 Your Downloads</p>
            ${downloadLinks.map((link) => `
            <a href="${link}" style="display: block; background: #00ff41; color: #000; padding: 12px 16px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; text-align: center; margin-bottom: 8px;">
              Download →
            </a>
            `).join('')}
          </div>
          ` : ''}
          
          <!-- Help Text -->
          <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.6; text-align: center;">
            Questions about your order? Just reply to this email.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding: 30px 20px;">
        <p style="margin: 0 0 10px 0; color: #444; font-size: 12px;">
          <a href="${baseUrl}" style="color: #00ff41; text-decoration: none;">dev-dominick.com</a>
        </p>
        <p style="margin: 0; color: #333; font-size: 11px;">
          © ${new Date().getFullYear()} Dominick. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
  `
}

export function contactReplyEmail({
  senderName,
  message,
}: {
  senderName: string
  message: string
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://dev-dominick.com'
  
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #0a0a0a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      
      <!-- Logo/Brand -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 24px; font-weight: 700; color: #00ff41; letter-spacing: -0.5px;">dev-dominick</span>
      </div>
      
      <!-- Main Card -->
      <div style="background: linear-gradient(180deg, #111111 0%, #0d0d0d 100%); border: 1px solid #222; border-radius: 16px; overflow: hidden;">
        
        <!-- Header -->
        <div style="padding: 30px; text-align: center; border-bottom: 1px solid #222;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">
            Got Your Message! 📬
          </h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="color: #ccc; font-size: 16px; margin: 0 0 25px 0; line-height: 1.6;">
            Hey ${senderName},<br><br>
            Thanks for reaching out! I've received your message and will get back to you as soon as possible.
          </p>
          
          <!-- Message Quote -->
          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 3px solid #00ff41;">
            <p style="margin: 0 0 8px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Your Message</p>
            <p style="margin: 0; color: #ccc; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <!-- Response Time -->
          <div style="background: rgba(0, 255, 65, 0.1); border: 1px solid rgba(0, 255, 65, 0.2); border-radius: 10px; padding: 16px; margin-bottom: 25px; text-align: center;">
            <p style="margin: 0; color: #00ff41; font-size: 14px;">
              ⚡ I typically respond within 24 hours
            </p>
          </div>
          
          <!-- CTA -->
          <div style="text-align: center;">
            <a href="${baseUrl}/bookings" style="display: inline-block; background: #00ff41; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Book a Call Instead →
            </a>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding: 30px 20px;">
        <p style="margin: 0 0 10px 0; color: #444; font-size: 12px;">
          <a href="${baseUrl}" style="color: #00ff41; text-decoration: none;">dev-dominick.com</a>
        </p>
        <p style="margin: 0; color: #333; font-size: 11px;">
          © ${new Date().getFullYear()} Dominick. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
  `
}

export function appointmentAdminNotificationEmail({
  clientName,
  clientEmail,
  startTime,
  duration,
  notes,
  consultationType,
  appointmentId,
}: {
  clientName: string
  clientEmail: string
  startTime: Date
  duration: number
  notes?: string
  consultationType: string
  appointmentId: string
}) {
  const timeStr = startTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const baseUrl = process.env.NEXTAUTH_URL || 'https://dev-dominick.com'
  const adminUrl = `${baseUrl}/app/appointments`

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #0a0a0a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      
      <!-- Logo/Brand -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 24px; font-weight: 700; color: #00ff41; letter-spacing: -0.5px;">dev-dominick</span>
      </div>
      
      <!-- Main Card -->
      <div style="background: linear-gradient(180deg, #111111 0%, #0d0d0d 100%); border: 1px solid #222; border-radius: 16px; overflow: hidden;">
        
        <!-- Header -->
        <div style="padding: 30px; text-align: center; border-bottom: 1px solid #222; background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, transparent 100%);">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #fbbf24;">
            🔔 New Booking Request
          </h1>
          <p style="margin: 10px 0 0 0; color: #888; font-size: 14px;">
            ${consultationType === 'free' ? 'Free Discovery Call' : 'Paid Consultation'}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          
          <!-- Client Details -->
          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <div style="display: flex; margin-bottom: 15px;">
              <span style="color: #fbbf24; font-size: 18px; margin-right: 12px;">👤</span>
              <div>
                <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Client</p>
                <p style="margin: 4px 0 0 0; color: #fff; font-size: 15px;">${clientName}</p>
              </div>
            </div>
            <div style="display: flex; margin-bottom: 15px;">
              <span style="color: #fbbf24; font-size: 18px; margin-right: 12px;">📧</span>
              <div>
                <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                <a href="mailto:${clientEmail}" style="margin: 4px 0 0 0; color: #00ff41; font-size: 15px; text-decoration: none;">${clientEmail}</a>
              </div>
            </div>
            <div style="display: flex; margin-bottom: 15px;">
              <span style="color: #fbbf24; font-size: 18px; margin-right: 12px;">📅</span>
              <div>
                <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Requested Time</p>
                <p style="margin: 4px 0 0 0; color: #fff; font-size: 15px;">${timeStr}</p>
              </div>
            </div>
            <div style="display: flex; ${notes ? 'margin-bottom: 15px;' : ''}">
              <span style="color: #fbbf24; font-size: 18px; margin-right: 12px;">⏱️</span>
              <div>
                <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Duration</p>
                <p style="margin: 4px 0 0 0; color: #fff; font-size: 15px;">${duration} minutes</p>
              </div>
            </div>
            ${notes ? `
            <div style="display: flex;">
              <span style="color: #fbbf24; font-size: 18px; margin-right: 12px;">📝</span>
              <div>
                <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Notes</p>
                <p style="margin: 4px 0 0 0; color: #ccc; font-size: 14px; line-height: 1.5;">${notes}</p>
              </div>
            </div>
            ` : ''}
          </div>
          
          <!-- Action Required -->
          <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 10px; padding: 16px; margin-bottom: 25px; text-align: center;">
            <p style="margin: 0; color: #fbbf24; font-size: 14px; font-weight: 500;">
              ⚡ Action Required: Review and approve or reject
            </p>
          </div>
          
          <!-- CTA -->
          <div style="text-align: center;">
            <a href="${adminUrl}" style="display: inline-block; background: #fbbf24; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Open Dashboard →
            </a>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding: 30px 20px;">
        <p style="margin: 0 0 10px 0; color: #444; font-size: 12px;">
          Appointment ID: ${appointmentId.slice(0, 8)}
        </p>
        <p style="margin: 0; color: #333; font-size: 11px;">
          This is an automated notification from your booking system.
        </p>
      </div>
    </div>
  </body>
</html>
  `
}

export function appointmentApprovedEmail({
  clientName,
  startTime,
  duration,
  meetingLink,
}: {
  clientName: string
  startTime: Date
  duration: number
  meetingLink: string
}) {
  const timeStr = startTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const baseUrl = process.env.NEXTAUTH_URL || 'https://dev-dominick.com'

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #0a0a0a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      
      <!-- Logo/Brand -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 24px; font-weight: 700; color: #00ff41; letter-spacing: -0.5px;">dev-dominick</span>
      </div>
      
      <!-- Main Card -->
      <div style="background: linear-gradient(180deg, #111111 0%, #0d0d0d 100%); border: 1px solid #222; border-radius: 16px; overflow: hidden;">
        
        <!-- Header -->
        <div style="padding: 30px; text-align: center; border-bottom: 1px solid #222;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #00ff41;">
            You're Confirmed! ✅
          </h1>
          <p style="margin: 10px 0 0 0; color: #888; font-size: 14px;">Your consultation is ready</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="color: #ccc; font-size: 16px; margin: 0 0 25px 0; line-height: 1.6;">
            Hey ${clientName},<br><br>
            Great news! Your consultation has been approved. Here's everything you need to join:
          </p>
          
          <!-- Details Box -->
          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <div style="display: flex; margin-bottom: 15px;">
              <span style="color: #00ff41; font-size: 18px; margin-right: 12px;">📅</span>
              <div>
                <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</p>
                <p style="margin: 4px 0 0 0; color: #fff; font-size: 15px;">${timeStr}</p>
              </div>
            </div>
            <div style="display: flex;">
              <span style="color: #00ff41; font-size: 18px; margin-right: 12px;">⏱️</span>
              <div>
                <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Duration</p>
                <p style="margin: 4px 0 0 0; color: #fff; font-size: 15px;">${duration} minutes</p>
              </div>
            </div>
          </div>

          <!-- Meeting Link Box -->
          <div style="background: rgba(0, 255, 65, 0.1); border: 2px solid rgba(0, 255, 65, 0.4); border-radius: 12px; padding: 25px; margin-bottom: 25px; text-align: center;">
            <p style="margin: 0 0 5px 0; color: #00ff41; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">📹 Video Call Link</p>
            <p style="margin: 0 0 20px 0; color: #888; font-size: 13px;">Click the button at your scheduled time</p>
            <a href="${meetingLink}" style="display: inline-block; background: #00ff41; color: #000; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
              Join Call →
            </a>
            <p style="margin: 15px 0 0 0; color: #666; font-size: 12px;">
              or copy: <code style="background: #1a1a1a; padding: 6px 10px; border-radius: 4px; color: #888; font-size: 11px;">${meetingLink}</code>
            </p>
          </div>

          <!-- Tips -->
          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <p style="margin: 0 0 12px 0; color: #fff; font-size: 14px; font-weight: 600;">💡 Tips for a great call</p>
            <div style="color: #999; font-size: 13px; line-height: 1.8;">
              <div>• Join a few minutes early to test audio/video</div>
              <div>• Find a quiet spot with good lighting</div>
              <div>• Have any questions or materials ready</div>
            </div>
          </div>
          
          <!-- Help Text -->
          <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.6; text-align: center;">
            Need to reschedule? Just reply to this email.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding: 30px 20px;">
        <p style="margin: 0 0 10px 0; color: #444; font-size: 12px;">
          <a href="${baseUrl}" style="color: #00ff41; text-decoration: none;">dev-dominick.com</a>
        </p>
        <p style="margin: 0; color: #333; font-size: 11px;">
          © ${new Date().getFullYear()} Dominick. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
  `
}

export function appointmentRejectedEmail({
  clientName,
  startTime,
  reason,
}: {
  clientName: string
  startTime: Date
  reason?: string
}) {
  const timeStr = startTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const baseUrl = process.env.NEXTAUTH_URL || 'https://dev-dominick.com'

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #0a0a0a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      
      <!-- Logo/Brand -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 24px; font-weight: 700; color: #00ff41; letter-spacing: -0.5px;">dev-dominick</span>
      </div>
      
      <!-- Main Card -->
      <div style="background: linear-gradient(180deg, #111111 0%, #0d0d0d 100%); border: 1px solid #222; border-radius: 16px; overflow: hidden;">
        
        <!-- Header -->
        <div style="padding: 30px; text-align: center; border-bottom: 1px solid #222;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">
            Booking Update
          </h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="color: #ccc; font-size: 16px; margin: 0 0 25px 0; line-height: 1.6;">
            Hey ${clientName},<br><br>
            Unfortunately, I'm unable to accommodate your consultation request for this time slot.
          </p>
          
          <!-- Original Request -->
          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <div style="display: flex;">
              <span style="color: #888; font-size: 18px; margin-right: 12px;">📅</span>
              <div>
                <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Requested Time</p>
                <p style="margin: 4px 0 0 0; color: #999; font-size: 15px; text-decoration: line-through;">${timeStr}</p>
              </div>
            </div>
          </div>

          ${reason ? `
          <!-- Reason -->
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 10px; padding: 16px; margin-bottom: 25px;">
            <p style="margin: 0; color: #ef4444; font-size: 13px; font-weight: 500;">Reason</p>
            <p style="margin: 8px 0 0 0; color: #ccc; font-size: 14px; line-height: 1.5;">${reason}</p>
          </div>
          ` : ''}

          <p style="color: #ccc; font-size: 15px; margin: 0 0 25px 0; line-height: 1.6;">
            This could be due to a scheduling conflict or limited availability. I apologize for any inconvenience.
          </p>
          
          <!-- CTA -->
          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; color: #888; font-size: 14px;">Would you like to try a different time?</p>
            <a href="${baseUrl}/bookings" style="display: inline-block; background: #00ff41; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Book Another Time →
            </a>
          </div>
          
          <!-- Help Text -->
          <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.6; text-align: center;">
            Or just reply to this email and we'll find a time that works.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; padding: 30px 20px;">
        <p style="margin: 0 0 10px 0; color: #444; font-size: 12px;">
          <a href="${baseUrl}" style="color: #00ff41; text-decoration: none;">dev-dominick.com</a>
        </p>
        <p style="margin: 0; color: #333; font-size: 11px;">
          © ${new Date().getFullYear()} Dominick. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
  `
}
