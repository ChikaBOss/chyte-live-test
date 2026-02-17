import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import TopVendor from "@/models/TopVendor";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const body = await req.json();
    const {
      businessName,
      ownerName,
      email,
      phone,
      pickupZone,
      pickupPhone,
      pickupAddress,
      password,
    } = body;

    // Check required fields
    if (!businessName || !ownerName || !email || !password || !pickupZone || !pickupPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const exists = await TopVendor.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create top vendor
    await TopVendor.create({
      businessName,
      ownerName,
      email,
      phone,
      pickupZone,
      pickupPhone,
      pickupAddress,
      password: hashedPassword,
      approved: false, // Admin must approve
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Top vendor register error:", err);
    return NextResponse.json(
      { error: "Failed to register top vendor" },
      { status: 500 }
    );
  }
}