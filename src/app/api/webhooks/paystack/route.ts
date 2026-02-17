import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import ChildOrder from "@/models/ChildOrder";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import crypto from "crypto";

const COMMISSION_RATES: Record<string, number> = {
  chef: 0.15,
  pharmacy: 0.12,
  vendor: 0.10,
  topvendor: 0.08,
  default: 0.10
};

export async function POST(req: NextRequest) {
  try {
    // ========== SIGNATURE VERIFICATION ==========
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await req.text();
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log("💰 Webhook Event:", event.event);

    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const { metadata } = event.data;
    const orderId = metadata?.orderId;
    if (!orderId) {
      console.error("❌ No orderId");
      return NextResponse.json({ received: true });
    }

    await connectToDB();

    const parentOrder = await Order.findById(orderId);
    if (!parentOrder) {
      console.error("❌ Order not found");
      return NextResponse.json({ received: true });
    }

    if (parentOrder.status === "PAID") {
      console.log("⚠️ Already paid, skipping");
      return NextResponse.json({ received: true });
    }

    // ========== UPDATE PARENT ORDER ==========
    parentOrder.status = "PAID";
    parentOrder.payment.status = "PAID";
    parentOrder.paidAt = new Date();
    await parentOrder.save();

    // ========== PROCESS CHILD ORDERS ==========
    const childOrders = await ChildOrder.find({ parentOrderId: orderId });
    console.log(`🔍 Found ${childOrders.length} child orders`);

    for (const childOrder of childOrders) {
      if (childOrder.status === "PAID") {
        console.log(`⚠️ Child order ${childOrder._id} already paid, skipping`);
        continue;
      }

      const vendorId = childOrder.vendorId;
      const vendorRole = childOrder.vendorRole || "vendor";
      const subtotal = childOrder.subtotal || 0;

      const commissionRate = COMMISSION_RATES[vendorRole] || COMMISSION_RATES.default;
      const commissionAmount = Number((subtotal * commissionRate).toFixed(2));
      const vendorAmount = Number((subtotal - commissionAmount).toFixed(2));

      // Update child order
      childOrder.commissionRate = commissionRate;
      childOrder.commissionAmount = commissionAmount;
      childOrder.vendorAmount = vendorAmount;
      childOrder.status = "PAID";
      childOrder.paidAt = new Date();
      await childOrder.save();

      // ========== VENDOR WALLET ==========
      const wallet = await Wallet.findOneAndUpdate(
        { userId: vendorId, role: vendorRole },
        { $inc: { balance: vendorAmount, totalEarned: vendorAmount } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // ========== VENDOR TRANSACTION ==========
      await Transaction.create({
        userId: vendorId,
        role: vendorRole,
        orderId: parentOrder._id,
        childOrderId: childOrder._id,
        type: "CREDIT",
        source: "ORDER_PAYMENT",
        amount: vendorAmount,
        description: `Payment for order #${parentOrder.orderNumber || orderId}`,
        status: "COMPLETED",
        metadata: { commissionRate, commissionAmount, subtotal }
      });

      // ========== PLATFORM COMMISSION ==========
      const PLATFORM_USER_ID = process.env.PLATFORM_USER_ID;
      if (PLATFORM_USER_ID) {
        await Transaction.create({
          userId: PLATFORM_USER_ID,
          role: "platform",
          orderId: parentOrder._id,
          childOrderId: childOrder._id,
          type: "CREDIT",
          source: "COMMISSION",
          amount: commissionAmount,
          description: `Commission from ${vendorRole} (${vendorId})`,
          status: "COMPLETED",
          metadata: { vendorId, vendorRole, commissionRate }
        });
      }
    }

    console.log("✅ Webhook processed for order:", orderId);
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ received: true });
  }
}