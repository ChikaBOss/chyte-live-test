// app/api/partners/accounts/route.ts
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Chef from '@/models/Chef';

export async function GET() {
  try {
    await connectToDB();
    
    const approvedChefs = await Chef.find({
      approved: true
    }).sort({ createdAt: -1 });

    return NextResponse.json(approvedChefs);
  } catch (error) {
    console.error('Error fetching approved chefs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}