import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import TopVendor from "@/models/TopVendor";

export async function GET(_req: Request, context: any) {
  try {
    const { id } = context.params; // remove 'await'

    await connectToDB();

    const vendor = (await TopVendor.findById(id).lean()) as
      | { approved: boolean; password?: string; [key: string]: any }
      | null;

    if (!vendor) {
      return NextResponse.json(
        { error: "Top Vendor not found" },
        { status: 404 }
      );
    }

    if (!vendor.approved) {
      return NextResponse.json(
        { error: "Top Vendor not approved" },
        { status: 403 }
      );
    }

    // Remove sensitive fields
    const { password, ...safeVendor } = vendor;

    return NextResponse.json(safeVendor);
  } catch (err) {
    console.error("Top vendor profile error:", err);
    return NextResponse.json(
      { error: "Failed to load top vendor profile" },
      { status: 500 }
    );
  }
}