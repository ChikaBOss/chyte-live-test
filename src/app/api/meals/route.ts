import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Meal from "@/models/meal";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";

type SessionUser = {
  id?: string;
};

type SessionWithUser = {
  user?: SessionUser;
};

type PostBody = {
  name?: string;
  price?: number | string;
  imageUrl?: string;
  image?: string;
  description?: string;
  preparationTime?: string | number;
  ingredients?: string[] | string;
  available?: boolean;
  serves?: number | string;
};

/* ================= GET MEALS ================= */
export async function GET(req: NextRequest) {
  try {
    await connectToDB();

    let chefId: string | null = null;

    try {
      const session = (await getServerSession(authOptions)) as SessionWithUser | null;
      chefId = session?.user?.id ?? null;
    } catch (err) {
      console.warn("GET /api/meals - session error:", err);
    }

    if (!chefId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const meals = await Meal.find({ chefId })
      .sort({ createdAt: -1 })
      .lean();

    const safeMeals = meals.map((m: any) => {
      const img = m.imageUrl ?? m.image ?? "";
      return {
        ...m,
        _id: m._id?.toString?.() ?? m._id,
        imageUrl: img,
        image: img,
      };
    });

    return NextResponse.json(safeMeals, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/meals error:", err);
    return NextResponse.json(
      { error: "Failed to load meals", details: err?.message },
      { status: 500 }
    );
  }
}

/* ================= CREATE MEAL ================= */
export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const raw = await req.text();
    let body: PostBody = {};

    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = {};
    }

    let chefId: string | null = null;

    try {
      const session = (await getServerSession(authOptions)) as SessionWithUser | null;
      chefId = session?.user?.id ?? null;
    } catch (err) {
      console.warn("POST /api/meals - session error:", err);
    }

    if (!chefId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const price = Number(body.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const ingredients = Array.isArray(body.ingredients)
      ? body.ingredients
      : typeof body.ingredients === "string"
      ? body.ingredients
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean)
      : [];

    const image = (body.imageUrl ?? body.image ?? "").toString().trim();

    const meal = await Meal.create({
      chefId,
      name: body.name.trim(),
      price,
      imageUrl: image,
      description: body.description ?? "",
      preparationTime: Number(body.preparationTime ?? 30),
      ingredients,
      available: body.available ?? true,
      serves: Number(body.serves ?? 1),
      createdAt: new Date(),
    });

    const obj = meal.toObject();
    const img = obj.imageUrl ?? obj.image ?? "";

    return NextResponse.json(
      {
        ...obj,
        _id: obj._id.toString(),
        imageUrl: img,
        image: img,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/meals error:", err);
    return NextResponse.json(
      { error: "Failed to create meal", details: err?.message },
      { status: 500 }
    );
  }
}