// src/app/api/meals/mine/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectToDB } from '@/lib/mongodb';
import Meal from '@/models/meal';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDB();

    const chefId = String(session.user.id);

    // handle ObjectId vs string stored chefId
    const query: any = mongoose.Types.ObjectId.isValid(chefId) ? { chefId: new mongoose.Types.ObjectId(chefId) } : { chefId };

    const meals = await Meal.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(meals);
  } catch (error: any) {
    console.error('❌ GET /api/meals/mine error:', error);
    return NextResponse.json({ error: 'Failed to get meals', message: error.message }, { status: 500 });
  }
}