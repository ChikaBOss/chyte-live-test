import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  return NextResponse.json({
    session: {
      user: session?.user || null,
      exists: !!session
    },
    headers: {
      cookie: request.headers.get("cookie"),
      authorization: request.headers.get("authorization")
    },
    diagnosis: session?.user?.role 
      ? `You are logged in as a ${session.user.role} (ID: ${session.user.id})`
      : "You are not logged in"
  });
}