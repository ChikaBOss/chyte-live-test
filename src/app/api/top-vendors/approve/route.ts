import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import TopVendor from "@/models/TopVendor";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    const vendor = await TopVendor.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true }
    );

    if (!vendor) {
      return NextResponse.json(
        { error: "Top vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Approve top vendor error:", err);
    return NextResponse.json(
      { error: "Failed to approve top vendor" },
      { status: 500 }
    );
  }
}