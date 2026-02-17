import { NextRequest, NextResponse } from "next/server";
import  requireAuth  from "@/middleware/auth";
import { connectToDB } from "@/lib/mongodb";
import { Account } from "@/models/Account";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req); // any logged-in role
  if ("error" in auth) return auth.error;

  await connectToDB();
  const me = await Account.findById(auth.user.id).select("-passwordHash");
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ me });
}