import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Vendor from "@/models/Vendor";

// GET vendor profile
export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const vendorId = req.nextUrl.searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    const vendor = await Vendor.findById(vendorId).select("-password");

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(vendor, { status: 200 });
  } catch (error) {
    console.error("GET /api/vendors/me error:", error);
    return NextResponse.json(
      { error: "Failed to load vendor profile" },
      { status: 500 }
    );
  }
}

// UPDATE vendor profile
export async function PUT(req: NextRequest) {
  try {
    await connectToDB();

    const body = await req.json();
    const { vendorId, ...updateData } = body;

    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedVendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedVendor, { status: 200 });
  } catch (error) {
    console.error("PUT /api/vendors/me error:", error);
    return NextResponse.json(
      { error: "Failed to update vendor profile" },
      { status: 500 }
    );
  }
}