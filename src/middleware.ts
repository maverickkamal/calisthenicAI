// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'firebaseAuthToken'; // Example cookie name, adjust as per your auth setup

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const authenticatedRoutes = [
    '/dashboard',
    '/log-workout',
    '/training-plan',
    '/progress',
    '/journal',
    '/recommendations',
    '/settings', // Added settings to protected routes
  ];

  const authRoutes = ['/login', '/signup'];

  const isProtectedRoute = authenticatedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (!authToken && isProtectedRoute) {
    // User is not authenticated and trying to access a protected route
    // Redirect to login page, preserving the intended URL
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authToken && isAuthRoute) {
    // User is authenticated and trying to access login/signup page
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (pathname === '/') {
    if (authToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (custom static assets folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
