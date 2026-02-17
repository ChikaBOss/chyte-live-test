import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import DeliveryJob from "@/models/DeliveryJob";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const { deliveryJobId, amount } = await req.json();

    if (!deliveryJobId || !amount) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const job = await DeliveryJob.findById(deliveryJobId);

    if (!job) {
      return NextResponse.json(
        { error: "Delivery job not found" },
        { status: 404 }
      );
    }

    job.quote = {
      amount,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    };

    job.status = "QUOTED";

    job.timeline.push({
      status: "QUOTED",
      note: `Quote sent: ₦${amount}`,
      at: new Date(),
    });

    await job.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SEND QUOTE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to send quote" },
      { status: 500 }
    );
  }
}