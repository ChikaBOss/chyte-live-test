// /api/vendor-settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Vendor from "@/models/Vendor";

/**
 * GET vendor settings
 */
export async function GET(req: NextRequest) {
  try {
    const vendorId = req.headers.get("x-vendor-id");
    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Convert to plain object and remove sensitive fields
    const vendorObj = vendor.toObject();
    delete vendorObj.password;

    return NextResponse.json(vendorObj);
  } catch (err: any) {
    console.error("GET vendor settings error:", err);
    return NextResponse.json(
      {
        error: "Failed to load vendor settings",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}

/**
 * UPDATE vendor settings
 */
export async function PUT(req: NextRequest) {
  try {
    const vendorId = req.headers.get("x-vendor-id");
    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID required" },
        { status: 400 }
      );
    }

    /**
     * IMPORTANT:
     * Use req.text() instead of req.json()
     * This avoids body size limits that break base64 images
     */
    const raw = await req.text();
    let body: any = {};

    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = {};
    }

    // Debug logs (safe to remove later)
    console.log("Vendor Update Request:", {
      vendorId,
      hasLogo: !!body.logoUrl,
      logoLength: body.logoUrl?.length,
      logoType: body.logoUrl?.startsWith("data:")
        ? "base64"
        : "url",
      fields: Object.keys(body),
    });

    // Fields that must NEVER be updated from client
    const disallowedFields = [
      "_id",
      "password",
      "approved",
      "createdAt",
      "updatedAt",
    ];

    disallowedFields.forEach((field) => delete body[field]);

    await connectToDB();

    // Update vendor safely
    const updatedVendor = await Vendor.findOneAndUpdate(
      { _id: vendorId },
      { $set: body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedVendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Remove sensitive fields before sending back
    const vendorObj = updatedVendor.toObject();
    delete vendorObj.password;

    return NextResponse.json({
      vendor: vendorObj,
      message: "Profile updated successfully",
    });
  } catch (err: any) {
    console.error("PUT vendor settings error:", err);

    if (err.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation failed", details: err.message },
        { status: 400 }
      );
    }

    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate key error" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update vendor settings",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}