import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Vendor from "@/models/Vendor";

export async function GET() {
  try {
    await connectToDB();

    const vendors = await Vendor.find({ approved: true })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(vendors);
  } catch (error) {
    console.error("GET /api/vendors error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}