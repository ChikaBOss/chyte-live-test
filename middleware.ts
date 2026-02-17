// middleware.ts (ROOT)
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🚨 ABSOLUTELY EXCLUDE ADMIN ROUTES
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/adminDashboard")
  ) {
    return NextResponse.next();
  }

  // allow public/static
  const PUBLIC_PREFIXES = [
    "/_next/",
    "/favicon.ico",
    "/api/auth",
    "/",
    "/vendors",
    "/chefs",
    "/pharmacies",
  ];
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // protect chef-only areas
  const PROTECTED_PREFIXES = [
    "/chefDashboard",
    "/api/meals",
    "/api/chefs",
  ];

  if (!PROTECTED_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: NEXTAUTH_SECRET });

  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/chefs/login", req.url));
  }

  if ((token as any).role !== "chef") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/chefDashboard/:path*",
    "/api/meals/:path*",
    "/api/chefs/:path*",
  ],
};