// /app/api/meals/my-meals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDB } from "@/lib/mongodb";
import Meal from "@/models/meal";
import { authOptions } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  try {
    console.log("🔐 Checking session for my-meals...");
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error('❌ No session found - user not authenticated');
      return NextResponse.json(
        { error: "You must be logged in to view meals" },
        { status: 401 }
      );
    }

    const chefId = session.user.id;
    console.log("👨‍🍳 Fetching meals for chef (from session):", chefId);

    await connectToDB();

    const chefMeals = await Meal.find({ chefId: chefId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📦 Found ${chefMeals.length} meals for chef ${chefId}`);
    
    return NextResponse.json(chefMeals);
  } catch (error: any) {
    console.error("❌ GET /api/meals/my-meals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch meals", message: error?.message },
      { status: 500 }
    );
  }
}