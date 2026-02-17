// /app/api/debug/check-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    
    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    // Get vendor wallet
    const vendorWallet = order.vendorId 
      ? await Wallet.findOne({ userId: order.vendorId, role: "vendor" })
      : null;
    
    // Get platform wallet
    const platformWallet = await Wallet.findOne({ role: "platform" });
    
    // Get transactions for this order
    const transactions = await Transaction.find({ orderId: order._id });
    
    return NextResponse.json({
      success: true,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        vendorId: order.vendorId,
        subtotal: order.subtotal,
        adminFee: order.adminFee,
        deliveryFee: order.deliveryFee,
        totalAmount: order.totalAmount,
        payment: order.payment,
        distribution: order.distribution,
        status: order.status,
      },
      wallets: {
        vendor: vendorWallet ? {
          _id: vendorWallet._id,
          userId: vendorWallet.userId,
          balance: vendorWallet.balance,
          totalEarned: vendorWallet.totalEarned
        } : null,
        platform: platformWallet ? {
          _id: platformWallet._id,
          userId: platformWallet.userId,
          balance: platformWallet.balance,
          totalEarned: platformWallet.totalEarned
        } : null
      },
      transactions: transactions.map(tx => ({
        _id: tx._id,
        type: tx.type,
        amount: tx.amount,
        userId: tx.userId,
        role: tx.role,
        source: tx.source,
        status: tx.status,
        reference: tx.reference,
        createdAt: tx.createdAt
      })),
      summary: {
        orderStatus: order.status,
        paymentStatus: order.payment?.status,
        distributionStatus: order.distribution?.status,
        vendorWalletExists: !!vendorWallet,
        platformWalletExists: !!platformWallet,
        transactionCount: transactions.length
      }
    });
    
  } catch (error: any) {
    console.error("Check order error:", error);
    return NextResponse.json(
      { error: "Failed to check order", details: error.message },
      { status: 500 }
    );
  }
}