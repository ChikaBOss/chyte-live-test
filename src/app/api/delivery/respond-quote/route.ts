import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import DeliveryJob from "@/models/DeliveryJob";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const body = await req.json();
    const { deliveryJobId, price, etaMins, notes } = body;

    if (!deliveryJobId || !price || !etaMins) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the delivery job
    const deliveryJob = await DeliveryJob.findById(deliveryJobId);

    if (!deliveryJob) {
      return NextResponse.json(
        { error: "Delivery job not found" },
        { status: 404 }
      );
    }

    // Check if job is still pending quote
    if (deliveryJob.status !== "PENDING_QUOTE") {
      return NextResponse.json(
        { error: "Delivery job is no longer available for quoting" },
        { status: 400 }
      );
    }

    // Update with quote information - note: use quotedAmount (with 'd'), not quoteAmount
    deliveryJob.status = "QUOTED";
    deliveryJob.quotedAmount = Number(price); // Note: quotedAmount, not quoteAmount
    deliveryJob.etaMins = Number(etaMins);
    deliveryJob.notes = notes || "";
    // Reset expiry to 15 minutes from now
    deliveryJob.expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await deliveryJob.save();

    return NextResponse.json({
      success: true,
      message: "Quote sent successfully",
      deliveryJob,
    });
  } catch (error: any) {
    console.error("Error responding to quote:", error);
    return NextResponse.json(
      { error: error.message || "Failed to respond to quote" },
      { status: 500 }
    );
  }
}