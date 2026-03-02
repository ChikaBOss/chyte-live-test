import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectToDB } from '@/lib/mongodb';
import Rider from '@/models/Rider';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const riders = await Rider.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(riders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch riders' }, { status: 500 });
  }
}