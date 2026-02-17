import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { connectToDB } from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import ChildOrder from "@/models/ChildOrder";
import Order from "@/models/Order";
import { authOptions } from "@/lib/auth-config";

// Define a type for the parent order information we fetch
type ParentOrderInfo = {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const userId = session.user.id;
    const role = session.user.role;

    // ========== 1. WALLET ==========
    let wallet = null;
    try {
      wallet = await Wallet.findOne({ userId, role });
    } catch (err) {
      console.error("Wallet query error:", err);
    }

    // If no wallet exists, return zero balance (don't auto-create – wait for first order)
    const walletData = wallet
      ? {
          balance: wallet.balance,
          pending: wallet.pendingBalance,
          totalEarned: wallet.totalEarned,
          currency: wallet.currency || "NGN",
          role: wallet.role,
        }
      : {
          balance: 0,
          pending: 0,
          totalEarned: 0,
          currency: "NGN",
          role,
        };

    // ========== 2. QUERY PARAMS ==========
    const params = request.nextUrl.searchParams;
    const range = params.get("range") || "30d";
    const page = Number(params.get("page") || 1);
    const limit = Number(params.get("limit") || 10);

    // ========== 3. DATE RANGE ==========
    const now = new Date();
    let startDate = new Date(0);
    if (range === "today") startDate.setHours(0, 0, 0, 0);
    else if (range === "7d") startDate = new Date(now.getTime() - 7 * 86400000);
    else if (range === "30d") startDate = new Date(now.getTime() - 30 * 86400000);
    else if (range === "90d") startDate = new Date(now.getTime() - 90 * 86400000);

    // ========== 4. CHILD ORDERS – EXACT MATCH ONLY ==========
    const query = {
      vendorId: userId,
      vendorRole: role, // ← MUST match exactly
      status: { $in: ["PAID", "COMPLETED", "DELIVERED"] },
      createdAt: { $gte: startDate },
    };

    const childOrders = await ChildOrder.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .catch(err => {
        console.error("ChildOrder query error:", err);
        return [];
      });

    // ========== 5. STATS ==========
    let stats = {
      gross: 0,
      commission: 0,
      net: 0,
      orderCount: 0,
      avgOrderValue: 0,
    };

    try {
      const statsAgg = await ChildOrder.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            gross: { $sum: "$subtotal" },
            commission: { $sum: "$commissionAmount" },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: "$subtotal" },
          },
        },
      ]);
      if (statsAgg[0]) {
        stats = {
          gross: statsAgg[0].gross,
          commission: statsAgg[0].commission,
          net: statsAgg[0].gross - statsAgg[0].commission,
          orderCount: statsAgg[0].orderCount,
          avgOrderValue: Math.round(statsAgg[0].avgOrderValue || 0),
        };
      }
    } catch (err) {
      console.error("Stats aggregation error:", err);
    }

    // ========== 6. ENRICH ORDERS ==========
    const enrichedOrders = await Promise.all(
      childOrders.map(async (order) => {
        try {
          // ✅ Type assertion to resolve the union type issue
          const parent = await Order.findById(order.parentOrderId)
            .select("orderNumber customer")
            .lean() as ParentOrderInfo | null;

          return {
            _id: order._id,
            orderNumber: parent?.orderNumber || `ORD-${order.parentOrderId}`,
            customer: parent?.customer || { name: "Customer" },
            createdAt: order.createdAt,
            status: order.status,
            subtotal: order.subtotal,
            adminFee: order.commissionAmount || 0,
            distribution: {
              vendorAmount: order.vendorAmount || (order.subtotal - (order.commissionAmount || 0)),
            },
          };
        } catch (err) {
          console.error("Order enrichment error:", err);
          return null;
        }
      })
    ).then(results => results.filter(Boolean));

    // ========== 7. RESPONSE ==========
    return NextResponse.json({
      success: true,
      wallet: walletData,
      orders: enrichedOrders,
      stats,
      debug: {
        userId,
        role,
        query,
        childOrdersFound: childOrders.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Earnings API fatal error:", error);
    // Always return JSON, never HTML
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch earnings",
        details: error.message,
      },
      { status: 500 }
    );
  }
}