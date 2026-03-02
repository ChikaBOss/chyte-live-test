import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectToDB } from '@/lib/mongodb';
import Rider from '@/models/Rider';

export async function GET() {
  try {
    console.log("Profile GET: Starting");
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized - no session' }, { status: 401 });
    }
    if (session.user?.role !== 'rider') {
      return NextResponse.json({ error: 'Unauthorized - wrong role' }, { status: 401 });
    }

    await connectToDB();
    const rider = await Rider.findById(session.user.id).lean();
    if (!rider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    // Return only rider data (no stats yet)
    return NextResponse.json(rider);
  } catch (error: any) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'rider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, vehicle } = await req.json();

    await connectToDB();
    const updated = await Rider.findByIdAndUpdate(
      session.user.id,
      { name, phone, vehicle },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}