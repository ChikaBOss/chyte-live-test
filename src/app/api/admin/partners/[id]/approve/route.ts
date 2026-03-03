import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Account } from "@/models/Account";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ check admin
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params; // ✅ await the promise

    await connectToDB();

    const { approved } = await req.json();

    const doc = await Account.findByIdAndUpdate(
      id,
      { approved: !!approved },
      { new: true }
    );

    if (!doc) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: doc._id,
      approved: doc.approved,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed" },
      { status: 500 }
    );
  }
}