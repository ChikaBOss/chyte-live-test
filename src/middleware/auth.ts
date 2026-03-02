// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import requireAuth from './lib/auth'; // adjust path

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/adminDashboard')) {
    const result = requireAuth(request, ['admin']);
    if (result.error) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // If authenticated, continue
    return NextResponse.next();
  }

  // Allow other routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/adminDashboard/:path*', '/admin/login'], // adjust as needed
};