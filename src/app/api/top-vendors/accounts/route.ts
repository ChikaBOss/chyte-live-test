import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import TopVendor from "@/models/TopVendor";

export async function GET() {
  try {
    await connectToDB();

    const accounts = await TopVendor.find({ approved: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(accounts);
  } catch (err) {
    console.error("TopVendor accounts error:", err);
    return NextResponse.json(
      { error: "Failed to load top vendors" },
      { status: 500 }
    );
  }
}