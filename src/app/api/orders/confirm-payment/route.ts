// src/app/api/orders/confirm-payment/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { orderId, paymentReference, provider } = body;

    if (!orderId || !paymentReference || !provider) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDB();

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    order.status = "PAID";
    order.payment = {
      provider,
      reference: paymentReference,
      paidAt: new Date(),
    };

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment confirmed",
      orderId: order._id.toString(),
    });
  } catch (error: any) {
    console.error("Confirm payment error:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}