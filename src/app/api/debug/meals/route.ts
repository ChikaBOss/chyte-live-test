import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Meal from '@/models/meal';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    await connectToDB();
    console.log('✅ Database connected');

    // Get ALL meals to see what's in the database
    const allMeals = await Meal.find({});
    console.log('📦 All meals in database:', allMeals);

    return NextResponse.json({
      success: true,
      totalMeals: allMeals.length,
      meals: allMeals
    });
  } catch (error: any) {
    console.error('❌ Database error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}