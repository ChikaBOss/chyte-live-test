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

    await TopVendor.findByIdAndUpdate(id, { approved: false });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unapprove top vendor error:", err);
    return NextResponse.json(
      { error: "Failed to unapprove top vendor" },
      { status: 500 }
    );
  }
}