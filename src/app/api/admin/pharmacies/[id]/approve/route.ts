import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Pharmacy from "@/models/Pharmacy";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

// =======================
// GET PHARMACY BY ID
// =======================
export async function GET(
  _req: NextRequest,
  context: Context
) {
  try {
    await connectToDB();

    const { id } = await context.params;

    const pharmacy = await Pharmacy.findById(id);

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pharmacy,
    });
  } catch (error) {
    console.error("Get pharmacy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pharmacy" },
      { status: 500 }
    );
  }
}

// =======================
// APPROVE PHARMACY
// =======================
export async function PATCH(
  _req: NextRequest,
  context: Context
) {
  try {
    await connectToDB();

    const { id } = await context.params;

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      id,
      { approved: true },
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
  } catch (error) {
    console.error("Approve pharmacy error:", error);
    return NextResponse.json(
      { error: "Approval failed" },
      { status: 500 }
    );
  }
}