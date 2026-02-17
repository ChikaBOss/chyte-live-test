import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Pharmacy from "@/models/Pharmacy";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

/* ================= UNAPPROVE PHARMACY (ADMIN) ================= */
export async function PATCH(
  _req: NextRequest,
  context: Context
) {
  try {
    await connectToDB();

    const { id } = await context.params;

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      id,
      { approved: false }, // ❌ force unapproval
      { new: true }
    );

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      approved: pharmacy.approved,
    });
  } catch (err) {
    console.error("Unapprove pharmacy error:", err);
    return NextResponse.json(
      { error: "Unapproval failed" },
      { status: 500 }
    );
  }
}