import { connectToDB } from "@/lib/mongodb";

export async function GET() {
  await connectToDB();
  return Response.json({ message: "✅ Database connection is working!" });
}