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

    await TopVendor.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Remove top vendor error:", err);
    return NextResponse.json(
      { error: "Failed to remove top vendor" },
      { status: 500 }
    );
  }
}