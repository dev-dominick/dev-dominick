# AI Coding Agent Instructions

> **DISCLAIMER**: This is a personal portfolio and demonstration project only. No warranties, guarantees, or support are provided. Not intended for production commercial use. Use at your own risk.
>
> **IMPORTANT**: This is a single-user demonstration showcasing technical capabilities. Features like trading, investing, and appointments are for portfolio demonstration purposes only, using the owner's personal account.

## Architecture Overview

**Tech Stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Prisma + NextAuth + Stripe

**Project Type**: Personal portfolio site with demonstration features including eCommerce, appointment booking, and financial analytics integrations (Stripe, Plaid).

**Key Principle**: Lightweight, dependency-minimal architecture. Prefer inline utilities over external libraries (see `src/lib/ui.tsx`, `src/lib/utils.ts`).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/               # Backend API endpoints (Next.js Route Handlers)
│   │   ├── auth/          # Authentication (signup, login, forgot-password)
│   │   ├── appointments/  # Booking system
│   │   ├── billing/       # Stripe checkout & portal
│   │   └── webhooks/      # Stripe webhook handlers
│   └── [page]/            # Frontend pages (marketing + protected app routes)
├── components/            # React components (client & server)
│   ├── ui/               # Reusable UI primitives (Button, Input, etc.)
│   ├── templates/        # MUI-inspired templates (no MUI deps - pure Tailwind)
│   └── app-shell/        # Layout wrappers
├── lib/                  # Shared utilities & integrations
│   ├── auth-session.ts   # NextAuth session management
│   ├── api-client.ts     # Frontend fetch wrappers
│   ├── prisma.ts         # Database client (lazy-loaded)
│   ├── stripe.ts         # Stripe SDK instance
│   └── validators.ts     # Form validation utilities
└── contexts/             # React Context providers (EntitlementContext)
```

## Critical Patterns

### 1. **Import Path Aliases** (see `tsconfig.json`)
Use `@/` prefixes for all imports:
```ts
import { Button } from '@/components/ui'
import { prisma } from '@/lib/prisma'
import { formatters } from '@/lib/utils'
```

### 2. **API Route Handlers** (Next.js 16 conventions)
All API routes export `GET`, `POST`, etc. as named functions:
```ts
// src/app/api/example/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ success: true })
}
```

### 3. **Authentication Flow**
- **Middleware**: `src/middleware.ts` handles route protection (public/auth/app routes)
- **Session Management**: Use `issueSessionResponse()` from `auth-session.ts` to create sessions
- **Protected Routes**: All `/app/*` routes require authentication (owner access)
- **Auth Routes**: `/login`, `/signup` redirect to `/app` if already logged in
- **Legacy Redirects**: `/admin/*` → `/app/*` (308 permanent redirect)
- **Note**: Auth system demonstrates capability; this is a single-user portfolio site

### 4. **Database Access**
Prisma is **lazy-loaded** to avoid build issues:
```ts
import { prisma } from '@/lib/prisma'
// Prisma may return null in dev if not initialized
const user = await prisma?.user.findUnique({ where: { email } })
```

### 5. **Styling with Tailwind CSS 4**
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Components in `src/lib/ui.tsx` are intentionally inline (no separate files)
- `src/components/ui/` has more complex components (Button with variant system)
- **Theme**: Matrix/terminal aesthetic with `matrix-*` custom color tokens

### 6. **Client vs Server Components**
- Default to Server Components (no `"use client"` directive)
- Add `"use client"` only when using hooks, event handlers, or browser APIs
- See `src/components/HomepageHeroClient.tsx` for client-side navigation example

### 7. **Form Validation**
Use `validators` from `@/lib/validators.ts`:
```ts
import { validators } from '@/lib/validators'

validators.required(email, 'Email')
validators.email(email)
validators.minLength(password, 10, 'Password')
```

### 8. **Error Handling**
- Throw `ValidationError` from `@/lib/errors.ts` for client-facing errors
- Use `getErrorMessage()` from `@/lib/utils.ts` to safely extract error messages

### 9. **Entitlements System (Demo)**
Use `EntitlementContext` for demonstration of subscription-based feature flags:
```tsx
const { entitlements, subscription } = useEntitlements()
if (!entitlements?.investing) {
  return <UpgradePrompt feature="investing" />
}
```
**Note**: Demonstrates technical implementation; actual data reflects owner's personal account only.

## Development Workflows

**Start Dev Server**: `npm run dev` (runs on port 3000)  
**Build**: `npm run build`  
**Database Seed**: `npm run db:seed` (if Prisma is configured)

## Environment Variables (For Development/Testing)
```env
NEXTAUTH_SECRET=<your-secret>
STRIPE_SECRET_KEY=sk_test_...  # Use test mode only
DATABASE_URL=postgresql://...
```

## Common Gotchas

1. **TypeScript Build Errors Ignored**: `next.config.ts` sets `ignoreBuildErrors: true` - don't rely on build-time type checking
2. **API Rewrites**: `/api/app/*` routes configured for external API proxy (see `next.config.ts`)
3. **Rate Limiting**: Login attempts are rate-limited via `src/lib/rate-limit.ts` (5 attempts → 30min lockout)
4. **Stripe Webhooks**: Use raw body parsing for signature verification (see `src/app/api/webhooks/stripe/route.ts`)
5. **Templates**: `src/components/templates/` are MUI-inspired but built with zero Material-UI dependencies

## Key Files to Reference

- **Middleware Logic**: [src/middleware.ts](src/middleware.ts)
- **Auth Config**: [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts)
- **Utilities**: [src/lib/utils.ts](src/lib/utils.ts), [src/lib/validators.ts](src/lib/validators.ts)
- **UI Components**: [src/lib/ui.tsx](src/lib/ui.tsx), [src/components/ui/button.tsx](src/components/ui/button.tsx)
- **Session Management**: [src/lib/auth-session.ts](src/lib/auth-session.ts)

## Code Style Preferences

- Prefer **function declarations** over arrow functions for components
- Use **explicit return types** for API handlers
- Keep components **small and focused** - extract logic to `src/lib/`
- Avoid external dependencies unless absolutely necessary
- Use **native Intl API** for formatting (currency, dates) - see `formatters` in `utils.ts`
