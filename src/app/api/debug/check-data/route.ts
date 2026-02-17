import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Wallet from "@/models/Wallet";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const role = url.searchParams.get("role") || "chef";
    
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }
    
    const userObjId = new mongoose.Types.ObjectId(userId);
    
    // 1. Check wallet
    const wallet = await Wallet.findOne({ userId: userObjId, role });
    
    // 2. Check orders with different statuses
    const paidOrders = await Order.find({
      vendorId: userObjId,
      vendorRole: role,
      "payment.status": "PAID"
    }).select("orderNumber status createdAt subtotal adminFee");
    
    // 3. Check orders that should appear in earnings
    const earningsQuery = {
      vendorId: userObjId,
      vendorRole: role,
      status: { $in: ["COMPLETED", "DELIVERED", "PAID"] },
      "payment.status": "PAID",
    };
    
    const earningsOrders = await Order.find(earningsQuery).select("orderNumber status createdAt subtotal");
    
    return NextResponse.json({
      success: true,
      userId,
      role,
      wallet: wallet ? {
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        exists: true
      } : { exists: false },
      
      paidOrders: {
        count: paidOrders.length,
        orders: paidOrders.map(o => ({
          orderNumber: o.orderNumber,
          status: o.status,
          subtotal: o.subtotal,
          adminFee: o.adminFee,
          vendorRole: o.vendorRole
        }))
      },
      
      earningsQueryResults: {
        count: earningsOrders.length,
        orders: earningsOrders.map(o => ({
          orderNumber: o.orderNumber,
          status: o.status,
          subtotal: o.subtotal
        }))
      },
      
      // Diagnosis
      diagnosis: {
        hasWallet: !!wallet,
        hasPaidOrders: paidOrders.length > 0,
        hasEarningsOrders: earningsOrders.length > 0,
        issue: paidOrders.length > 0 && earningsOrders.length === 0 
          ? "Orders exist but earnings query returns nothing (likely status mismatch)"
          : "All good"
      }
    });
    
  } catch (error: any) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}