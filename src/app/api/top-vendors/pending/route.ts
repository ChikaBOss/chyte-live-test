import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import TopVendor from "@/models/TopVendor";

export async function GET() {
  try {
    await connectToDB();

    const pending = await TopVendor.find({ approved: false })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(pending);
  } catch (err) {
    console.error("TopVendor pending error:", err);
    return NextResponse.json(
      { error: "Failed to load pending top vendors" },
      { status: 500 }
    );
  }
}