# Copilot Instructions for dev-dominick

This is a **Next.js 16 full-stack application** with a portfolio, appointment booking, e-commerce shop, and admin dashboards. It's designed for **production client acquisition** with database persistence, email automation, and payment processing.

## Architecture Overview

### Three Integrated Systems
1. **Appointment Booking** (`/api/appointments`) - Clients schedule 1-on-1 sessions with availability checking
2. **E-Commerce Shop** (`/api/checkout`, Stripe integration) - Sell digital products with order tracking
3. **Contact Forms** (`/api/contact`) - Lead capture with admin notifications

### Tech Stack
- **Framework**: Next.js 16 (App Router with Server Components)
- **Database**: PostgreSQL + Prisma ORM (`@prisma/client@^6.19.2`)
- **Auth**: NextAuth.js 4 with JWT sessions and bcrypt hashing
- **Payments**: Stripe (`^20.2.0`) with webhook signature verification
- **Email**: Resend (`^6.8.0`) with HTML templates
- **UI**: Tailwind CSS 4 + Radix UI components + Lucide icons
- **Real-time**: Socket.IO for live features
- **Validation**: Zod for form schemas
- **Rate Limiting**: In-memory limiter (Redis recommended for production)

### Path Aliases (tsconfig.json)
```
@/* → src/*
@/components/* → src/components/*
@/lib/* → src/lib/*
@/hooks/* → src/hooks/*
@/contexts/* → src/contexts/*
@/types/* → src/types/*
```

## Key Patterns & Conventions

### API Route Structure
- All routes are **App Router format** (`src/app/api/*/route.ts`)
- Each route exports `GET`, `POST`, `PATCH`, `DELETE` functions separately
- Use standardized response helpers from `@/lib/api-response.ts`:
  - `apiSuccess(data)` - for successful responses
  - `apiError(message, statusCode)` - for error responses
  - `apiRateLimitError(message, remaining, resetAtMs)` - for rate limit responses
- Validate with `ValidationError` from `@/lib/errors` for field-level validation
- Use rate limiters: `generalRateLimiter`, `loginRateLimiter`, `signupRateLimiter`
- Extract IP address with `getClientIp(request)` from `@/lib/request-utils.ts`

### Error Handling
- Import `ApiError` and `ValidationError` from `@/lib/errors`
- Use `getErrorMessage(error)` utility for consistent error formatting
- Check network errors with `isNetworkError()` and `isTimeoutError()`
- All API errors return JSON with `{ error: string }` or `{ status: number }`

### Database & Prisma
- Prisma client imported as: `import { prisma } from '@/lib/prisma'`
- **Direct singleton export** - errors propagate naturally, no silent failures
- Use `prisma.appointment`, `prisma.order`, `prisma.product`, `prisma.contactMessage`, `prisma.availability`
- Common queries: `findFirst()`, `findMany()`, `create()`, `update()`, `delete()`
- Availability model tracks `dayOfWeek` (0-6, UTC), `startTime`/`endTime` (HH:MM format), `isActive` boolean

### Email Sending
- Import from `@/lib/email`: `sendEmail()` and template functions like `appointmentConfirmationEmail()`
- Always await: `await sendEmail({ to, subject, html, from? })`
- Email domain from env: `process.env.NEXT_PUBLIC_APP_DOMAIN` (default: 'dev-dominick.com')
- Admin notifications go to: `process.env.ADMIN_EMAIL`
- Templates return HTML strings with inline CSS (no external stylesheets)
- Resend handles on error gracefully: `response.error` indicates failure

### Authentication
- **Next.js Middleware** (`src/middleware.ts`) protects routes:
  - Public: `/maintenance`, `/api/auth`, `/_next`, static files
  - Auth-only (redirect if logged in): `/login`, `/signup`, `/forgot-password`, `/reset-password`
  - Protected: `/app/*` (require authentication)
