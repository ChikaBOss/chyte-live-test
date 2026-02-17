import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Pharmacy from "@/models/Pharmacy";
import { uploadToCloudinary } from "@/lib/cloudinary";

/* ================= GET PROFILE ================= */
export async function GET(
  _req: NextRequest,
  context: any
) {
  await connectToDB();

  const { id } = await context.params;

  const pharmacy = await Pharmacy.findById(id).lean();
  if (!pharmacy) {
    return NextResponse.json({ error: "Pharmacy not found" }, { status: 404 });
  }

  const { password, ...safe } = pharmacy as any;
  return NextResponse.json(safe);
}

/* ================= UPDATE PROFILE ================= */
export async function PUT(
  req: NextRequest,
  context: any
) {
  await connectToDB();

  const { id } = await context.params;
  const body = await req.json();

  let logoUrl = body.logoUrl || "";

  /* ===== Upload logo to Cloudinary if provided ===== */
  if (body.logoBase64) {
    const upload = await uploadToCloudinary(body.logoBase64, {
      folder: "pharmacies/logos",
      resource_type: "image",
    });
    logoUrl = upload.secure_url;
  }

  /* ===== Update pharmacy ===== */
  const updated = await Pharmacy.findByIdAndUpdate(
    id,
    {
      pharmacyName: body.pharmacyName,
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      bio: body.bio,
      category: body.category,
      minOrder: body.minOrder,
      businessHours: body.businessHours,
      logoUrl,
    },
    { new: true }
  ).lean();

  return NextResponse.json(updated);
}