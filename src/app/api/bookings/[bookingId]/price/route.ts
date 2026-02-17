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

    // ✅ Extract bookingId from URL (Next.js 15 compatible)
    const segments = request.nextUrl.pathname.split("/");
    const bookingId = segments[segments.length - 2];

    if (!bookingId) {
      return NextResponse.json(
        { error: "Missing bookingId" },
        { status: 400 }
      );
    }

    const { total } = await request.json();

    if (!total || isNaN(Number(total))) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const booking = await Order.findOneAndUpdate(
      {
        _id: bookingId,
        providerId: session.user.id,
        serviceType: "booking",
      },
      {
        total: Number(total),
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
      message: "Booking price updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Set booking price error:", error);
    return NextResponse.json(
      { error: "Failed to update booking price" },
      { status: 500 }
    );
  }
}