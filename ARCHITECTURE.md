# System Architecture - Full Launch Implementation

## Complete System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT INTERACTIONS                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Appointment Booking        Shop/E-Commerce        Contact Form          │
│  /appointments              /shop                  /contact              │
│       ↓                       ↓                       ↓                   │
│  Book time slot          Add to cart          Submit inquiry             │
│  With date/time          Select product       Share project details      │
│       ↓                       ↓                       ↓                   │
│  POST /api/              Stripe                  POST /api/              │
│  appointments            Checkout                contact                 │
│       ↓                       ↓                       ↓                   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      API & BACKEND LAYER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
│  │ /api/appointments    │  │ /api/webhooks/stripe │  │ /api/contact     │
│  ├──────────────────────┤  ├──────────────────────┤  ├──────────────────┤
│  │ • Create booking     │  │ • Receive payment    │  │ • Save message   │
│  │ • Save to DB         │  │ • Verify signature   │  │ • Send auto-reply│
│  │ • Send email         │  │ • Create order       │  │ • Notify admin   │
│  │ • Return session ID  │  │ • Send email         │  │ • Return success │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘
│                                                                           │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
│  │ /api/availability    │  │ /api/orders          │  │ /api/contact/:id │
│  ├──────────────────────┤  ├──────────────────────┤  ├──────────────────┤
│  │ • Add time slot      │  │ • Fetch orders       │  │ • Update status  │
│  │ • Delete time slot   │  │ • Filter by email    │  │ • Update message │
│  │ • List availability  │  │ • Return with items  │  └──────────────────┘
│  └──────────────────────┘  └──────────────────────┘                      │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    SERVICES & INTEGRATIONS                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Database (Prisma + PostgreSQL)                                          │
│  ────────────────────────────────────────────────────────────────────   │
│  ├─ appointments (id, clientName, clientEmail, startTime, endTime...)   │
│  ├─ products (id, name, price, category, stripePriceId...)             │
│  ├─ orders (id, stripeSessionId, total, status, items[])               │
│  ├─ contactMessages (id, name, email, message, status)                 │
│  ├─ availability (id, dayOfWeek, startTime, endTime, timezone)         │
│  ├─ users (id, email, password, loginAttempts, lockedUntil)            │
│  └─ emailLog (id, to, subject, type, status)                           │
│                                                                           │
│  Email Service (Resend)                                                  │
│  ────────────────────────────────────────────────────────────────────   │
│  ├─ Appointment confirmations (HTML template)                           │
│  ├─ Order receipts (with pricing breakdown)                             │
│  ├─ Contact auto-replies (acknowledgment)                               │
│  ├─ Admin notifications (new leads, purchases)                          │
│  └─ Password reset emails                                               │
│                                                                           │
│  Stripe Integration                                                      │
│  ────────────────────────────────────────────────────────────────────   │
│  ├─ Payment processing (Checkout Sessions)                              │
│  ├─ Webhook verification (signature check)                              │
│  ├─ Event handling (checkout.session.completed, charge.refunded)        │
│  └─ Refund tracking                                                      │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARDS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  /app/appointments                    /app/contact-messages              │
│  ├─ View all bookings               ├─ View all inquiries               │
│  ├─ Manage availability             ├─ Filter by status                 │
│  ├─ Add/remove time slots           ├─ Reply directly                   │
│  ├─ Track appointment status        ├─ Manage conversations             │
│  └─ Email clients                   └─ Track lead lifecycle             │
│                                                                           │
│  /app/invoices                       /app/page                          │
│  ├─ View all orders                 ├─ Dashboard home                   │
│  ├─ Filter by customer              ├─ Quick links                      │
│  ├─ See order details               ├─ Recent activity                  │
│  ├─ Download invoices               └─ Key metrics                      │
│  └─ Track revenue                                                        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      DATA FLOW EXAMPLES                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ APPOINTMENT BOOKING FLOW:                                                │
│ 1. Client fills form: name, email, date, time, notes                    │
│ 2. POST /api/appointments with form data                                │
│ 3. API creates Appointment in database                                   │
│ 4. Resend sends confirmation email to client                             │
│ 5. Confirmation email includes session link & details                    │
│ 6. Appointment appears in /app/appointments dashboard                    │
│ 7. Admin can manage availability to control future bookings              │
│                                                                           │
│ PAYMENT PROCESSING FLOW:                                                │
│ 1. Client adds product to cart and proceeds to checkout                  │
│ 2. Stripe Checkout Session created, customer redirected                  │
│ 3. Payment processed at Stripe                                           │
│ 4. Stripe webhook POST to /api/webhooks/stripe                           │
│ 5. API verifies signature and creates Order in database                  │
│ 6. Resend sends order confirmation email                                 │
│ 7. Order appears in /app/invoices with full details                      │
│ 8. Customer can view order history and download invoice                  │
│                                                                           │
│ CONTACT FORM FLOW:                                                       │
│ 1. Client submits contact form with inquiry                              │
│ 2. POST /api/contact with name, email, message                          │
│ 3. API saves ContactMessage in database                                  │
│ 4. Resend sends auto-reply to client                                     │
│ 5. Resend sends admin notification to you                                │
│ 6. Message appears in /app/contact-messages dashboard                    │
│ 7. You can reply directly from admin interface                           │
│ 8. Message status tracked (new → read → replied)                         │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Local Development (Your Machine)                                        │
│  ├─ npm run dev (localhost:3000)                                        │
│  ├─ PostgreSQL database (local)                                          │
│  ├─ Stripe test mode (card: 4242...)                                    │
│  └─ Resend sandbox API                                                   │
│                                                                           │
│                           ↓ git push ↓                                    │
│                                                                           │
│  Production (Vercel)                                                     │
│  ├─ Next.js app deployed globally                                        │
│  ├─ Vercel PostgreSQL (cloud database)                                   │
│  ├─ Stripe live mode (real payments)                                    │
│  ├─ Resend live API (real emails)                                        │
│  ├─ Webhook endpoint: https://yourdomain.com/api/webhooks/stripe         │
│  └─ Custom domain with SSL                                               │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION & SECURITY                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  NextAuth.js                                                             │
│  ├─ User signup (/signup)                                               │
│  ├─ User login (/login) with rate limiting (5 attempts → 30min lockout) │
│  ├─ Password hashing (bcryptjs)                                         │
│  ├─ JWT sessions (30-day expiry)                                         │
│  ├─ httpOnly cookies (secure)                                           │
│  └─ Forgot password & reset flows                                        │
│                                                                           │
│  Protected Routes                                                        │
│  ├─ /app/* (requires authentication)                                    │
│  ├─ /admin/* (requires authentication)                                  │
│  ├─ /api/appointments (public create, auth view)                        │
│  ├─ /api/contact (public)                                               │
│  └─ /api/webhooks/* (signature verification)                            │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                     ENVIRONMENT VARIABLES                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Core (NextAuth):                                                        │
│  • NEXTAUTH_SECRET (random key for session encryption)                   │
│  • NEXTAUTH_URL (your domain URL)                                        │
│                                                                           │
│  Database:                                                               │
│  • DATABASE_URL (PostgreSQL connection string)                           │
│                                                                           │
│  Email Service (Resend):                                                 │
│  • RESEND_API_KEY (authentication key)                                   │
│  • NEXT_PUBLIC_APP_DOMAIN (for email "from" address)                     │
│  • ADMIN_EMAIL (your email for admin notifications)                      │
│                                                                           │
│  Stripe:                                                                 │
│  • STRIPE_SECRET_KEY (backend payments)                                  │
│  • NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (frontend)                         │
│  • STRIPE_WEBHOOK_SECRET (webhook signature verification)                │
│  • NEXT_PUBLIC_PRICE_* (product price IDs)                              │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## System Features Summary

### Scalability
- ✅ Handles unlimited appointments
- ✅ Unlimited product inventory
- ✅ Unlimited orders and invoices
- ✅ Supports multiple timezones

### Reliability
- ✅ Database persistence (nothing lost on restart)
- ✅ Email retry logic
- ✅ Webhook signature verification
- ✅ Error logging and tracking

### User Experience
- ✅ Instant confirmations (via email)
- ✅ No double-bookings (availability checking)
- ✅ Professional communications (HTML templates)
- ✅ Seamless workflows (integrated systems)

### Business Value
- ✅ Automatic client communication
- ✅ Revenue tracking (all orders logged)
- ✅ Lead management (all inquiries tracked)
- ✅ Time savings (no manual email sending)

---

## Ready to Deploy

All systems are implemented and tested. Follow `START_HERE.md` to get live with clients.
