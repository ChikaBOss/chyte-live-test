import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Pharmacy, { PharmacyDocument } from "@/models/Pharmacy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();

    const { id } = await params;

    const pharmacy: PharmacyDocument | null =
      await Pharmacy.findById(id);

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    // 🔐 Public can only see approved pharmacies
    if (!pharmacy.approved) {
      return NextResponse.json(
        { error: "Pharmacy not approved" },
        { status: 403 }
      );
    }

    return NextResponse.json(pharmacy);
  } catch (error) {
    console.error("GET pharmacy error:", error);
    return NextResponse.json(
      { error: "Failed to load pharmacy" },
      { status: 500 }
    );
  }
}