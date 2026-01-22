import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Public routes - never require auth
const PUBLIC_ROUTES = [
  "/",
  "/services",
  "/portfolio",
  "/pricing",
  "/contact",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/code-cloud-logo.svg",
];

// Auth routes - blocked when logged in (owner only)
const AUTH_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
];

// Protected app routes - require login
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

  // Check maintenance mode
  if (process.env.MAINTENANCE_MODE === "true" && pathname !== "/maintenance") {
    const maintenanceUrl = request.nextUrl.clone();
    maintenanceUrl.pathname = "/maintenance";
    return NextResponse.redirect(maintenanceUrl);
  }

  // Get auth token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // 1. Public routes - always allow
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Auth routes (/login, /signup) - block if logged in
  if (isAuthRoute(pathname)) {
    if (isAuthenticated) {
      // Redirect to app if already logged in
      const url = request.nextUrl.clone();
      url.pathname = "/app";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 3. App routes - require login
  if (isAppRoute(pathname)) {
    if (!isAuthenticated) {
      // Not logged in - redirect to login with next param
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname + url.search);
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
