import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import TopVendor from "@/models/TopVendor";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const vendor = await TopVendor.findOne({ email: cleanEmail });

    if (!vendor) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    if (!vendor.approved) {
      return NextResponse.json(
        { error: "Account pending admin approval" },
        { status: 403 }
      );
    }

    const ok = await bcrypt.compare(password, vendor.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ THIS IS THE IMPORTANT PART
    return NextResponse.json({
      vendor: {
        _id: vendor._id,
        businessName: vendor.businessName,
        email: vendor.email,
        approved: vendor.approved,
        isTop: vendor.isTop ?? true,
      },
    });
  } catch (err) {
    console.error("Top vendor login error:", err);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}