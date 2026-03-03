import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectToDB } from "@/lib/mongodb";
import Rider from "@/models/Rider";

export async function DELETE(
  req: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDB();

    const id = context.params.id;

    const rider = await Rider.findByIdAndDelete(id);

    if (!rider) {
      return NextResponse.json(
        { error: "Rider not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete rider error:", error);

    return NextResponse.json(
      { error: "Failed to delete rider" },
      { status: 500 }
    );
  }
}