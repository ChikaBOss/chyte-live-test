// app/api/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { connectToDB } from "@/lib/mongodb";
import Order from "@/models/orderModel";

async function safeParse(req: NextRequest) {
  const raw = await req.text().catch(() => "");
  if (!raw) return { ok: true, body: null, raw: "" };
  try {
    return { ok: true, body: JSON.parse(raw), raw };
  } catch (err) {
    return { ok: false, error: err, raw };
  }
}

/* ================= POST: CREATE BOOKING ================= */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUserId = session?.user?.id;

    if (!sessionUserId) {
      return NextResponse.json(
        { error: "Please login to book a chef." },
        { status: 401 }
      );
    }

    const parsed = await safeParse(request);
    if (!parsed.ok) {
      console.error("Invalid JSON body for booking:", parsed.raw);
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const body = parsed.body || {};
    const { chefId, date, time, guests, notes } = body;

    if (!chefId || !date || !time || !guests) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    await connectToDB();

    const bookingDoc = new Order({
      customer: {
        name:
          session.user?.name ||
          session.user?.email?.split?.("@")?.[0] ||
          "Customer",
        email: session.user?.email,
        phone: "",
      },
      items: [],
      serviceType: "booking",
      providerId: chefId,
      chefId: chefId,
      status: "pending",
      total: 0,
      date: new Date(date),
      time,
      guests,
      eventAddress:
        typeof notes === "string" && notes.includes("Address:")
          ? notes.split("Address:")[1].trim()
          : undefined,
      notes: notes || "",
      paymentMethod: "pending",
      paymentStatus: "pending",
      createdAt: new Date(),
      createdBy: sessionUserId,
    });

    await bookingDoc.save();

    return NextResponse.json(
      {
        success: true,
        message: "Booking request sent!",
        bookingId: bookingDoc._id,
        booking: bookingDoc,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Booking POST error:", err);
    return NextResponse.json(
      { error: "Failed to send booking request." },
      { status: 500 }
    );
  }
}

/* ================= GET: CHEF BOOKINGS ================= */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUserId = session?.user?.id;

    if (!sessionUserId) {
      return NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    await connectToDB();

    const orders = await Order.find({
      $or: [{ chefId: sessionUserId }, { providerId: sessionUserId }],
      serviceType: "booking",
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders, { status: 200 });
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}