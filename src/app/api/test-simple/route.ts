import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "API is working",
    env: {
      hasSecret: !!process.env.NEXTAUTH_SECRET,
      hasUrl: !!process.env.NEXTAUTH_URL,
      secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    }
  });
}