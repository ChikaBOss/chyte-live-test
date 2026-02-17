import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Vendor from "@/models/Vendor";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectToDB();

    const {
      businessName,
      ownerName,
      email,
      phone,
      pickupZone,
      pickupPhone,
      pickupAddress,
      password,
    } = await req.json();

    if (!businessName || !ownerName || !email || !password || !pickupZone || !pickupPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const exists = await Vendor.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { error: "Vendor already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Vendor.create({
      businessName,
      ownerName,
      email,
      phone,
      pickupZone,
      pickupPhone,
      pickupAddress,
      password: hashedPassword,
      approved: false,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Vendor register error:", err);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}