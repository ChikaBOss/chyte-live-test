import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Pharmacy from "@/models/Pharmacy";

// No need for a custom Params type; we'll inline the type
type PharmacyLean = {
  _id: string;
  approved: boolean;
  password?: string;
  [key: string]: any;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();

    const { id } = await params; // ✅ await the promise

    const pharmacy = (await Pharmacy
      .findById(id)
      .lean()) as PharmacyLean | null;

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    if (!pharmacy.approved) {
      return NextResponse.json(
        { error: "Pharmacy not approved" },
        { status: 403 }
      );
    }

    const { password, ...safe } = pharmacy;
    return NextResponse.json(safe);
  } catch (err) {
    console.error("GET pharmacy error:", err);
    return NextResponse.json(
      { error: "Failed to load pharmacy" },
      { status: 500 }
    );
  }
}