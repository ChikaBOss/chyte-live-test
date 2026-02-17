import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDB } from "@/lib/mongodb";
import Provider from "@/models/providerModel"; // Verify this path is correct

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid provider id" },
        { status: 400 }
      );
    }

    await connectToDB();

    const provider = await Provider.findById(id);
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // ✅ Approve provider
    provider.status = "approved";
    provider.approved = true;
    provider.approvedAt = new Date();

    await provider.save();

    return NextResponse.json({
      ok: true,
      data: provider,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to approve provider" },
      { status: 500 }
    );
  }
}