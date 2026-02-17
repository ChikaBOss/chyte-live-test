// src/app/api/orders/chef/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/orderModel";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";

export async function GET(_request: NextRequest) {
  try {
    // ⛔️ Force session to any to avoid `{}` typing during build
    const session: any = await getServerSession(authOptions as any);

    const chefId: string | null = session?.user?.id ?? null;

    if (!chefId) {
      return NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    await connectToDB();

    const orders = await Order.find({
      $or: [{ chefId }, { providerId: chefId }],
    })
      .populate("customerId", "name email phone")
      .populate("items.mealId", "name price imageUrl description")
      .sort({ createdAt: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const formattedOrders = orders.map((order: any) => {
      const items = (order.items || []).map((item: any) => ({
        mealId: item.mealId?._id?.toString() || item.mealId,
        name: item.mealId?.name || item.name || "Meal",
        price: item.price || item.mealId?.price || 0,
        quantity: item.quantity || 1,
        image: item.mealId?.imageUrl || item.image || "",
        total: (item.price || 0) * (item.quantity || 1),
      }));

      const itemTotal = items.reduce(
        (sum: number, it: { total?: number }) => sum + (it.total || 0),
        0
      );

      const total =
        order.total ??
        itemTotal + (order.deliveryFee || 0) + (order.tax || 0);

      return {
        _id: order._id.toString(),
        id:
          order.orderNumber ||
          `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
        items,
        total,
        subtotal: order.subtotal || itemTotal,
        deliveryFee: order.deliveryFee || 0,
        tax: order.tax || 0,
        status: order.status || "pending",
        serviceType: order.serviceType || "order",
        createdAt:
          order.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: order.updatedAt?.toISOString(),
        customer: {
          _id: order.customerId?._id?.toString(),
          name:
            order.customerId?.name ||
            order.customer?.name ||
            order.customerName ||
            "Customer",
          email:
            order.customerId?.email ||
            order.customer?.email ||
            order.customerEmail,
          phone:
            order.customerId?.phone ||
            order.customer?.phone ||
            order.customerPhone,
        },
        bookingDate: order.date
          ? new Date(order.date).toISOString()
          : undefined,
        bookingTime: order.time || undefined,
        bookingGuests: order.guests || undefined,
        eventAddress: order.eventAddress || undefined,
        notes: order.notes || undefined,
      };
    });

    return NextResponse.json(formattedOrders, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/orders/chef:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}