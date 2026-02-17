import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import DeliveryJob from "@/models/DeliveryJob";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter: any = {};
    if (status) filter.status = status;

    const jobs = await DeliveryJob.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(jobs);
  } catch (err) {
    console.error("FETCH DELIVERY JOBS ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch delivery jobs" },
      { status: 500 }
    );
  }
}