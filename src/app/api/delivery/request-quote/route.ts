import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import DeliveryJob from "@/models/DeliveryJob";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const body = await req.json();

    const {
      orderId = null,
      customerPhone,
      dropAddress,
      itemIds,
      vendors,
    } = body;

    if (
      !customerPhone ||
      !dropAddress ||
      !Array.isArray(itemIds) ||
      itemIds.length === 0 ||
      !Array.isArray(vendors) ||
      vendors.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // prevent duplicate active requests
    const existing = await DeliveryJob.findOne({
      customerPhone,
      dropAddress,
      status: { $in: ["PENDING_QUOTE", "QUOTED"] },
      expiresAt: { $gt: new Date() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Delivery quote already requested" },
        { status: 409 }
      );
    }

    const deliveryJob = await DeliveryJob.create({
      orderId,
      customerPhone,
      dropAddress,
      itemIds,
      vendors,
      status: "PENDING_QUOTE",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    return NextResponse.json({
      message: "Delivery quote requested",
      deliveryJobId: deliveryJob._id,
      status: deliveryJob.status,
    });
  } catch (err) {
    console.error("DELIVERY QUOTE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to request delivery quote" },
      { status: 500 }
    );
  }
}