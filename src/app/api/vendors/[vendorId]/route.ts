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
        { error: "vendorId required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const vendor = await Vendor.findOne({
      _id: vendorId,
      approved: true,
    }).lean();

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    const { password, ...safe } = vendor as any;

    // ✅ Normalize optional fields
    safe.logoUrl = safe.logoUrl ?? "";
    safe.bio = safe.bio ?? "";
    safe.category = safe.category ?? "";
    safe.address = safe.address ?? "";

    return NextResponse.json(safe);
  } catch (err: any) {
    console.error("GET /api/vendors/[vendorId] error:", err);
    return NextResponse.json(
      { error: "Failed to load vendor" },
      { status: 500 }
    );
  }
}