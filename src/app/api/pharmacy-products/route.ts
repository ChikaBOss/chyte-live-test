import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import PharmacyProduct from "@/models/PharmacyProduct";

export async function GET(req: Request) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const pharmacyId = searchParams.get("pharmacyId");

  if (!pharmacyId) {
    return NextResponse.json(
      { error: "Missing pharmacyId" },
      { status: 400 }
    );
  }

  const products = await PharmacyProduct.find({ pharmacyId })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  await connectToDB();
  const body = await req.json();

  const {
    pharmacyId,
    name,
    price,
    description,
    imageUrl,
    available,
    category,
    stock,
    tags,
    manufacturer,
    expiryDate,
    prescriptionRequired,
  } = body;

  if (!pharmacyId || !name || !price) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const product = await PharmacyProduct.create({
    pharmacyId,
    name,
    price,
    description,
    imageUrl: imageUrl || "",
    available,
    category,
    stock,
    tags,
    manufacturer,
    expiryDate,
    prescriptionRequired,
  });

  return NextResponse.json(product, { status: 201 });
}