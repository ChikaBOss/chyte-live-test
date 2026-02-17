import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import ChildOrder from "@/models/ChildOrder";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectToDB();
    
    const params = request.nextUrl.searchParams;
    const userId = params.get("userId") || "696b7595d13d0ca193c05f75"; // Chef 1
    const role = params.get("role") || "chef";

    // 1. Check Wallet
    const wallet = await Wallet.findOne({ 
      userId: new mongoose.Types.ObjectId(userId), 
      role 
    });

    // 2. Check Child Orders
    const childOrders = await ChildOrder.find({ 
      vendorId: userId,
      vendorRole: role 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

    // 3. Check Parent Orders
    const parentOrderIds = [...new Set(childOrders.map(co => co.parentOrderId))];
    const parentOrders = await Order.find({ _id: { $in: parentOrderIds } })
      .select("orderNumber status payment.status totalAmount createdAt")
      .lean();

    // 4. Check Transactions
    const transactions = await Transaction.find({ 
      userId: new mongoose.Types.ObjectId(userId),
      role 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

    // 5. Get all wallets for debugging
    const allWallets = await Wallet.find({})
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      testUserId: userId,
      testRole: role,
      wallet: wallet || { message: "No wallet found" },
      walletDetails: wallet ? {
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        pending: wallet.pendingBalance
      } : null,
      childOrders: childOrders.map(co => ({
        id: co._id,
        parentOrderId: co.parentOrderId,
        subtotal: co.subtotal,
        commissionAmount: co.commissionAmount,
        vendorAmount: co.vendorAmount,
        status: co.status,
        createdAt: co.createdAt
      })),
      parentOrders: parentOrders.map(po => ({
        id: po._id,
        orderNumber: po.orderNumber,
        status: po.status,
        paymentStatus: po.payment?.status,
        totalAmount: po.totalAmount,
        createdAt: po.createdAt
      })),
      transactions: transactions.map(t => ({
        type: t.type,
        amount: t.amount,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt
      })),
      allWalletsCount: allWallets.length,
      allWalletsSample: allWallets.slice(0, 3).map(w => ({
        userId: w.userId,
        role: w.role,
        balance: w.balance,
        totalEarned: w.totalEarned
      })),
      databaseStatus: {
        ordersCount: await Order.countDocuments(),
        childOrdersCount: await ChildOrder.countDocuments(),
        walletsCount: await Wallet.countDocuments(),
        transactionsCount: await Transaction.countDocuments()
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}