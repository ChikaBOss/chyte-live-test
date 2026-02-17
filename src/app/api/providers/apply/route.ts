import { NextRequest } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Provider from "@/models/providerModel";

export async function POST(req: NextRequest) {
  await connectToDB();
  const data = await req.json();
  const newProvider = await Provider.create(data);
  return Response.json({ message: "Application submitted", provider: newProvider });
}