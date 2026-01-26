import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, contactReplyEmail, escapeHtml, escapeHtmlWithLineBreaks } from '@/lib/email'
import { generalRateLimiter } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-utils'
import { apiSuccess, apiError, apiRateLimitError } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    // Basic rate limit by IP
    const ip = getClientIp(request)
    const rl = generalRateLimiter.check(`contact:${ip}`)
    if (!rl.allowed) {
      return apiRateLimitError(
        'Too many requests. Please try again later.',
        rl.remaining,
        rl.resetAt
      )
    }

    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !message) {
      return apiError('Missing required fields', 400)
    }

    // Save contact message to database
    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || 'Website Inquiry',
        message,
        status: 'new',
      },
    })

    if (!contact) {
      return apiError('Failed to save message', 500)
    }

    // Send auto-reply to client
    const autoReplyHtml = contactReplyEmail({
      senderName: name,
      message: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
    })

    await sendEmail({
      to: email,
      subject: 'We received your message 📧',
      html: autoReplyHtml,
    })

    // Send notification to admin (you)
    // SECURITY: Escape all user-provided content to prevent HTML injection
    const adminNotificationHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background: #f5f5f5; padding: 30px 20px; border-radius: 0 0 8px 8px; }
      .details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ff6b6b; }
      .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; margin-top: 10px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>New Lead 🎯</h1>
      </div>
      <div class="content">
        <div class="details">
          <strong>Name:</strong> ${escapeHtml(name)}<br>
          <strong>Email:</strong> ${escapeHtml(email)}<br>
          ${phone ? `<strong>Phone:</strong> ${escapeHtml(phone)}<br>` : ''}
          <strong>Subject:</strong> ${escapeHtml(subject || 'Website Inquiry')}<br>
        </div>
        
        <h3>Message:</h3>
        <p>${escapeHtmlWithLineBreaks(message)}</p>
        
        <a href="${process.env.NEXTAUTH_URL}/app/contact-messages/${contact.id}" class="button">View in Dashboard</a>
      </div>
    </div>
  </body>
</html>
    `

    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'support@dev-dominick.com',
      subject: `New Lead: ${name}`,
      html: adminNotificationHtml,
    })

    return apiSuccess({
      success: true,
      message: 'Your message has been sent successfully',
      id: contact.id,
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return apiError('Failed to submit contact form', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    // Auth check - only allow in dev mode with dev_admin_mode cookie
    const isDevAdmin = process.env.NODE_ENV === 'development' && 
      request.cookies.get('dev_admin_mode')?.value === 'true'
    
    if (!isDevAdmin) {
      // In production, require proper authentication
      // TODO: Add proper auth check when auth system is integrated
      return apiError('Unauthorized', 401)
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return apiSuccess({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return apiError('Failed to fetch messages', 500)
  }
}
