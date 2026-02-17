import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import DeliveryPricing from "@/models/DeliveryPricing";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

/* ================= GET ALL PRICING ================= */
export async function GET() {
  try {
    await connectToDB();

    const pricing = await DeliveryPricing
      .find({})
      .sort({ baseLocation: 1 })
      .lean();

    return NextResponse.json(pricing, { status: 200 });
  } catch (error) {
    console.error("Error fetching delivery pricing:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery pricing" },
      { status: 500 }
    );
  }
}

/* ================= CREATE PRICING (ADMIN) ================= */
export async function POST(req: Request) {
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

    const body = await req.json();

    if (!body.baseLocation || !body.deliveryAreas) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const deliveryPricing = await DeliveryPricing.create({
      ...body,
      updatedBy: session.user.id,
      updatedAt: new Date(),
    });

    return NextResponse.json(deliveryPricing, { status: 201 });
  } catch (error) {
    console.error("Error creating delivery pricing:", error);
    return NextResponse.json(
      { error: "Failed to create delivery pricing" },
      { status: 500 }
    );
  }
}