import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Vendor from "@/models/Vendor";

/* ✅ Required in Next.js 15 */
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
      { approved: false },
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
      approved: vendor.approved,
    });
  } catch (err) {
    console.error("Unapprove vendor error:", err);
    return NextResponse.json(
      { error: "Failed to unapprove vendor" },
      { status: 500 }
    );
  }
}