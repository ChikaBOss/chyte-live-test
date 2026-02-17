import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Pharmacy from "@/models/Pharmacy";
import { connectToDB } from "@/lib/mongodb";

export async function GET() {
  return NextResponse.json(
    { error: "Use POST method to login" },
    { status: 405 }
  );
}

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const pharmacy = await Pharmacy.findOne({ email });
    if (!pharmacy) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, pharmacy.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!pharmacy.approved) {
      return NextResponse.json(
        { error: "Account not approved yet" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      pharmacyId: pharmacy._id,
      email: pharmacy.email,
    });
  } catch (err) {
    console.error("Pharmacy login error:", err);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}