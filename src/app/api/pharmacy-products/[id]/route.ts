import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import PharmacyProduct from "@/models/PharmacyProduct";

export async function PUT(
  req: Request,
  context: any
) {
  await connectToDB();

  const { id } = await context.params;
  const body = await req.json();

  const updated = await PharmacyProduct.findByIdAndUpdate(
    id,
    body,
    { new: true }
  );

  if (!updated) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  context: any
) {
  await connectToDB();

  const { id } = await context.params;

  await PharmacyProduct.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}