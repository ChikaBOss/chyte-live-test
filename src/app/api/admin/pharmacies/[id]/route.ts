import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Pharmacy from "@/models/Pharmacy";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

/* ================= GET SINGLE PHARMACY (ADMIN) ================= */
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
    console.error("Admin get pharmacy error:", err);
    return NextResponse.json(
      { error: "Failed to fetch pharmacy" },
      { status: 500 }
    );
  }
}

/* ================= DELETE PHARMACY (REJECT) ================= */
export async function DELETE(
  _req: NextRequest,
  context: Context
) {
  try {
    await connectToDB();

    const { id } = await context.params;

    const deleted = await Pharmacy.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete pharmacy error:", err);
    return NextResponse.json(
      { error: "Failed to delete pharmacy" },
      { status: 500 }
    );
  }
}