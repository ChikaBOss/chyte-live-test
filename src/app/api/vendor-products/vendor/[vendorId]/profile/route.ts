import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Vendor from "@/models/Vendor";

export async function GET(
  _req: NextRequest,
  context: any
) {
  try {
    const { vendorId } = await context.params;

    if (!vendorId) {
      return NextResponse.json(
        { error: "vendorId is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const vendor = await Vendor.findById(vendorId).lean();

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // ❌ remove sensitive fields
    const { password, ...safe } = vendor as any;

    return NextResponse.json(safe);
  } catch (err) {
    console.error("GET vendor profile error:", err);
    return NextResponse.json(
      { error: "Failed to fetch vendor profile" },
      { status: 500 }
    );
  }
}