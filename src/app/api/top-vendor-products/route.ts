import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import TopVendorProduct from "@/models/TopVendorProduct";

export async function GET(req: Request) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const topVendorId = searchParams.get("topVendorId");

  const products = await TopVendorProduct.find({ topVendorId });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  await connectToDB();
  const body = await req.json();
  const product = await TopVendorProduct.create(body);
  return NextResponse.json(product);
}