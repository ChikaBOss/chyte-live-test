// src/app/api/meals/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Meal from "@/models/meal";

/* ================= UPDATE MEAL ================= */
export async function PUT(request: NextRequest) {
  try {
    const mealId = request.nextUrl.pathname.split("/").pop();
    if (!mealId) {
      return NextResponse.json(
        { error: "Missing meal id" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "Empty request body" },
        { status: 400 }
      );
    }

    await connectToDB();

    const updatedMeal = await Meal.findByIdAndUpdate(
      mealId,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedMeal) {
      return NextResponse.json(
        { error: "Meal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMeal, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/meals/[id] error:", error);
    return NextResponse.json(
      {
        error: "Failed to update meal",
        details: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}

/* ================= DELETE MEAL ================= */
export async function DELETE(request: NextRequest) {
  try {
    const mealId = request.nextUrl.pathname.split("/").pop();
    if (!mealId) {
      return NextResponse.json(
        { error: "Missing meal id" },
        { status: 400 }
      );
    }

    await connectToDB();

    const deletedMeal = await Meal.findByIdAndDelete(mealId).lean();
    if (!deletedMeal) {
      return NextResponse.json(
        { error: "Meal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Meal deleted", id: mealId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/meals/[id] error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete meal",
        details: error?.message ?? String(error),
      },
      { status: 500 }
    );
  }
}