// app/api/chefs/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Chef from "@/models/Chef";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const chef = await Chef.findOne({ email });

    if (!chef) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!chef.approved) {
      return NextResponse.json(
        { error: "Your account is pending approval." },
        { status: 401 }
      );
    }

    // 🔒 Safety check for old / broken accounts
    if (!chef.password || typeof chef.password !== "string") {
      return NextResponse.json(
        { error: "Password not properly set for this account. Please reset password." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, chef.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Remove password before sending to client
    const chefData = chef.toObject();
    delete chefData.password;

    return NextResponse.json({
      message: "Login successful",
      chef: chefData,
    });

  } catch (error) {
    console.error("Chef login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}