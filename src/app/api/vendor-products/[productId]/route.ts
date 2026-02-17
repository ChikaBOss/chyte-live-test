import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import VendorProduct from "@/models/VendorProduct";

/* ================= UPDATE PRODUCT ================= */
export async function PUT(
  req: NextRequest,
  context: any
) {
  try {
    const { productId } = await context.params;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    const updates = await req.json();
    await connectToDB();

    const updated = await VendorProduct.findByIdAndUpdate(
      productId,
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT vendor product error:", err);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

/* ================= DELETE PRODUCT ================= */
export async function DELETE(
  _req: NextRequest,
  context: any
) {
  try {
    const { productId } = await context.params;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const deleted = await VendorProduct.findByIdAndDelete(productId).lean();

    if (!deleted) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id: productId });
  } catch (err) {
    console.error("DELETE vendor product error:", err);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}