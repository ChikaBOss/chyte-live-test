import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import DeliveryPricing from "@/models/DeliveryPricing";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/* ================= GET PRICING ================= */
export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const baseLocation = decodeURIComponent(
      request.nextUrl.pathname.split("/").pop()!
    );

    const pricing = await DeliveryPricing.findOne({ baseLocation }).lean();

    if (!pricing) {
      return NextResponse.json(
        { error: "Delivery pricing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pricing, { status: 200 });
  } catch (error) {
    console.error("Error fetching delivery pricing:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery pricing" },
      { status: 500 }
    );
  }
}

/* ================= UPDATE PRICING (ADMIN) ================= */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ FIXED: role-based admin check
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();

    const baseLocation = decodeURIComponent(
      request.nextUrl.pathname.split("/").pop()!
    );

    const body = await request.json();

    const updatedPricing = await DeliveryPricing.findOneAndUpdate(
      { baseLocation },
      {
        ...body,
        updatedBy: session.user.id,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedPricing) {
      return NextResponse.json(
        { error: "Delivery pricing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPricing, { status: 200 });
  } catch (error) {
    console.error("Error updating delivery pricing:", error);
    return NextResponse.json(
      { error: "Failed to update delivery pricing" },
      { status: 500 }
    );
  }
}

/* ================= DELETE PRICING (ADMIN) ================= */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ FIXED: role-based admin check
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();

    const baseLocation = decodeURIComponent(
      request.nextUrl.pathname.split("/").pop()!
    );

    await DeliveryPricing.findOneAndDelete({ baseLocation });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting delivery pricing:", error);
    return NextResponse.json(
      { error: "Failed to delete delivery pricing" },
      { status: 500 }
    );
  }
}