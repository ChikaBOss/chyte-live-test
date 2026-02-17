import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    const reference = new URL(req.url).searchParams.get("reference");
    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // Verify with Paystack
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    if (paystackRes.data.data.status !== "success") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }

    await connectToDB();
    const order = await Order.findOne({ "payment.reference": reference });

    return NextResponse.json({
      success: true,
      orderId: order?._id,
      status: order?.status,
      paid: order?.payment?.status === "PAID"
    });

  } catch (err: any) {
    console.error("❌ Verify error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}