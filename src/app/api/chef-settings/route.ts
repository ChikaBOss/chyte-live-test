// src/app/api/chef-settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectToDB } from "@/lib/mongodb";
import Chef from "@/models/Chef";

/**
 * Explicit session type so TypeScript knows `session.user` exists
 */
type AppSession = {
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
};

/**
 * GET: Fetch chef settings/profile
 */
export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    let chefId: string | null = null;

    // Prefer NextAuth session
    try {
      const session = (await getServerSession(authOptions)) as AppSession | null;
      chefId = session?.user?.id ?? null;
    } catch {
      // Fallback for localStorage-based flow
      chefId = req.headers.get("x-chef-id");
      console.warn(
        "GET /api/chef-settings: session failed, using x-chef-id header"
      );
    }

    if (!chefId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chef = await Chef.findById(chefId).lean();
    if (!chef) {
      return NextResponse.json({ error: "Chef not found" }, { status: 404 });
    }

    // Remove sensitive fields
    const { password, ...safe } = chef as any;

    // Ensure businessHours always exists
    safe.businessHours =
      safe.businessHours ??
      [
        { day: "monday", open: false, openingTime: "09:00", closingTime: "22:00" },
        { day: "tuesday", open: false, openingTime: "09:00", closingTime: "22:00" },
        { day: "wednesday", open: false, openingTime: "09:00", closingTime: "22:00" },
        { day: "thursday", open: false, openingTime: "09:00", closingTime: "22:00" },
        { day: "friday", open: false, openingTime: "09:00", closingTime: "22:00" },
        { day: "saturday", open: false, openingTime: "09:00", closingTime: "22:00" },
        { day: "sunday", open: false, openingTime: "09:00", closingTime: "22:00" },
      ];

    return NextResponse.json(safe, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/chef-settings error:", err);
    return NextResponse.json(
      { error: "Failed to load profile", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update chef settings/profile
 */
export async function PUT(req: NextRequest) {
  try {
    await connectToDB();

    let chefId: string | null = null;

    // Prefer NextAuth session
    try {
      const session = (await getServerSession(authOptions)) as AppSession | null;
      chefId = session?.user?.id ?? null;
    } catch {
      chefId = req.headers.get("x-chef-id");
      console.warn(
        "PUT /api/chef-settings: session failed, using x-chef-id header"
      );
    }

    if (!chefId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Safe JSON parse
    const raw = await req.text();
    let body: any = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = {};
    }

    // Whitelisted updatable fields
    const allowedFields = [
      "displayName",
      "businessName",
      "phone",
      "address",
      "specialties",
      "bio",
      "avatarUrl",
      "instagram",
      "twitter",
      "minOrder",
      "businessHours",
      "experience",
      "category",
      "ownerName",
    ];

    const update: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        update[key] = body[key];
      }
    }

    // Ensure businessHours is valid
    if (
      update.businessHours &&
      !Array.isArray(update.businessHours)
    ) {
      delete update.businessHours;
    }

    const updated = await Chef.findByIdAndUpdate(
      chefId,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Chef not found" }, { status: 404 });
    }

    const { password, ...safe } = updated as any;

    return NextResponse.json({ chef: safe }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/chef-settings error:", err);
    return NextResponse.json(
      { error: "Failed to update profile", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}