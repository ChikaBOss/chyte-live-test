import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import VendorProduct from "@/models/VendorProduct";

export async function GET(req: NextRequest) {
  try {
    const vendorId = req.nextUrl.searchParams.get("vendorId");
    
    // ✅ REMOVE THIS - Vendor ID should be optional to allow other queries
    // if (!vendorId) {
    //   return NextResponse.json({ error: "vendorId required" }, { status: 400 });
    // }

    await connectToDB();

    let query = {};
    if (vendorId) {
      query = { vendorId };
    }
    // If no vendorId, return all products (useful for admin views)

    const products = await VendorProduct.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(products);
  } catch (err) {
    console.error("GET vendor products error:", err);
    return NextResponse.json(
      { error: "Failed to load products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      vendorId, 
      name, 
      price, 
      description, 
      imageUrl, 
      available,
      category,
      stock,
      tags,
      unit
    } = body;

    if (!vendorId || !name || !price) {
      return NextResponse.json(
        { error: "vendorId, name and price required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const product = await VendorProduct.create({
      vendorId,
      name,
      price,
      description: description || "",
      imageUrl: imageUrl || "",
      available: available !== undefined ? available : true,
      category: category || "",
      stock: stock !== undefined ? stock : 0,
      tags: tags || [],
      unit: unit || "item",
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("POST vendor product error:", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}