// app/api/riders/active/route.ts
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Rider from '@/models/Rider';

export async function GET() {
  try {
    await connectToDB();
    const riders = await Rider.find({ approved: true, isActive: true })
      .select('_id name email phone') // only necessary fields
      .lean();
    return NextResponse.json(riders);
  } catch (error) {
    console.error('Error fetching active riders:', error);
    return NextResponse.json({ error: 'Failed to fetch riders' }, { status: 500 });
  }
}