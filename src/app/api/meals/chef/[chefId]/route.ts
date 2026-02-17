import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Meal from "@/models/meal";

export async function GET(request: NextRequest) {
  try {
    const chefId = request.nextUrl.pathname.split("/").pop();

    if (!chefId) {
      return NextResponse.json(
        { error: "chefId required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const meals =
      (await Meal.find({ chefId })
        .sort({ createdAt: -1 })
        .lean()) || [];

    // Normalize shape for frontend
    const safe = meals.map((m: any) => {
      const img = m.imageUrl ?? m.image ?? "";

      return {
        _id: m._id?.toString?.() ?? m._id,
        chefId: m.chefId,
        name: m.name,
        price: m.price,
        imageUrl: img,
        image: img,
        description: m.description,
        available: m.available,
        preparationTime: m.preparationTime,
        ingredients: m.ingredients || [],
        serves: m.serves,
        createdAt: m.createdAt,
      };
    });

    return NextResponse.json(safe);
  } catch (err: any) {
    console.error("GET /api/meals/chef/[chefId] error:", err);
    return NextResponse.json(
      {
        error: "Failed to load meals",
        details: err?.message,
      },
      { status: 500 }
    );
  }
}