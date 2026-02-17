import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Account } from "@/models/Account";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/utils/validation";

export async function POST(req: NextRequest) {
  await connectToDB();
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { firstName, lastName, email, password, role, company } = parsed.data;

  const exists = await Account.findOne({ email });
  if (exists) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const doc = await Account.create({
    firstName, lastName, email, passwordHash, role, company: company || "",
    approved: false, // pending until admin approves
  });

  // (optional) trigger email to admin here
  return NextResponse.json({ ok: true, id: doc._id, approved: doc.approved });
}