import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import DeliveryJob from "@/models/DeliveryJob";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const body = await req.json();
    const { deliveryJobId } = body;

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

    // Check if already delivered
    if (deliveryJob.status === "DELIVERED") {
      return NextResponse.json(
        { error: "Delivery job already completed" },
        { status: 400 }
      );
    }

    // Update status to delivered
    deliveryJob.status = "DELIVERED";
    await deliveryJob.save();

    return NextResponse.json({
      success: true,
      message: "Delivery marked as completed",
      deliveryJob,
    });
  } catch (error: any) {
    console.error("Error completing delivery:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete delivery" },
      { status: 500 }
    );
  }
}