- Get session: `import { getServerSession } from "next-auth"`
- Check token: `const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })`
- Login attempts limited to 5 per 15 minutes (auto-lockout for 30 min)

### Stripe Integration
- **Use singleton** from `@/lib/stripe.ts`: `import { stripe } from '@/lib/stripe'`
- **Webhook verification**: Signature must be validated with `stripe.webhooks.constructEvent(body, sig, webhookSecret)`
- **Idempotent order creation**: Check `prisma.order.findUnique({ where: { stripeSessionId } })` before creating
- Event types handled: `checkout.session.completed`, `charge.refunded`
- Line items: Retrieve with `expand: ["line_items"]` in session lookup
- Prices stored in env as `NEXT_PUBLIC_PRICE_*` constants

### Component Patterns
- **Server Components** by default (async-capable, direct DB/API access)
- **Client Components** marked with `'use client'` (interactivity, hooks, state)
- Layout wrapper: `src/components/app-shell/AppShellClient` wraps `/app/*` routes
- Forms use React Hook Form with Zod schemas
- UI components in `src/components/ui/` (Radix UI + Tailwind)
- Template components in `src/components/templates/`

### Validation
- Import validators from `@/lib/validators`: `email()`, `required()`, `minLength()`, `maxLength()`, `positive()`, `futureDate()`, etc.
- Throw `ValidationError(fieldName, message)` when validation fails
- API routes catch and return: `{ error: message, status: 400 }`

## Developer Workflows

### Local Development
```bash
npm run dev              # Start dev server on localhost:3000
npx prisma migrate dev  # Create/apply migrations
npm run db:seed         # Seed database with test data
npm run stripe:sync     # Sync products from Stripe catalog
npm run lint            # Run ESLint
```

