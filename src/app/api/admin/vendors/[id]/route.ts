import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Vendor from "@/models/Vendor";

/* ✅ REQUIRED CONTEXT TYPE FOR NEXT.JS 15 */
type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _req: NextRequest,
  context: Context
) {
  try {
    await connectToDB();

    const { id } = await context.params;

    const deleted = await Vendor.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete vendor error:", err);
    return NextResponse.json(
      { error: "Failed to delete vendor" },
      { status: 500 }
    );
  }
}