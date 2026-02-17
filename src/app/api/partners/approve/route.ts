// app/api/partners/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import Chef from '@/models/Chef';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    await connectToDB();

    const chef = await Chef.findByIdAndUpdate(
      id,
      { 
        approved: true,
        status: 'approved',
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!chef) {
      return NextResponse.json(
        { error: 'Chef not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Chef approved successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}