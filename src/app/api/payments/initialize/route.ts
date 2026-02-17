import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import PaystackService from "@/lib/paystack";
import Order from "@/models/Order";
import ChildOrder from "@/models/ChildOrder";
import { connectToDB } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const { email, amount, orderId } = await req.json();

    if (!email || !amount || !orderId) {
      return NextResponse.json(
        { success: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // -----------------------------
    // Resolve vendor groups
    // -----------------------------
    let vendorGroups: any[] = order.vendorGroups || [];

    if (vendorGroups.length === 0) {
      try {
        const childOrders = await ChildOrder.find({
          parentOrderId: orderId,
        });

        vendorGroups = childOrders.map((child: any) => ({
          vendorId: child.vendorId,
          vendorName: child.vendorName || `Vendor-${child.vendorId}`,
          vendorRole: child.vendorRole || "vendor",
          vendorLocation: child.vendorLocation || "Unknown",
          vendorBaseLocation: child.vendorBaseLocation || "Unknown",
          items: child.items || [],
          subtotal: child.subtotal || 0,
          commissionRate: child.commissionRate || 0,
          commissionAmount: child.commissionAmount || 0,
          vendorAmount: child.vendorAmount || 0,
          status: child.status || "pending",
        }));
      } catch (err) {
        console.error("❌ Child order fetch failed:", err);
      }
    }

    if (vendorGroups.length === 0) {
      vendorGroups = [
        {
          vendorId: "fallback-vendor",
          vendorName: "Fallback Vendor",
          vendorRole: "vendor",
          vendorLocation: "Eziobodo",
          vendorBaseLocation: "Eziobodo",
          items: [],
          subtotal: order.totalAmount || amount / 100,
          commissionRate: 0.1,
          commissionAmount:
            (order.totalAmount || amount / 100) * 0.1,
          vendorAmount:
            (order.totalAmount || amount / 100) * 0.9,
          status: "pending",
        },
      ];
    }

    const vendorRoles = [
      ...new Set(vendorGroups.map((g: any) => g.vendorRole)),
    ];

    const reference = `ORDER-${orderId}-${uuidv4().slice(0, 8)}`;

    await Order.findByIdAndUpdate(orderId, {
      "payment.reference": reference,
      "payment.provider": "PAYSTACK",
      "payment.status": "PENDING",
      vendorGroups,
    });

    // -----------------------------------
    // 🔥 FIX: CAST METADATA TO ANY
    // -----------------------------------
    const response = await PaystackService.initializePayment({
      email,
      amount, // kobo
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      metadata: {
        orderId,
        vendorGroups: vendorGroups.map((g: any) => ({
          vendorId: g.vendorId,
          vendorName: g.vendorName,
          vendorRole: g.vendorRole,
          subtotal: g.subtotal,
          commissionRate: g.commissionRate || 0,
          commissionAmount: g.commissionAmount || 0,
          vendorAmount: g.vendorAmount || 0,
        })),
        vendorRoles,
        totalAmount: amount / 100,
      } as any, // ⬅️ THIS FIXES THE BUILD
    });

    return NextResponse.json({
      success: true,
      authorization_url: response.data.authorization_url,
      reference,
      metadata: {
        vendorGroups,
        vendorRoles,
      },
    });
  } catch (err: any) {
    console.error("❌ Payment init error:", err);
    return NextResponse.json(
      { success: false, error: "Init failed", details: err.message },
      { status: 500 }
    );
  }
}