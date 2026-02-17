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

    // Delete the delivery job completely (not just update status)
    const result = await DeliveryJob.findByIdAndDelete(deliveryJobId);

    if (!result) {
      return NextResponse.json(
        { error: "Delivery job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Delivery job deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting delivery job:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete delivery job" },
      { status: 500 }
    );
  }
}