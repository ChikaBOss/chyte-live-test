import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import DeliveryJob from "@/models/DeliveryJob";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const deliveryJobId = searchParams.get("deliveryJobId");

    if (!deliveryJobId) {
      return NextResponse.json(
        { error: "Delivery job ID is required" },
        { status: 400 }
      );
    }

    const deliveryJob = await DeliveryJob.findById(deliveryJobId);

    if (!deliveryJob) {
      return NextResponse.json(
        { error: "Delivery job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: deliveryJob.status,
      quotedAmount: deliveryJob.quotedAmount, // Note: quotedAmount, not quoteAmount
      etaMins: deliveryJob.etaMins,
      expiresAt: deliveryJob.expiresAt,
      notes: deliveryJob.notes,
      customerPhone: deliveryJob.customerPhone,
      dropAddress: deliveryJob.dropAddress,
    });
  } catch (error: any) {
    console.error("Error fetching quote status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch quote status" },
      { status: 500 }
    );
  }
}