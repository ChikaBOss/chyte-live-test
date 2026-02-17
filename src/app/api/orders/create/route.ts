// app/api/orders/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import ChildOrder from "@/models/ChildOrder";
import DeliveryJob from "@/models/DeliveryJob";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const body = await req.json();
    console.log("📦 Order creation request:", {
      customer: body.customer?.name,
      itemsCount: body.items?.length,
      vendorGroups: body.vendorGroups?.length,
      totalAmount: body.totalAmount
    });

    const {
      items,
      customer,
      deliveryMethod,
      deliveryFee = 0,
      subtotal,
      adminFee,
      totalAmount,
      paymentMethod = "CARD",
      vendorGroups,      // ✅ Must be present – array of vendor groups
      selectedVendors,
      deliveryDetails,
    } = body;

    // ========== 1. VALIDATIONS ==========
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!vendorGroups || vendorGroups.length === 0) {
      return NextResponse.json(
        { success: false, error: "No vendor groups provided" },
        { status: 400 }
      );
    }

    // ========== 2. PREPARE VENDOR GROUPS FOR PARENT ORDER ==========
    // ✅ Remove any fields that are not in the Order schema
    const parentVendorGroups = vendorGroups.map((group: any) => ({
      vendorId: group.vendorId,
      vendorName: group.vendorName || `Vendor-${group.vendorId}`,
      vendorRole: group.vendorRole || 'vendor',
      vendorBaseLocation: group.vendorBaseLocation || 'Unknown',
      items: group.items?.map((item: any) => ({
        productId: item.productId || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })) || [],
      subtotal: group.subtotal || 0,
      // ❌ Do NOT include vendorLocation – it's not in OrderSchema
    }));

    console.log("📊 Parent order vendorGroups:", {
      count: parentVendorGroups.length,
      roles: parentVendorGroups.map((g: any) => g.vendorRole)
    });

    // ========== 3. CREATE PARENT ORDER ==========
    // ✅ REMOVED: vendorId, vendorRole – these fields do NOT exist in OrderSchema
    const order = await Order.create({
      customer,
      subtotal,
      adminFee,
      totalAmount,
      deliveryMethod,
      status: paymentMethod === "COD" ? "PENDING" : "PENDING_PAYMENT",

      // ✅ Store vendor groups correctly
      vendorGroups: parentVendorGroups,
      selectedVendors: selectedVendors || [],

      payment: {
        provider: paymentMethod === "CARD" ? "PAYSTACK" : "COD",
        status: paymentMethod === "COD" ? "PENDING" : "PENDING",
        method: paymentMethod,
      },

      distribution: {
        vendorAmount: subtotal,
        riderAmount: deliveryFee,
        platformAmount: adminFee,
        status: "PENDING",
      },
    });

    console.log("✅ Parent order created:", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      vendorGroupsCount: order.vendorGroups.length
    });

    // ========== 4. CREATE CHILD ORDERS ==========
    for (const vendor of vendorGroups) {
      // Skip unselected vendors
      if (selectedVendors && !selectedVendors.includes(vendor.vendorId)) continue;

      // ✅ Use the exact role from the vendor group
      const childVendorRole = vendor.vendorRole || 'vendor';

      await ChildOrder.create({
        parentOrderId: order._id,
        vendorId: vendor.vendorId,                 // ✅ string – MongoDB _id
        vendorName: vendor.vendorName,
        vendorRole: childVendorRole,              // ✅ CRITICAL: real role
        items: vendor.items.map((i: any) => ({
          productId: i.productId || i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal: vendor.subtotal,
        deliveryMethod,
        // ✅ Financial fields are NOT set here – they will be calculated by webhook
        // ✅ Status defaults to "PENDING"
        pickupCode: Math.floor(100000 + Math.random() * 900000).toString(),
      });

      console.log("✅ Child order created:", {
        vendorId: vendor.vendorId,
        vendorRole: childVendorRole,
        itemCount: vendor.items.length
      });
    }

    // ========== 5. CREATE DELIVERY JOB (if needed) ==========
    if (deliveryMethod === "SITE_COMPANY" && deliveryDetails?.deliveryAccepted) {
      const job = await DeliveryJob.create({
        orderId: order._id,
        customerName: deliveryDetails.receiverName || customer.name,
        customerPhone: deliveryDetails.receiverPhone || customer.phone,
        dropAddress: deliveryDetails.dropAddress || customer.address,
        customerLocation: deliveryDetails.customerLocation,
        deliveryFee: deliveryDetails.calculatedFee || deliveryFee,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });

      order.deliveryJobId = job._id;
      await order.save();
    }

    // ========== 6. RESPONSE ==========
    return NextResponse.json({
      success: true,
      orderId: order._id,
      amount: totalAmount,
      vendorGroups: parentVendorGroups, // ✅ For debugging
      requiresPayment: paymentMethod === "CARD",
    });

  } catch (error: any) {
    console.error("❌ ORDER CREATE ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Order creation failed" },
      { status: 500 }
    );
  }
}