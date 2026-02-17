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
      pickupZone,
      pickupPhone,
      pickupAddress,
      password,
      documents = [],
    } = body;

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

    await Pharmacy.create({
      pharmacyName,
      ownerName,
      email,
      phone,
      pickupZone,
      pickupPhone,
      pickupAddress,
      password: hashedPassword,
      documents: uploadedDocs,
      approved: false,
      role: "pharmacy",
    });

    return NextResponse.json({ success: true, message: "Pharmacy submitted for approval" });
  } catch (err) {
    console.error("Pharmacy register error FULL:", err);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}