import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import TopVendor from "@/models/TopVendor";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function PUT(req: NextRequest) {
  try {
    const vendorId = req.headers.get("x-top-vendor-id");
    if (!vendorId) {
      return NextResponse.json({ error: "Missing vendor ID" }, { status: 400 });
    }

    await connectToDB();

    const body = await req.json();

    // ✅ UPLOAD BASE64 TO CLOUDINARY
    if (body.logoUrl && body.logoUrl.startsWith("data:")) {
      const uploadResult = await uploadToCloudinary(body.logoUrl, {
        folder: "top-vendors",
      });

      // 🔥 THIS IS THE KEY LINE YOU WERE MISSING
      body.logoUrl = uploadResult.secure_url;
    }

    const updatedVendor = await TopVendor.findByIdAndUpdate(
      vendorId,
      { $set: body },
      { new: true }
    );

    return NextResponse.json(updatedVendor);
  } catch (error) {
    console.error("Top vendor update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}