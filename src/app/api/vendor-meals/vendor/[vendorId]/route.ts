import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import VendorMeal from "@/models/Vendor";

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

    const meals = await VendorMeal.find({ vendorId })
      .sort({ createdAt: -1 })
      .lean();

    const safe = meals.map((m: any) => ({
      _id: m._id?.toString?.() ?? m._id,
      vendorId: m.vendorId,
      name: m.name,
      price: m.price,
      image: m.imageUrl || m.image || "",
      description: m.description || "",
    }));

    return NextResponse.json(safe);
  } catch (err: any) {
    console.error("GET /api/vendor-meals/vendor error:", err);
    return NextResponse.json(
      { error: "Failed to load vendor meals" },
      { status: 500 }
    );
  }
}