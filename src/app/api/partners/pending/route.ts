// app/api/partners/pending/route.ts
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Chef from '@/models/Chef';

export async function GET() {
  try {
    await connectToDB();
    
    const pendingChefs = await Chef.find({
      approved: false,
      status: 'pending'
    }).sort({ createdAt: -1 });

    return NextResponse.json(pendingChefs);
  } catch (error) {
    console.error('Error fetching pending chefs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}