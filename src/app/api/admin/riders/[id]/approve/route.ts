import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectToDB } from "@/lib/mongodb";
import Rider from "@/models/Rider";

export async function PATCH(
  req: NextRequest,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const id = context.params.id;

    const rider = await Rider.findByIdAndUpdate(
      id,
      {
        approved: true,
        status: "approved",
        approvedAt: new Date(),
        approvedBy: session.user.id,
      },
      { new: true }
    );

    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, rider });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to approve rider" },
      { status: 500 }
    );
  }
}