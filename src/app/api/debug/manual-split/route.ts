// app/api/debug/manual-split/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";

export async function POST(req: NextRequest) {
  try {
    console.log("🛠️ MANUAL SPLIT TRIGGERED");

    await connectToDB();

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json(
        { error: "orderId required" },
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

    // ✅ Prevent double split
    if (order.distribution?.status === "DISTRIBUTED") {
      return NextResponse.json({
        success: true,
        message: "Split already completed",
        orderId: order._id,
      });
    }

    // =================================================
    // ✅ MARK ORDER AS PAID
    // =================================================
    order.payment = order.payment || {};
    order.payment.status = "PAID";
    order.payment.paidAt = new Date();
    order.payment.reference ||= `MANUAL_${Date.now()}`;
    order.status = "COMPLETED";

    // =================================================
    // ✅ CALCULATIONS
    // =================================================
    const vendorAmount = order.subtotal;
    const platformAmount = order.adminFee || 0;
    const riderAmount = order.deliveryFee || 0;

    // 🔥 SINGLE SOURCE OF TRUTH
    const ownerRole = order.vendorRole; // chef | vendor | pharmacy | topvendor

    if (!ownerRole) {
      return NextResponse.json(
        { error: "Order vendorRole is missing" },
        { status: 400 }
      );
    }

    // =================================================
    // ✅ OWNER WALLET (ROLE SAFE)
    // =================================================
    const ownerWallet = await Wallet.findOneAndUpdate(
      { userId: order.vendorId, role: ownerRole },
      {
        $inc: {
          balance: vendorAmount,
          totalEarned: vendorAmount,
        },
        $setOnInsert: {
          userId: order.vendorId,
          role: ownerRole,
          pendingBalance: 0,
        },
      },
      { upsert: true, new: true }
    );

    await Transaction.create({
      type: "CREDIT",
      amount: vendorAmount,
      userId: order.vendorId,
      role: ownerRole,
      source: "ORDER_PAYMENT",
      orderId: order._id,
      walletId: ownerWallet._id,
      status: "COMPLETED",
      reference: `MANUAL_${order._id}_${ownerRole}`,
    });

    // =================================================
    // ✅ PLATFORM WALLET
    // =================================================
    const platformWallet = await Wallet.findOneAndUpdate(
      { role: "platform" },
      {
        $inc: {
          balance: platformAmount,
          totalEarned: platformAmount,
        },
        $setOnInsert: {
          role: "platform",
        },
      },
      { upsert: true, new: true }
    );

    await Transaction.create({
      type: "CREDIT",
      amount: platformAmount,
      userId: platformWallet._id,
      role: "platform",
      source: "COMMISSION",
      orderId: order._id,
      walletId: platformWallet._id,
      status: "COMPLETED",
      reference: `MANUAL_${order._id}_PLATFORM`,
    });

    // =================================================
    // ✅ RIDER (OPTIONAL)
    // =================================================
    if (riderAmount > 0 && order.riderId) {
      const riderWallet = await Wallet.findOneAndUpdate(
        { userId: order.riderId, role: "rider" },
        {
          $inc: {
            balance: riderAmount,
            totalEarned: riderAmount,
          },
          $setOnInsert: {
            userId: order.riderId,
            role: "rider",
          },
        },
        { upsert: true, new: true }
      );

      await Transaction.create({
        type: "CREDIT",
        amount: riderAmount,
        userId: order.riderId,
        role: "rider",
        source: "DELIVERY_FEE",
        orderId: order._id,
        walletId: riderWallet._id,
        status: "COMPLETED",
        reference: `MANUAL_${order._id}_RIDER`,
      });
    }

    // =================================================
    // ✅ SAVE DISTRIBUTION
    // =================================================
    order.distribution = {
      vendorAmount,
      platformAmount,
      riderAmount,
      status: "DISTRIBUTED",
      distributedAt: new Date(),
    };

    await order.save();

    console.log("🎉 MANUAL SPLIT COMPLETED (ROLE SAFE)");

    return NextResponse.json({
      success: true,
      ownerRole,
      orderId: order._id,
    });

  } catch (err: any) {
    console.error("❌ Manual split error:", err);
    return NextResponse.json(
      { error: "Manual split failed", details: err.message },
      { status: 500 }
    );
  }
}