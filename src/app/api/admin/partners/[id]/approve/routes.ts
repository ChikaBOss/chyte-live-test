import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Account } from "@/models/Account";
import  requireAuth  from "@/middleware/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string }}) {
  const auth = requireAuth(req, ["admin"]);
  if ("error" in auth) return auth.error;

  await connectToDB();
  const { approved } = await req.json();
  const doc = await Account.findByIdAndUpdate(params.id, { approved: !!approved }, { new: true });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // (optional) send email notification to partner
  return NextResponse.json({ ok: true, id: doc._id, approved: doc.approved });
}