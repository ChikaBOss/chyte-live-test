import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/orderModel";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Extract bookingId from URL
    const segments = request.nextUrl.pathname.split("/");
    const bookingId = segments[segments.length - 2];

    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing bookingId" },
        { status: 400 }
      );
    }

    const { status } = await request.json();

    await connectToDB();

    const booking = await Order.findOneAndUpdate(
      {
        _id: bookingId,
        providerId: session.user.id,
        serviceType: "booking",
      },
      {
        status: status || "confirmed",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking accepted successfully",
      booking,
    });
  } catch (error) {
    console.error("Accept booking error:", error);
    return NextResponse.json(
      { error: "Failed to accept booking" },
      { status: 500 }
    );
  }
}