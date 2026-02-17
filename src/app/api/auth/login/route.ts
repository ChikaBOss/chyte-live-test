import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import { Account } from "@/models/Account";
import bcrypt from "bcryptjs";
import { signToken } from "@/utils/jwt";
import { loginSchema } from "@/utils/validation";

export async function POST(req: NextRequest) {
  await connectToDB();
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await Account.findOne({ email });
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  if (!user.approved) {
    return NextResponse.json({ error: "Account pending approval" }, { status: 403 });
  }

  const token = signToken({ id: String(user._id), role: user.role, approved: user.approved });
  return NextResponse.json({ token, role: user.role, profile: {
    id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, company: user.company
  }});
}