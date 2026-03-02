// app/api/admin/riders/[id]/toggle-active/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectToDB } from '@/lib/mongodb';
import Rider from '@/models/Rider';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isActive } = await req.json();

    await connectToDB();
    const rider = await Rider.findByIdAndUpdate(
      params.id,
      { isActive },
      { new: true }
    );

    if (!rider) {
      return NextResponse.json({ error: 'Rider not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, isActive: rider.isActive });
  } catch (error) {
    console.error('Toggle active error:', error);
    return NextResponse.json({ error: 'Failed to toggle status' }, { status: 500 });
  }
}