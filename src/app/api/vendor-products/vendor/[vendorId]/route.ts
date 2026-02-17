import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import VendorProduct from "@/models/VendorProduct";

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

    // Fetch products for this specific vendor
    const products = await VendorProduct.find({ vendorId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET vendor products error:", err);
    return NextResponse.json(
      { error: "Failed to fetch vendor products" },
      { status: 500 }
    );
  }
}