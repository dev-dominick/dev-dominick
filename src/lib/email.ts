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
  from = `noreply@${process.env.NEXT_PUBLIC_APP_DOMAIN || 'dev-dominick.com'}`,
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

  const consultationLabel = consultationType === 'free' ? 'Free Discovery Call' : '$50 Consultation'

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #00ff00 0%, #00cc00 100%); color: #000; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background: #f5f5f5; padding: 30px 20px; border-radius: 0 0 8px 8px; }
      .details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #00ff00; }
      .button { display: inline-block; background: #00ff00; color: #000; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; margin-top: 10px; }
      .footer { color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
      .status-box { background: #fff3cd; border: 1px solid #ffc107; color: #856404; padding: 12px; border-radius: 4px; margin: 15px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>${consultationLabel} Confirmed! 🎯</h1>
      </div>
      <div class="content">
        <p>Hi ${clientName},</p>
        <p>Your ${consultationLabel.toLowerCase()} has been scheduled. Here are the details:</p>
        
        <div class="details">
          <strong>📅 Date & Time:</strong><br>${timeStr}<br>
          <strong>⏱️ Duration:</strong> ${duration} minutes<br>
          ${notes ? `<strong>📝 Notes:</strong><br>${notes}<br>` : ''}
        </div>

        ${
          isAwaitingApproval
            ? `<div class="status-box">
          <strong>⏳ Awaiting Confirmation</strong><br>
          I'll review your request and send you the call details within 1 hour (business hours). You'll receive a follow-up email with the Zoom/call link.
        </div>`
            : ''
        }
        
        ${
          sessionLink && !isAwaitingApproval
            ? `<p><strong>Ready to start?</strong></p>
        <a href="${sessionLink}" class="button">Join Call</a>
        
        <p style="color: #666; font-size: 14px;">
          Or copy this link: <br>
          <code style="background: #f0f0f0; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 5px;">${sessionLink}</code>
        </p>`
            : ''
        }
        
        <p>If you need to reschedule, just reply to this email with your availability.</p>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email directly.</p>
          <p>&copy; 2026 Dominick's Portfolio. All rights reserved.</p>
        </div>
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
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); color: #00ff41; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
      .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
      .section { margin: 20px 0; }
      .button { display: inline-block; background: #00ff41; color: #000; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; }
      .footer { color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome! 🚀</h1>
        <p>You're now subscribed to updates</p>
      </div>
      <div class="content">
        <p>Hey there,</p>
        <p>Thanks for subscribing! You'll now get the latest updates, insights, and launches directly in your inbox.</p>
        
        <div class="section">
          <h3>What to expect:</h3>
          <ul>
            <li>💻 New templates & tools for builders</li>
            <li>📈 Growth strategies & case studies</li>
            <li>🎯 Exclusive offers & early access</li>
            <li>📚 Coaching tips & resources</li>
          </ul>
        </div>

        <div class="section">
          <p><a href="${process.env.NEXTAUTH_URL || 'https://dev-dominick.com'}/explore" class="button">Explore What I Offer</a></p>
        </div>

        <div class="footer">
          <p>Questions? <a href="mailto:${process.env.ADMIN_EMAIL}">Reach out anytime</a>.</p>
          <p>&copy; 2026 Dominick's Portfolio. All rights reserved.</p>
          <p><a href="${process.env.NEXTAUTH_URL || 'https://dev-dominick.com'}/unsubscribe?email=${email}">Unsubscribe</a></p>
        </div>
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

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #00ff00 0%, #00cc00 100%); color: #000; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background: #f5f5f5; padding: 30px 20px; border-radius: 0 0 8px 8px; }
      table { width: 100%; border-collapse: collapse; background: white; border-radius: 4px; overflow: hidden; }
      th { background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #00ff00; }
      td { padding: 10px; border-bottom: 1px solid #ddd; }
      .total { font-weight: bold; font-size: 18px; color: #00ff00; }
      .button { display: inline-block; background: #00ff00; color: #000; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; margin-top: 10px; }
      .footer { color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Order Confirmed! ✅</h1>
        <p>Order #${orderId}</p>
      </div>
      <div class="content">
        <p>Hi ${customerName},</p>
        <p>Thank you for your purchase! Your order has been processed successfully.</p>
        
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td style="text-align: right;">$${(item.price / 100).toFixed(2)}</td>
            </tr>
            `,
              )
              .join('')}
            <tr style="background: #f9f9f9;">
              <td colspan="2"><strong>Total</strong></td>
              <td style="text-align: right;" class="total">${totalStr}</td>
            </tr>
          </tbody>
        </table>
        
        ${
          downloadLinks.length > 0
            ? `
        <p><strong>📥 Your Downloads:</strong></p>
        <ul>
          ${downloadLinks.map((link) => `<li><a href="${link}">Download Product</a></li>`).join('')}
        </ul>
        `
            : ''
        }
        
        <p>You can view your full order history in your account dashboard.</p>
        
        <div class="footer">
          <p>Thank you for supporting my work!</p>
          <p>&copy; 2026 Dominick's Portfolio. All rights reserved.</p>
        </div>
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
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #00ff00 0%, #00cc00 100%); color: #000; padding: 20px; border-radius: 8px 8px 0 0; }
      .content { background: #f5f5f5; padding: 30px 20px; border-radius: 0 0 8px 8px; }
      .message-box { background: white; padding: 15px; border-left: 4px solid #00ff00; border-radius: 4px; margin: 15px 0; }
      .footer { color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Message Received 📧</h1>
      </div>
      <div class="content">
        <p>Hi ${senderName},</p>
        <p>Thanks for reaching out! I've received your message and will get back to you soon.</p>
        
        <div class="message-box">
          <p><strong>Your Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <p>I typically respond to inquiries within 24 hours. In the meantime, feel free to check out my portfolio or book a consultation session.</p>
        
        <div class="footer">
          <p>&copy; 2026 Dominick's Portfolio. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
</html>
  `
}
