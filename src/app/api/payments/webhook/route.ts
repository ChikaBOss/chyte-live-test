import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";

const COMMISSION_RATES: Record<string, number> = {
  chef: 0.15,
  pharmacy: 0.12,
  vendor: 0.1,
  topvendor: 0.08,
  default: 0.1,
};

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const rawBody = await req.text();

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    await connectToDB();

    const reference = event.data.reference;
    const metadata = event.data.metadata || {};
    const orderId = metadata.orderId;

    const order = await Order.findOne({ "payment.reference": reference });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment?.status === "PAID") {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    const vendorGroups = metadata.vendorGroups || order.vendorGroups || [];
    if (!vendorGroups.length) {
      throw new Error("ORDER_VENDOR_GROUPS_MISSING");
    }

    // ✅ Mark order as paid
    order.payment.status = "PAID";
    order.payment.paidAt = new Date();
    order.status = "COMPLETED";

    const vendorDistributions: any[] = [];

    for (const vendorGroup of vendorGroups) {
      const vendorId = vendorGroup.vendorId;
      const vendorRole = vendorGroup.vendorRole || "vendor";
      const subtotal = vendorGroup.subtotal;

      const commissionRate =
        COMMISSION_RATES[vendorRole] ?? COMMISSION_RATES.default;

      const commissionAmount = subtotal * commissionRate;
      const payoutAmount = subtotal - commissionAmount;

      vendorDistributions.push({
        vendorId,
        vendorName: vendorGroup.vendorName,
        vendorRole,
        amount: subtotal,
        commission: commissionAmount,
        payout: payoutAmount,
      });

      const vendorIndex = order.vendorGroups.findIndex(
        (g: any) => g.vendorId.toString() === vendorId.toString()
      );

      if (vendorIndex !== -1) {
        order.vendorGroups[vendorIndex].commissionRate = commissionRate;
        order.vendorGroups[vendorIndex].commissionAmount = commissionAmount;
        order.vendorGroups[vendorIndex].payoutAmount = payoutAmount;
        order.vendorGroups[vendorIndex].paid = true;
        order.vendorGroups[vendorIndex].paidAt = new Date();
      }

      // ✅ FIXED WALLET UPSERT (Type-safe)
      await Wallet.findOneAndUpdate(
        { userId: vendorId, role: vendorRole },
        {
          $inc: {
            balance: payoutAmount,
            totalEarned: payoutAmount,
          },
          $setOnInsert: {
            userId: vendorId,
            role: vendorRole,
            balance: 0,
            totalEarned: 0,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      // ✅ Vendor transaction
      await Transaction.create({
        userId: vendorId,
        role: vendorRole,
        orderId: order._id,
        type: "CREDIT",
        source: "ORDER_PAYMENT",
        amount: payoutAmount,
        description: `Payment for order #${order.orderNumber || orderId}`,
        status: "COMPLETED",
        metadata: {
          subtotal,
          commissionRate,
          commissionAmount,
        },
      });
    }

    // ✅ Platform commission tracking
    const PLATFORM_USER_ID = process.env.PLATFORM_USER_ID;

    if (PLATFORM_USER_ID) {
      for (const dist of vendorDistributions) {
        await Transaction.create({
          userId: PLATFORM_USER_ID,
          role: "platform",
          orderId: order._id,
          type: "CREDIT",
          source: "COMMISSION",
          amount: dist.commission,
          description: `Commission from ${dist.vendorRole} (${dist.vendorId})`,
          status: "COMPLETED",
          metadata: {
            vendorId: dist.vendorId,
            vendorRole: dist.vendorRole,
          },
        });
      }
    }

    order.distribution = {
      vendorDistributions,
      platformAmount: order.adminFee || 0,
      riderAmount: order.deliveryFee || 0,
      status: "DISTRIBUTED",
      distributedAt: new Date(),
    };

    await order.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json(
      { error: err.message || "Webhook failed" },
      { status: 500 }
    );
  }
}