import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Chef from "@/models/Chef";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
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

    // Validate required fields
    if (
      !businessName ||
      !ownerName ||
      !email ||
      !password ||
      !pickupZone ||
      !pickupPhone
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Check if email or business already exists
    const existing = await Chef.findOne({
      $or: [{ email }, { businessName }],
    });

    if (existing) {
      return NextResponse.json(
        { error: "Chef with this email or business already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Chef
    const chef = await Chef.create({
      businessName,
      ownerName,
      email,
      phone,
      pickupZone,
      pickupPhone,
      pickupAddress,
      password: hashedPassword,
      approved: false,   // admin must approve
      role: "chef",
    });

    return NextResponse.json(
      { message: "Chef submitted for approval", id: chef._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Chef register error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}