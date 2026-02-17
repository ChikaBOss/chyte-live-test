import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectToDB } from "@/lib/mongodb";
import Chef from "@/models/Chef";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectToDB();

    const chef = await Chef.findById(session.user.id).select("-password");

    if (!chef) {
      return NextResponse.json(
        { error: "Chef not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(chef, { status: 200 });
  } catch (error) {
    console.error("GET /api/chefs/me error:", error);
    return NextResponse.json(
      { error: "Failed to load chef profile" },
      { status: 500 }
    );
  }
}