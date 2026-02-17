// Create: app/api/debug/process-existing-orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import ChildOrder from "@/models/ChildOrder";
import Wallet from "@/models/Wallet";
import Order from "@/models/Order";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectToDB();
    
    // Get all child orders without commissions
    const childOrders = await ChildOrder.find({
      commissionAmount: { $exists: false },
      status: { $ne: "PAID" }
    }).limit(50); // Process 50 at a time
    
    const results = [];
    
    for (const co of childOrders) {
      // Get parent order
      const parent = await Order.findById(co.parentOrderId);
      if (!parent || parent.payment?.status !== "PAID") continue;
      
      // Calculate commission (chef: 15%, pharmacy: 12%, etc.)
      const rate = co.vendorRole === "chef" ? 0.15 : 
                   co.vendorRole === "pharmacy" ? 0.12 :
                   co.vendorRole === "topvendor" ? 0.08 : 0.10;
      
      const commission = co.subtotal * rate;
      const vendorAmount = co.subtotal - commission;
      
      // Update child order
      co.commissionAmount = commission;
      co.vendorAmount = vendorAmount;
      co.status = "PAID";
      await co.save();
      
      // Create wallet
      const wallet = await Wallet.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(co.vendorId), role: co.vendorRole },
        { $inc: { balance: vendorAmount, totalEarned: vendorAmount } },
        { upsert: true, new: true }
      );
      
      results.push({
        vendorId: co.vendorId,
        vendorRole: co.vendorRole,
        subtotal: co.subtotal,
        commission,
        vendorAmount,
        walletBalance: wallet.balance
      });
    }
    
    return NextResponse.json({
      success: true,
      processed: results.length,
      results: results.slice(0, 10),
      walletsCreated: results.length
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}