### Environment Setup
Create `.env.local` with:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for JWT (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your app domain
- `RESEND_API_KEY` - Email service key
- `NEXT_PUBLIC_APP_DOMAIN` - Domain for email "from" addresses
- `ADMIN_EMAIL` - Your email for admin notifications
- `STRIPE_SECRET_KEY` - Stripe backend key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe frontend key
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification key
- `ADMIN_USER_ID` - Your user ID (defaults to "default-owner")

### Database Migrations
```bash
npx prisma migrate dev --name <name>  # Create new migration
npx prisma db push                     # Push schema changes
npx prisma migrate reset               # Reset DB (dev only)
```

### Build & Deployment
```bash
npm run build            # Compile Next.js and Prisma
npm start                # Run production server
```
- Deploys to **Vercel** with PostgreSQL database
- Vercel handles automatic builds on git push
- Webhook URLs must be updated to production domain

## Common Tasks

### Add New API Endpoint
1. Create `src/app/api/[feature]/route.ts`
2. Export `async function POST(request: NextRequest)` 
3. Extract body: `const body = await request.json()`
4. Validate with custom validators or Zod
5. Use Prisma for DB: `await prisma.model.create/findMany/update/delete()`
6. Return: `NextResponse.json({ data })`
7. Handle errors: catch + return `{ error: message }`

### Add Email Template
1. Create function in `src/lib/email.ts` that returns HTML string
2. Use inline CSS (no external stylesheets for email compatibility)
3. Include both client and admin email functions
4. Call with: `await sendEmail({ to, subject, html })`

### Create Admin Page
1. Create `src/app/app/[feature]/page.tsx` (requires auth)
2. Fetch data with Prisma (server component): `const data = await prisma.model.findMany()`
3. Use client components for interactivity: `'use client'` + hooks
4. Import UI components from `@/components/ui/*`

### Schedule Appointments
- Check availability: `prisma.availability.findMany({ where: { dayOfWeek, isActive: true } })`
- Verify no conflicts: `prisma.appointment.findFirst({ where: { startTime: { lt: endTime }, endTime: { gt: startTime } } })`
- Save slot: `prisma.appointment.create({ data: { clientName, clientEmail, startTime, endTime } })`

## Important Notes

### Security
- **Never expose secrets in code** - use environment variables
- **Validate all inputs** - user data, query params, webhook signatures
- **Rate limit public endpoints** - prevent abuse via `getClientIp()` helper
- **Verify Stripe signatures** - protect webhook integrity
- **Use httpOnly cookies** - session tokens via NextAuth
- **Extract IP safely** - always use `getClientIp(request)` helper from `@/lib/request-utils.ts`

### Performance
- **Cache expensive queries** - Prisma results can be cached
- **Lazy-load components** - use `dynamic()` for large components
- **Optimize images** - use Next.js `Image` component
- **Split bundles** - separate client/server code clearly
- **Consistent responses** - use helpers to reduce bundle duplication

### Production Readiness
- Replace in-memory rate limiter with **Redis**
- Enable **Sentry** or similar for error tracking
- Set up **database backups** (Vercel Postgres handles this)
- Test Stripe webhooks in **live mode** before launch
- Monitor email deliverability with Resend dashboard
- Set up **environment variables** for all secrets
- All API responses now use standardized format via `@/lib/api-response.ts`

## Project-Specific Integration Points

- **Prisma + NextAuth**: Adapter at `@next-auth/prisma-adapter` - users stored in DB
- **Stripe + Email**: Order completions auto-email customers (webhook → Resend)
- **Appointments + Availability**: Slot validation checks DB before booking
- **Contact Form + Admin Dashboard**: Messages saved to DB, viewable in `/app/contact-messages`
- **Socket.IO**: Real-time updates for sessions/appointments (check `src/app/api/socket/*`)

## Key Files Reference

| Feature | Key Files |
|---------|-----------|
| Appointments | [src/app/api/appointments/route.ts](../src/app/api/appointments/route.ts), [src/app/app/appointments/page.tsx](../src/app/app/appointments/page.tsx) |
| Stripe Payments | [src/app/api/webhooks/stripe/route.ts](../src/app/api/webhooks/stripe/route.ts), [src/lib/stripe.ts](../src/lib/stripe.ts) |
| Email | [src/lib/email.ts](../src/lib/email.ts) |
| Database | [prisma/schema.prisma](../prisma/schema.prisma) |
| Auth | [src/middleware.ts](../src/middleware.ts), NextAuth config (check [src/app/api/auth/](../src/app/api/auth/)) |
| Admin Dashboards | [src/app/app/](../src/app/app/) |
| Request Utilities | [src/lib/request-utils.ts](../src/lib/request-utils.ts) |
| API Responses | [src/lib/api-response.ts](../src/lib/api-response.ts) |
| Errors & Validation | [src/lib/errors.ts](../src/lib/errors.ts), [src/lib/validators.ts](../src/lib/validators.ts) |
| Formatters | [src/lib/formatters.ts](../src/lib/formatters.ts) |

## Recent Refactoring (Anti-Pattern Fixes)

### ✅ Completed Improvements

1. **Standardized API Responses** - All routes now use consistent response helpers:
   - `apiSuccess(data)` - successful responses
   - `apiError(message, statusCode)` - error responses
   - `apiRateLimitError(message, remaining, resetAtMs)` - rate limit feedback

2. **Centralized IP Extraction** - Single `getClientIp(request)` helper prevents IP spoofing vulnerabilities

3. **Fixed Prisma Anti-Pattern** - Removed optional chaining (`prisma?.model`), errors now propagate naturally

4. **Consolidated Stripe** - Single singleton from `@/lib/stripe.ts`, no duplicate instances

5. **Deduplicated Formatters** - One source of truth in `@/lib/formatters.ts`, removed from `@/lib/utils.ts`

6. **Rate Limiter Metadata** - Now returns `remaining` and `resetAtMs` to client for better UX (e.g., "4 attempts left")

These changes improve:
- ✅ Security (consistent IP handling)
- ✅ Maintainability (single source of truth)
- ✅ Developer experience (consistent patterns)
- ✅ User experience (better error feedback)
