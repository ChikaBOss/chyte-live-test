import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Chef from "@/models/Chef";

export async function GET() {
  try {
    await connectToDB();

    // ONLY approved chefs
    const chefs = await Chef.find({ approved: true })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(chefs, { status: 200 });
  } catch (error) {
    console.error("GET /api/chefs error:", error);
    return NextResponse.json(
      { error: "Failed to load chefs" },
      { status: 500 }
    );
  }
}