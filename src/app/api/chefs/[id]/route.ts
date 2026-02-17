// src/app/api/chefs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Chef from "@/models/Chef";

export async function GET(request: NextRequest) {
  try {
    // ✅ Extract ID from URL (Next.js 15 compatible)
    const segments = request.nextUrl.pathname.split("/");
    const id = segments[segments.length - 1];

    if (!id) {
      return NextResponse.json(
        { error: "Missing chef id" },
        { status: 400 }
      );
    }

    await connectToDB();

    const chef = await Chef.findById(id).lean();

    if (!chef) {
      return NextResponse.json(
        { error: "Chef not found" },
        { status: 404 }
      );
    }

    // ✅ Type-safe removal of sensitive fields
    const safeChef = { ...(chef as Record<string, any>) };
    delete safeChef.password;

    return NextResponse.json(safeChef, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching chef:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}