import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Pharmacy from "@/models/Pharmacy";
import { connectToDB } from "@/lib/mongodb";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();

    const {
      pharmacyName,
      ownerName,
      email,
      phone,
      // UPDATED: Replace address with pickup fields
      pickupZone,
      pickupPhone,
      pickupAddress,
      password,
      documents = [],
    } = body;

    // UPDATED: Add pickup fields to validation
    if (!pharmacyName || !ownerName || !email || !password || !pickupZone || !pickupPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const exists = await Pharmacy.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { error: "Pharmacy already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    /* ================= UPLOAD DOCUMENTS ================= */

    const uploadedDocs = [];

    for (const doc of documents) {
      if (!doc?.data) continue;

      const upload = await uploadToCloudinary(doc.data, {
        folder: "pharmacies/documents",
        resource_type: "auto",
      });

      uploadedDocs.push({
        name: doc.name,
        type: doc.type,
        url: upload.secure_url,
        publicId: upload.public_id,
      });
    }

    /* ================= SAVE ================= */

    await Pharmacy.create({
      pharmacyName,
      ownerName,
      email,
      phone,
      // UPDATED: Save pickup fields instead of address
      pickupZone,
      pickupPhone,
      pickupAddress,
      password: hashedPassword,
      documents: uploadedDocs, // ✅ Cloudinary URLs ONLY
      approved: false,
    });

    return NextResponse.json({ 
      success: true,
      message: "Pharmacy registration submitted for approval"
    });
  } catch (err) {
    console.error("Pharmacy register error:", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}