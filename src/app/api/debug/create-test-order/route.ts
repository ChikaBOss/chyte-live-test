import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const { vendorId, vendorRole, subtotal = 5000 } = await req.json();

    // ================= VALIDATION =================
    if (!vendorId || !vendorRole) {
      return NextResponse.json(
        { error: "vendorId and vendorRole are required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return NextResponse.json(
        { error: "Invalid vendorId" },
        { status: 400 }
      );
    }

    const allowedRoles = ["chef", "vendor", "pharmacy", "topvendor"];
    if (!allowedRoles.includes(vendorRole)) {
      return NextResponse.json(
        { error: "Invalid vendorRole" },
        { status: 400 }
      );
    }

    // ================= ORDER DATA =================
    const orderNumber = `TEST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const adminFee = Math.round(subtotal * 0.07);
    const deliveryFee = 500;
    const totalAmount = subtotal + adminFee + deliveryFee;

    const order = await Order.create({
      orderNumber,

      customer: {
        name: "Test Customer",
        email: "test@example.com",
        phone: "08012345678",
        address: "123 Test Street",
      },

      vendorId: new mongoose.Types.ObjectId(vendorId),
      vendorRole, // 🔥 SINGLE SOURCE OF TRUTH

      items: [
        {
          name: "Debug Item",
          price: subtotal,
          quantity: 1,
        },
      ],

      deliveryMethod: "SITE_COMPANY",
      deliveryFee,

      subtotal,
      adminFee,
      totalAmount,

      payment: {
        provider: "PAYSTACK",
        status: "PENDING",
      },

      status: "PENDING_PAYMENT",
    });

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
    });

  } catch (error: any) {
    console.error("❌ Test order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create test order", details: error.message },
      { status: 500 }
    );
  }
}