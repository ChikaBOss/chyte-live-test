import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectToDB();

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database not initialized");
    }

    // ✅ FIX: cast filter to any to avoid ObjectId type error
    const settings = await db
      .collection("adminSettings")
      .findOne({ _id: "global" } as any);

    return NextResponse.json({
      success: true,
      settings: {
        serviceFee: settings?.platformFee ?? 0,
      },
    });
  } catch (error) {
    console.error("Error fetching public settings:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load settings",
      },
      { status: 500 }
    );
  }
}