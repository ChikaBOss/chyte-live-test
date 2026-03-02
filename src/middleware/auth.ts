// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin dashboard
  if (pathname.startsWith("/adminDashboard")) {
    const role = request.cookies.get("role")?.value;

    if (!role || role !== "admin") {
      return NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/adminDashboard/:path*"],
};