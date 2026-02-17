import { NextResponse } from "next/server";
import Pharmacy from "@/models/Pharmacy";
import { connectToDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectToDB();

    // Fetch only approved pharmacies with pickup fields
    const pharmacies = await Pharmacy.find(
      { approved: true },
      {
        pharmacyName: 1,
        businessName: 1,
        ownerName: 1,
        email: 1,
        phone: 1,
        // UPDATED: Include pickup fields instead of address
        pickupZone: 1,
        pickupAddress: 1,
        pickupPhone: 1,
        logoUrl: 1,
        category: 1,
        specialties: 1,
        minOrder: 1,
        available: 1,
        rating: 1,
        approved: 1,
      }
    ).lean();

    return NextResponse.json(pharmacies);
  } catch (err) {
    console.error("Fetch approved pharmacies error:", err);
    return NextResponse.json(
      { error: "Failed to fetch pharmacies" },
      { status: 500 }
    );
  }
}