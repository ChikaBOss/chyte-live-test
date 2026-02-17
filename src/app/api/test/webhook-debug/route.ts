import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import ChildOrder from "@/models/ChildOrder";
import { Types } from "mongoose";

// Define a type for the lean order document
type LeanOrder = {
  _id: Types.ObjectId;
  orderNumber: string;
  status: string;
  payment?: { status: string };
  paidAt?: Date;
  totalAmount: number;
  createdAt: Date;
  [key: string]: any;
};

export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const latestOrder = (await Order.findOne({
      "payment.status": "PAID",
    })
      .sort({ createdAt: -1 })
      .lean()) as LeanOrder | null; // ✅ Cast to proper type

    if (!latestOrder) {
      return NextResponse.json({
        success: false,
        message: "No paid orders found",
        suggest: "Make a new Paystack payment to test",
      });
    }

    const childOrders = await ChildOrder.find({
      parentOrderId: latestOrder._id, // ✅ Now TypeScript knows _id exists
    }).lean();

    const childOrdersWithCommissions = childOrders.filter(
      (co) => co.commissionAmount && co.vendorAmount
    );

    return NextResponse.json({
      success: true,
      latestPaidOrder: {
        id: latestOrder._id,
        orderNumber: latestOrder.orderNumber,
        status: latestOrder.status,
        paymentStatus: latestOrder.payment?.status,
        paidAt: latestOrder.paidAt,
        totalAmount: latestOrder.totalAmount,
        createdAt: latestOrder.createdAt,
      },
      childOrders: {
        total: childOrders.length,
        withCommissions: childOrdersWithCommissions.length,
        sample: childOrders.slice(0, 3).map((co) => ({
          vendorId: co.vendorId,
          vendorRole: co.vendorRole,
          subtotal: co.subtotal,
          commissionAmount: co.commissionAmount,
          vendorAmount: co.vendorAmount,
          status: co.status,
        })),
      },
      webhookStatus:
        childOrdersWithCommissions.length > 0
          ? "✅ Webhook seems to have processed commissions"
          : "❌ Webhook didn't process commissions",
      actionRequired:
        childOrdersWithCommissions.length === 0
          ? "Fix webhook to calculate commissions and create wallets"
          : "Check why wallets aren't being created",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}