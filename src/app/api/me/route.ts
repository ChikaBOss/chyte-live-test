import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { connectToDB } from "@/lib/mongodb";
import { Account } from "@/models/Account";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  await connectToDB();

  const me = await Account.findById(session.user.id).select(
    "-passwordHash"
  );

  if (!me) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ me });
}