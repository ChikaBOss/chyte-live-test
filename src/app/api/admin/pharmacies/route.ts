import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Pharmacy from "@/models/Pharmacy";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _req: NextRequest,
  context: Context
) {
  try {
    await connectToDB();

    const { id } = await context.params;

    const pharmacy = await Pharmacy.findById(id).lean();

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pharmacy);
  } catch (err) {
    console.error("Admin pharmacy fetch error:", err);
    return NextResponse.json(
      { error: "Failed to load pharmacy" },
      { status: 500 }
    );
  }
}