import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Vendor from "@/models/Vendor";

/* ✅ REQUIRED FOR NEXT.JS 15 */
type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  _req: NextRequest,
  context: Context
) {
  try {
    await connectToDB();

    const { id } = await context.params;

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      { approved: true },
      { new: true }
    );

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      vendor,
    });
  } catch (err) {
    console.error("Approve vendor error:", err);
    return NextResponse.json(
      { error: "Approval failed" },
      { status: 500 }
    );
  }
}