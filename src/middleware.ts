import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Public routes - never require auth
const PUBLIC_ROUTES = [
  "/maintenance",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/dev.svg",
];

// Auth routes - hidden from public, only accessible directly (for admin setup)
// No links to these routes exist in the UI
const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

// Protected app routes - require admin login
const APP_ROUTES = ["/app"];

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path.startsWith(route));
}

function isAuthRoute(path: string): boolean {
  return AUTH_ROUTES.some((route) => path.startsWith(route));
}

function isAppRoute(path: string): boolean {
  return APP_ROUTES.some((route) => path.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // DEV MODE ONLY: Check for dev_admin_mode cookie FIRST (bypass all auth)
  if (process.env.NODE_ENV === "development") {
    const devAdminCookie = request.cookies.get("dev_admin_mode")?.value;
    console.log(`[MIDDLEWARE] Path: ${pathname}, Dev cookie: ${devAdminCookie}, NODE_ENV: ${process.env.NODE_ENV}`);
    
    if (devAdminCookie === "true") {
      console.log(`[DEV ADMIN] ✅ Bypassing all auth for ${pathname}`);
      return NextResponse.next();
    }
  }

  // Get auth token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // Check maintenance mode - redirect all unauthenticated traffic to coming soon (PRODUCTION ONLY)
  // Disabled in development for easier testing
  const isProduction = process.env.NODE_ENV === "production";
  // Treat MAINTENANCE_MODE="true" as enabled; any other value disables
  const maintenanceEnabled = process.env.MAINTENANCE_MODE === "true";
  if (maintenanceEnabled && isProduction && pathname !== "/maintenance" && !isAuthenticated) {
    const maintenanceUrl = request.nextUrl.clone();
    maintenanceUrl.pathname = "/maintenance";
    return NextResponse.redirect(maintenanceUrl);
  }

  // 1. Public routes - always allow
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Auth routes - allow if logged out; redirect to intended destination if logged in
  if (isAuthRoute(pathname)) {
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      // Respect the 'next' param if present, otherwise default to /app
      const nextParam = request.nextUrl.searchParams.get('next');
      // Validate: must start with /, must not be a login route (prevent loops)
      const isValidNext = nextParam && 
        nextParam.startsWith('/') && 
        !nextParam.startsWith('/login') &&
        !nextParam.startsWith('/signup');
      url.pathname = isValidNext ? nextParam.split('?')[0] : '/app';
      // Preserve query string from next param if present
      if (isValidNext && nextParam.includes('?')) {
        const queryPart = nextParam.split('?')[1];
        url.search = queryPart ? `?${queryPart}` : '';
      } else {
        url.search = '';
      }
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 3. App routes - require staff login (admin, admin-main, lawyer, accountant, ops)
  if (isAppRoute(pathname)) {
    if (!isAuthenticated) {
      // Not logged in - redirect to login with next param
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname + url.search);
      return NextResponse.redirect(url);
    }

    const userRole = (token as { role?: string })?.role;
    const staffRoles = ["admin", "admin-main", "lawyer", "accountant", "ops"];
    
    if (!userRole || !staffRoles.includes(userRole)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("reason", "forbidden");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 4. Legacy admin redirect - redirect to /app equivalent (preserve path + query)
  if (pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    // Replace /admin with /app, preserving everything after
    url.pathname = pathname.replace(/^\/admin/, "/app");
    return NextResponse.redirect(url, 308);
  }

  // 5. All other routes - allow (marketing site is public-first)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
